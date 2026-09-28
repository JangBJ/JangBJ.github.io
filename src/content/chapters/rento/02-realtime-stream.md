---
title: 단말에서 관제 화면까지, 실시간 경로 만들기
description: HTTP 수집 → RabbitMQ → SSE. 중간에 큐를 한 번 끼운 이유.
order: 2
category: 개발
date: 2025-05-28
---

관제 화면은 지도 위 차량 아이콘이 알아서 움직여야 합니다.
새로고침을 눌러야 갱신되면 그건 관제가 아니라 조회죠.

경로는 이렇게 잡았습니다.

```text
차량 단말 ──HTTP POST──► rento-pub ──AMQP──► rento-sub ──SSE──► 관제 화면
                          (수집)     큐       (소비)
```

## 왜 큐를 끼웠나

`rento-pub` 이 이벤트를 받자마자 바로 SSE 로 밀어도 됩니다. 한 대만 있으면요.

문제는 **수신과 전달의 속도가 다르다**는 점이었습니다.
단말은 자기 주기대로 계속 올리는데, 관제 화면을 열어 둔 관리자는 0명일 수도 있고
여러 명일 수도 있습니다. 붙어 있는 화면이 느리면 그 대기가 수집 응답까지 번집니다.

그래서 수집은 큐에 넣는 것까지만 책임지고 끝냅니다.

```java
@Async
public void send(EventCommand.CycleEventCommand command, Long mdn, DeviceToken deviceToken) {
    List<CycleData> cycleData = command.toCycleInfoEntities(deviceToken);
    CycleEvent cycle = command.of(deviceToken, mdn, cycleData);

    rabbitTemplate.convertAndSend("", "cycle-info-stream", cycle);
    log.debug("실시간 관제 데이터 보내기: {}", cycle);
}
```

`@Async` 까지 붙여서, 큐에 넣는 것조차 단말 응답 경로에서 빼냈습니다.
단말 입장에서는 "받았다" 만 빠르게 돌려받고 끝입니다.

## 왜 WebSocket 이 아니라 SSE 인가

관제 화면에서 필요한 건 **서버 → 브라우저 한 방향**뿐입니다.
차량 위치가 내려오기만 하면 되고, 브라우저가 실시간으로 뭘 올려보낼 일이 없습니다.

WebSocket 은 양방향을 위해 프로토콜을 업그레이드하고 연결 상태를 따로 관리해야 합니다.
한 방향이면 SSE 가 더 싸게 끝납니다. 끊기면 브라우저가 알아서 재연결하는 것도 공짜로 따라옵니다.

```java
@GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter subscribe(@RequestParam("token") String token) { ... }
```

구독은 **회사 단위**로 묶었습니다. 관리자는 자기 회사 차량만 봐야 하니까
`managerId` 와 `companyId` 를 함께 들고 emitter 를 등록해 둡니다.

## 남은 것

emitter 를 메모리에 들고 있는 구조라 **서버를 여러 대로 늘리면 그대로는 안 됩니다.**
1번 서버에 구독한 관리자는 2번 서버가 소비한 이벤트를 못 받거든요.

지금은 단일 인스턴스 전제로 두고, 늘릴 때 큐를 팬아웃 익스체인지로 바꿔서
모든 인스턴스가 같은 이벤트를 받게 하는 걸 다음 과제로 남겼습니다.
