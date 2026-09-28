---
title: 안드로이드와 iOS에 같은 푸시를 보낼 수 없었다
description: 한쪽은 data-only, 한쪽은 notification. 같은 알림인데 페이로드를 갈라야 했던 이유.
order: 3
date: 2026-09-22
---

FCM 은 하나의 API 로 안드로이드와 iOS 에 다 보낼 수 있습니다.
그래서 처음엔 페이로드 하나로 끝날 줄 알았습니다. 안 됐습니다.

원인은 **"알림이 화면에 계속 남아 있으면 좋겠다"** 는 요구 하나였습니다.
아침에 알림을 보고 다시 잠들어도, 나갈 때 한 번 더 보이면 좋으니까요.

## 안드로이드 — `notification` 을 넣으면 안 된다

안드로이드에서 알림을 상주시키려면 `ongoing: true` 플래그가 필요한데,
이건 **앱이 알림을 직접 조립할 때만** 붙일 수 있습니다.

그런데 FCM 페이로드에 `notification` 필드가 들어 있으면,
앱이 백그라운드일 때 **OS 가 알림을 대신 그려 버립니다.** 앱 코드는 실행조차 안 됩니다.
그러면 `ongoing` 을 붙일 기회가 없습니다.

그래서 안드로이드는 `data` 만 보냅니다.

```json
{
  "message": {
    "token": "<fcm_token>",
    "android": { "priority": "high" },
    "data": {
      "type": "DAILY_WEATHER",
      "title": "오늘 아침 5도예요",
      "body": "선선한 날씨니 얇은 겉옷을 챙기는건 어떨까요?",
      "ongoing": "true",
      "sendDate": "2026-09-20"
    }
  }
}
```

- `notification` 필드 **없음** — 이게 핵심입니다
- `priority: high` — 이게 없으면 Doze 모드에서 앱이 안 깨어납니다
- `data` 값은 **전부 문자열** — FCM 제약입니다. 숫자도 따옴표를 씌웁니다

앱은 `onBackgroundMessage` 에서 이 값을 받아 로컬 알림으로 직접 조립합니다.

## iOS — 반대로 해야 한다

그럼 iOS 도 `data`-only 로 하면 되지 않나 싶었는데, 여기선 그게 함정이었습니다.

iOS 의 `data`-only 는 **무음 푸시(silent push)** 입니다.
그리고 Apple 은 무음 푸시에 대해 **배달을 보장하지 않고 스로틀링한다고 문서에 명시**해 뒀습니다.
"아침 7시 정각에 도착" 이 목적인데, 도착을 보장 못 하는 경로를 쓸 수는 없습니다.

```json
{
  "message": {
    "token": "<fcm_token>",
    "notification": {
      "title": "오늘 아침 5도예요",
      "body": "선선한 날씨니 얇은 겉옷을 챙기는건 어떨까요?"
    },
    "apns": {
      "headers": { "apns-priority": "10" },
      "payload": {
        "aps": { "interruption-level": "time-sensitive", "sound": "default" }
      }
    }
  }
}
```

- `interruption-level: time-sensitive` 는 **iOS 15+** 이고,
  Xcode 에서 **Time Sensitive Notifications capability 를 켜야** 동작합니다. 안 켜면 그냥 무시됩니다
- iOS 에 `ongoing` 개념은 없습니다. 배너는 사라지지만
  **알림센터에는 사용자가 지울 때까지 남습니다** — iOS 에서의 "상주" 는 이쪽입니다

## 그래서 DB 에 남은 컬럼 하나

플랫폼별로 페이로드가 갈리니, 보낼 때 **이 기기가 어느 플랫폼인지 반드시 알아야** 합니다.

```text
devices.platform  VARCHAR(8)  -- ANDROID | IOS
```

처음엔 "통계용으로 있으면 좋겠다" 정도로 생각했던 컬럼인데,
설계를 끝내고 보니 **없으면 발송 자체가 불가능한** 필수 필드였습니다.

## 실패했을 때

FCM 은 토큰이 죽어도 HTTP 200 을 주는 경우가 있어서, 응답 본문의 오류 코드를 봐야 합니다.

| 오류 | 의미 | 처리 |
|---|---|---|
| `UNREGISTERED` | 앱 삭제·재설치로 토큰 사망 | 연속 실패 카운터 증가 |
| `INVALID_ARGUMENT` | 토큰 형식 오류 | 동일 |
| `UNAVAILABLE` / `INTERNAL` | FCM 일시 장애 | 재시도 대상 |
| `QUOTA_EXCEEDED` | 전송 한도 | 백오프 후 재시도 |

연속 실패가 쌓이면 기기를 `active = false` 로 내립니다.
여기서 빠뜨리기 쉬운 게 하나 있습니다.

> **성공하면 카운터를 0으로 리셋해야 합니다.**

안 그러면 몇 달에 걸쳐 어쩌다 한 번씩 실패한 게 누적돼서,
멀쩡히 잘 받고 있는 기기가 어느 날 조용히 꺼집니다.
