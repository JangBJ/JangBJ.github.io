---
title: UIverse — 커머스 백엔드
summary: 상품·주문·결제·리뷰를 갖춘 쇼핑몰 서버. 저는 트래픽이 몰릴 때만 켜지는 대기열과 회원 도메인을 맡았습니다.
kind: team
stack: [Java, Spring Boot, JPA, QueryDSL, MySQL, Redis, AWS S3]
period: 2025.02 – 2025.04
order: 3
repo: https://github.com/UIverse-BE/UIverse-BE
---

상품을 고르고, 장바구니에 담고, 주문하고, 결제하고, 리뷰를 남기는
쇼핑몰의 기본 흐름을 처음부터 끝까지 만들어 본 팀 프로젝트입니다.

도메인이 꽤 넓었습니다 — `product` · `option` · `order` · `payment` · `member` ·
`review` · `category` · `storewishlist` · `faq` · `notice` · `question`.
Redis 세션, S3 이미지 업로드, SES 메일, SMS 발송까지 외부 연동도 붙였습니다.

그중 제가 맡은 건 **대기열**과 **회원 도메인**(수정 · 광고 수신동의 · 로그인 인터셉터),
그리고 API 문서화(Swagger)와 메일 폼이었습니다.
