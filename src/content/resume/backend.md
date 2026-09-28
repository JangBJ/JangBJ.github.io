---
# ─────────────────────────────────────────────────────────────
#  경력기술서 — 채워 넣는 곳
#
#  ⚠️  draft: true 라서 지금은 사이트에 공개되지 않습니다.
#      (개발 서버 `npm run dev` 에서는 보입니다 — 모양 확인용)
#      내용을 채운 뒤 아래 draft 줄을 지우면 /resume 에 실립니다.
#
#  회사 경력은 본인만 아는 내용이라 비워 뒀습니다.
#  skills 와 RENTO 항목은 저장소에서 확인된 사실로 미리 채워 뒀으니
#  틀린 게 있으면 고치세요.
# ─────────────────────────────────────────────────────────────
title: 경력기술서
summary: 어떤 문제를 맡았고, 무엇을 선택했고, 무엇이 달라졌는지.
updated: 2026-09-28
draft: true

# 요약 — 문서 맨 앞. 첫 줄은 경력 요약, 나머지는 "무엇을 하는 개발자인지".
intro:
  # TODO: 본인 경력으로 고치세요. 예시 형식만 남겨 둡니다.
  - 경력 ○년 ○개월 · Backend Developer (2025.○○ – 재직 중)
  - 어떤 도메인에서 무엇을 만들고 있는지 한 줄.
  - 어떤 구조를 선호하는지, 무엇을 기준으로 판단하는지 한 줄.

# 핵심 역량 — 묶음 하나가 카드 한 장, 항목 하나가 칩 하나.
skills:
  - label: Language
    items: [Java, Go, Dart]
  - label: Framework
    items: [Spring Boot, Spring Data JPA, Spring Security, Flutter]
  - label: Database
    items: [MySQL, PostgreSQL, Redis]
  - label: Messaging
    items: [RabbitMQ, SSE, FCM]
  - label: Infra
    items: [Docker, GitHub Actions, Grafana]
  - label: 협업
    items: [Git, GitHub, Notion, Slack]

# 경력 — 회사 하나에 프로젝트 카드 여러 장.
# 프로젝트 카드: 개요 → 역할·인원·기술 → 주요 업무 → 성과 → 문제 해결.
# 비워 둔 필드는 화면에서 그 줄이 통째로 빠집니다.
career:
  - company: '' # TODO: 회사명
    role: Backend Developer
    period: '' # TODO: 2025.○○ – 재직 중
    note: '' # TODO: 담당 도메인 · 팀 구성 한 줄
    projects:
      - name: '' # TODO: 프로젝트명
        period: ''
        overview: '' # 무엇을 왜 만들었는지 한 줄
        role: '' # 예: 메인 개발 — 설계부터 배포까지
        team: '' # 예: 백엔드 3명
        stack: [] # 예: [Java, Spring Boot, MySQL]
        # 주요 업무 — 무엇을 만들었는지. 예: ['○○ API 24개 개발', '○○ 배치 구현']
        tasks: []
        # 성과 — 가능하면 수치로. 예: ['응답 시간 800ms → 120ms', '동기화 주기 4시간 → 1시간']
        outcomes: []
        # 문제 해결 — 증상 → 원인 → 조치를 한 줄에.
        issues: []

  # 부트캠프 팀 프로젝트는 경력과 분리해 아래 블록으로 두었습니다.
  # 필요 없으면 이 블록을 통째로 지우세요.
  - company: Kernel360 (KBE 5기)
    role: Backend
    period: 2025.04 – 2025.07
    note: 백엔드 개발자 부트캠프 팀 프로젝트 · 5인
    projects:
      - name: RENTO — 법인 차량 관제 플랫폼
        period: 2025.04 – 2025.07
        overview: 차량 단말이 보내는 주기 데이터로 운행 이력을 자동 기록하고, 관리자가 실시간으로 차량 상태를 보는 관제 플랫폼
        role: 실시간 관제 파이프라인 · 운행/주기정보 도메인 담당
        team: 5명 (백엔드 · 프론트엔드 공동)
        stack: [Java, Spring Boot, JPA, MySQL, RabbitMQ, SSE, Docker]
        tasks:
          - 수집(pub) · 소비(sub) · 관리 API(api) 를 Gradle 멀티모듈로 분리하고 domain 모듈을 공유하도록 구성
          - 단말 이벤트를 RabbitMQ 로 비동기 발행하고, 소비자가 SSE 로 관제 화면에 전달하는 실시간 경로 구축
          - Drive · CycleInfo 로 나뉘어 있던 운행 도메인 모델을 하나로 통합
          - 통계 조회를 도메인 중심 구조로 재편
        outcomes:
          - 수집 경로와 조회 경로를 분리해, 무거운 통계 쿼리가 단말 수집 응답에 영향을 주지 않도록 격리
          - 관제 화면 갱신을 폴링 없이 서버 푸시로 전환
        issues:
          - EventSource 가 Authorization 헤더를 실을 수 없어 SSE 구독이 401 → access 토큰만 허용하는 쿼리 파라미터 인증으로 우회하고, 토큰 종류를 컨트롤러에서 직접 검증
---
