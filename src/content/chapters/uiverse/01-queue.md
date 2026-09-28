---
title: 평소엔 꺼져 있고, 몰릴 때만 켜지는 대기열
description: Redis 리스트로 만든 작업 큐. 재시도 3회와 Dead Letter Queue까지, 그리고 지금 보면 틀린 곳.
order: 1
date: 2025-04-10
---

쇼핑몰에서 사람이 몰리는 건 상시가 아니라 **특정 순간**입니다.
평소엔 한산하다가 특가가 열리면 갑자기 몰립니다.

그래서 모든 요청을 큐에 태우지 않기로 했습니다. 평소엔 그냥 바로 처리하고,
**부하가 임계치를 넘을 때만** 큐를 태웁니다.

```java
// 부하에 따른 로직 결정
public boolean useQueue() {
    return getCurrentActiveRequests() > 50;
}
```

동시 요청 수가 50을 넘으면 그때부터 큐를 경유합니다.
한산할 때 큐를 거치는 건 지연만 늘리는 일이라서요.

## 자료구조 세 개

Redis에 자료구조 세 개를 두고 작업의 상태를 나눴습니다.

```text
taskQueue       List   대기 중       rightPush → leftPop (FIFO)
taskProcessing  Set    처리 중
taskDeadLetter  List   3회 실패      재투입 대기
```

꺼낼 때 큐에서 빼고 **곧바로 처리 중 집합에 넣습니다.**

```java
public Task dequeueTask() {
    Object obj = redisTemplate.opsForList().leftPop(TASK_QUEUE);
    if (obj != null) {
        Task task = (Task) obj;
        redisTemplate.opsForSet().add(PROCESSING_SET, task);
        return task;
    }
    return null;
}
```

큐에서 빼기만 하면 그 작업이 어디로 갔는지 추적이 안 됩니다.
처리 중 집합이 있어야 "지금 몇 건이 돌고 있는지" 를 볼 수 있습니다.

## 실패하면

바로 버리지 않고 **3번까지 다시 태웁니다.** 그래도 안 되면 따로 모읍니다.

```java
public void failTask(Task task) {
    redisTemplate.opsForSet().remove(PROCESSING_SET, task);

    if (task.getRetryCount() < 3) {
        task.markAsRetry();
        redisTemplate.opsForList().rightPush(TASK_QUEUE, task);   // 큐 맨 뒤로
    } else {
        task.markAsFailed();
        redisTemplate.opsForList().rightPush(DEAD_LETTER_QUEUE, task);
    }
}
```

재시도할 때 **맨 앞이 아니라 맨 뒤로** 넣은 게 의도한 부분입니다.
실패한 작업을 앞에 꽂으면 그게 계속 실패할 때 뒤의 멀쩡한 작업들이 굶습니다.

Dead Letter Queue에 들어간 건 `requeueDeadLetter(taskId)` 로 다시 꺼내
큐에 태울 수 있게 해 뒀습니다. 원인을 고친 뒤 수동으로 재처리하는 용도입니다.

## 지금 보면 틀린 곳

만들 때는 못 봤는데, 다시 읽으니 문제가 세 개 보입니다.

**하나 — 임계치 판정이 서버 1대 기준입니다.**

```java
private final AtomicInteger activeRequests = new AtomicInteger(0);
```

`AtomicInteger` 는 그 JVM 안에서만 유효합니다. 서버를 2대로 늘리면
각자 자기가 받은 요청만 세기 때문에, 전체로는 100건이 몰려도
각 서버는 50으로 보고 **둘 다 큐를 안 켭니다.**
큐 자체는 Redis에 있는데 정작 켜고 끄는 판단은 로컬에 있는 게 앞뒤가 안 맞습니다.
이 카운터도 Redis로 옮겨야 맞습니다.

**둘 — `leftPop` 과 처리 중 집합 추가가 원자적이지 않습니다.**

둘 사이에 프로세스가 죽으면 그 작업은 큐에도 없고 처리 중 집합에도 없습니다.
그냥 사라집니다. Redis의 `LMOVE` 처럼 한 번에 옮기는 명령을 쓰거나
Lua 스크립트로 묶어야 합니다.

**셋 — 작업 하나 찾는 데 전부 훑습니다.**

`getTaskById` 는 처리 중 집합 → 대기 큐 → DLQ 를 차례로 선형 탐색합니다.
큐가 길어질수록 그대로 느려집니다.
작업 본문을 `taskId` 키의 해시에 따로 두고, 큐에는 ID만 넣었어야 했습니다.

## 남기는 이유

셋 다 고치지 못한 채로 프로젝트가 끝났습니다.
그래도 "대기열을 만들어 봤다" 로 끝내는 것보다는
**어디까지 맞았고 어디부터 틀렸는지**를 적어 두는 쪽이 다음에 도움이 될 것 같아 남깁니다.

맞게 잡은 건 상태를 세 갈래로 나눈 것과, 재시도를 뒤로 보낸 것.
틀린 건 전부 **분산 환경을 전제하지 않은 것**에서 나왔습니다.
