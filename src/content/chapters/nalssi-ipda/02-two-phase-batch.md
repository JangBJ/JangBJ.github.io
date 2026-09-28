---
title: 날씨를 가져오는 일과 알림을 보내는 일을 떼어 놓기
description: 기상청이 죽어도 알림은 나가야 한다. 배치를 두 단계로 나눈 이유와 중복 발송을 막는 두 겹의 방어선.
order: 2
date: 2026-09-21
---

처음 떠올린 구조는 단순했습니다. 7시에 배치가 돌면서
사용자별로 기상청 API 를 호출하고, 받은 값으로 문구를 만들어 보낸다.

이게 안 되는 이유가 두 가지였습니다.

**하나.** 사용자가 1만 명이면 7시 정각에 외부 API 를 1만 번 칩니다.
공공데이터포털 개발계정 일일 한도가 1만 건입니다. 하루치를 아침 1분에 다 씁니다.

**둘.** 기상청이 느려지거나 죽으면 **알림이 같이 안 나갑니다.**
날씨를 못 가져온 것과 알림을 못 보낸 것은 다른 사고인데, 한 배치에 묶어 두면 같은 사고가 됩니다.

## 두 단계로 자르기

```text
[배치 1] 05:10  전국 격자 예보 수집  ──► weather_forecasts (UPSERT)
                     ▲
                기상청 API허브                    외부 호출은 여기서 끝
                                                  ─────────────────
[배치 2] 매 분   발송 대상 추출 ──► DB 읽기만 ──► FCM ──► 기기
```

발송 배치는 **외부 API 를 한 번도 호출하지 않습니다.** DB 만 읽습니다.
기상청이 죽어 있어도 어제 수집해 둔 값으로 알림은 나갑니다.
(값이 하루 묵는 건 문제지만, 아예 안 가는 것보다는 낫다고 봤습니다.)

### 05:10 인 이유

기상청 단기예보 발표시각은 02·05·08·11·14·17·20·23시이고,
**각 발표 +10분 뒤부터** 제공됩니다. 07시 발송에 쓸 가장 최신 발표본이 05시본이라
05:10 이 가장 이른 시각입니다.

## 발송 배치가 매 분 도는 이유

알림 시각을 사용자가 바꿀 수 있게 했고(`D9`), 기준 타임존도 **기기 타임존**으로 뒀습니다(`D10`).
그래서 "지금이 발송 시각인 사용자" 가 사용자마다 다릅니다. 07:00 에 한 번 도는 배치로는 안 됩니다.

```sql
SELECT u.id, ns.timezone, ul.grid_nx, ul.grid_ny
FROM users u
JOIN notification_settings ns ON ns.user_id = u.id
JOIN user_locations       ul ON ul.user_id = u.id
WHERE u.deleted_at IS NULL
  AND ns.enabled = true
  AND ul.is_in_service_area = true
  AND to_char(now() AT TIME ZONE ns.timezone, 'HH24:MI')
      = to_char(ns.send_time, 'HH24:MI')
  AND EXTRACT(ISODOW FROM (now() AT TIME ZONE ns.timezone))::smallint
      = ANY(ns.days_of_week)
  AND NOT EXISTS (
        SELECT 1 FROM notification_logs nl
        WHERE nl.user_id = u.id
          AND nl.send_date = (now() AT TIME ZONE ns.timezone)::date
      );
```

`now() AT TIME ZONE ns.timezone` 으로 **사용자 로컬 시각**을 만들어 비교합니다.
발송 이력의 날짜도 UTC 날짜가 아니라 사용자 로컬 날짜로 기록해야 합니다.
안 그러면 UTC 자정을 넘나드는 타임존에서 하루가 어긋납니다.

## 두 번 보내지 않기

매 분 도는 배치가 같은 사람에게 두 번 보내면 안 됩니다. 방어선을 두 겹으로 뒀습니다.

1. **쿼리의 `NOT EXISTS`** — 오늘 이미 보낸 사람은 애초에 대상에서 빠집니다
2. **`notification_logs` 의 `UNIQUE (user_id, send_date)`** — 배치 인스턴스가 동시에 두 개 뜨면
   1번은 둘 다 통과합니다. 그때 DB 제약이 두 번째를 막습니다

1번만 있으면 조회와 INSERT 사이 틈에서 중복이 납니다.
2번만 있으면 매번 예외를 던지고 잡아야 합니다. 둘 다 둔 이유입니다.

## 이력 테이블이 두 개인 이유

중복 차단은 **사용자 단위**인데(`D20`), 발송은 **기기 단위**입니다(`D6` — 한 사람이 폰과 태블릿을 함께 쓸 수 있음).

한 테이블로 합치면 `UNIQUE` 를 둘 중 하나에만 걸 수 있습니다.
사용자+날짜에 걸면 기기가 여러 개일 때 한 대밖에 기록을 못 남기고,
기기+날짜에 걸면 중복 차단이 안 됩니다.

```text
notification_logs        사용자 · 날짜 단위   UNIQUE(user_id, send_date)   → 멱등성
notification_deliveries  기기 단위            status / retry_count         → 재시도 대상
```

나눠 두니 재시도 배치가 `status = 'FAILED'` 인 delivery 만 집어 가면 됩니다.
한 기기가 실패했다고 전체를 다시 보내지 않습니다.
