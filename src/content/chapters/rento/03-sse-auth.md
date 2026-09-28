---
title: SSE 구독에 Authorization 헤더를 못 붙인다
description: EventSource 스펙의 제약을 만나고, 토큰을 쿼리 파라미터로 받되 그 대가를 어디까지 감수할지 정한 기록.
order: 3
category: 트러블슈팅
date: 2025-06-05
---

관제 화면 구독을 붙이는데 401 만 돌아왔습니다.
다른 API 는 다 되는데 `/api/stream/subscribe` 만 안 됐습니다.

## 원인

브라우저의 `EventSource` 는 **커스텀 헤더를 붙일 수 없습니다.**

```js
// 이게 안 됩니다. EventSource 에 headers 옵션이 없습니다.
new EventSource('/api/stream/subscribe', {
  headers: { Authorization: `Bearer ${token}` },
});
```

`fetch` 나 `XMLHttpRequest` 와 달리 `EventSource` 생성자는 URL 과
`withCredentials` 밖에 받지 않습니다. 스펙이 그렇습니다.
그러니 `Authorization` 헤더를 기대하는 시큐리티 필터에는 애초에 아무것도 도착하지 않습니다.

## 선택지

세 가지를 놓고 봤습니다.

1. **쿠키로 인증** — `withCredentials: true` 로 세션 쿠키를 태운다
2. **토큰을 쿼리 파라미터로** — `?token=...`
3. **EventSource 를 버리고** fetch 스트리밍이나 WebSocket 으로 간다

1번은 이미 JWT 를 헤더로 쓰는 다른 API 와 인증 방식이 갈라집니다.
CSRF 도 따로 봐야 하고요. 3번은 이 화면 하나 때문에 클라이언트 구현을 통째로 바꾸는 일이라
남은 기간에 하기엔 컸습니다.

2번으로 갔습니다.

## 대신 감수한 것

토큰이 URL 에 들어가면 **액세스 로그와 브라우저 히스토리에 그대로 남습니다.**
공짜가 아니라는 걸 알고 고른 선택이라, 줄일 수 있는 것만 줄였습니다.

```java
@GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter subscribe(@RequestParam("token") String token) {

    if (token == null || token.isBlank()
            || jwtUtil.isExpired(token)
            || !"access".equals(jwtUtil.getCategory(token))) {
        throw new DomainException(ErrorType.EXPIRED_TOKEN_ACCESS);
    }
    ...
}
```

- **access 토큰만 허용** — `getCategory` 로 확인합니다. refresh 토큰이 URL 에 실려
  로그에 남는 건 수명이 길어서 훨씬 위험합니다. 그건 막았습니다.
- **만료를 여기서 직접 검사** — 시큐리티 필터를 안 타는 경로라 컨트롤러가 직접 봅니다.
- 이 엔드포인트만 필터 체인에서 열어 두고, 나머지는 기존대로 헤더 인증을 유지했습니다.

## 지금 생각

남은 리스크는 여전히 **access 토큰이 로그에 남는다**는 것입니다.
수명이 짧다는 게 유일한 방어라, 제대로 하려면 구독 전용 **1회용 단기 티켓**을
따로 발급하는 게 맞습니다. `POST /stream/ticket` 으로 30초짜리를 받아서
그걸 쿼리에 싣는 식으로요.

기간 안에 거기까진 못 갔고, "왜 이렇게 뒀는지" 와 "뭐가 남았는지" 를 적어 두는 걸로 정리했습니다.
