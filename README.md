# JangBJ.github.io

프로젝트별 제작 과정을 **카드 → 챕터 → 글** 3단 구조로 기록하는 정적 사이트.

- **스택**: Astro 7 (정적 생성) + TypeScript
- **디자인**: 터미널 / 에디터 감성 — 다크 기본, 라이트 전환 가능. 색은 `src/styles/tokens.css`
- **배포**: `main` 에 push → GitHub Actions → GitHub Pages

## 로컬에서 보기

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ 에 정적 파일 생성
npm run preview  # 빌드 결과 미리보기
npm run check    # 타입 · 컨텐츠 스키마 검사
```

---

## 먼저 할 일

| 파일 | 채울 내용 |
|---|---|
| `src/site.config.ts` | 이름 · 직무 · 소개 · 연락처 · 내비게이션 |
| `src/about.config.ts` | 학력 · 경력 · 자격증 (**TODO 표시된 곳**) |
| `src/content/resume/backend.md` | 경력기술서 (**현재 `draft: true`**) |

`about.config.ts` 와 `resume/backend.md` 는 본인만 아는 내용이라 **비워 둔 상태**입니다.
`resume` 는 `draft: true` 라서 지금은 `/resume` 에 "준비 중" 만 뜹니다.
내용을 채우고 `draft` 줄을 지우면 공개됩니다.

---

## 글 쓰는 법

### 1. 프로젝트 카드 추가

`src/content/projects/` 에 `.md` 파일 하나 = 메인 카드 하나.
**파일명이 곧 URL 이자 프로젝트 ID** 입니다.

```markdown
---
title: 프로젝트 이름
summary: 카드에 보이는 한 줄 설명.
kind: team · 5                   # 선택. 카드 우측 상단 라벨 (예: personal, team · 5)
stack: [Java, Spring Boot, MySQL] # 칩으로 표시 (카드엔 4개까지, 나머지는 +N)
period: 2025.04 – 2025.07         # 선택
cover: /covers/foo.png            # 선택, public/ 기준. 없으면 ASCII 플레이스홀더
gallery: [/covers/foo/01.png]     # 선택, 상세 페이지 상단 가로 스크롤 스크린샷
repo: https://github.com/...      # 선택
demo: https://...                 # 선택
order: 1                          # 카드 정렬 (작을수록 앞)
draft: false                      # true 면 프로덕션 빌드에서 숨김
---

여기 본문을 쓰면 프로젝트 페이지 상단에 '개요' 로 들어갑니다. (선택)
```

### 2. 챕터 글 추가

`src/content/chapters/<프로젝트ID>/` 에 `.md` 파일 하나 = 글 하나.
**폴더 이름은 위 프로젝트 파일명과 정확히 같아야 합니다.**

```markdown
---
title: 커넥션을 어떻게 들고 있을 것인가
description: 챕터 목록에 보이는 설명. (선택)
order: 2                    # 프로젝트 안에서의 순서
category: 개발              # 선택 — 아래 설명 참고
date: 2025-06-05            # 선택
draft: false
---

본문을 마크다운으로 씁니다.
```

### 3. `category` 동작

한 프로젝트 안에서

- **아무 챕터도 `category` 를 안 쓰면** → `order` 순서대로 쭉 나열됩니다
- **하나라도 쓰면** → 카테고리별로 묶여서 표시됩니다 (등장 순서대로 그룹 생성)

번호는 그룹을 넘어가도 이어집니다. 두 방식 다 샘플이 들어 있으니 비교해 보세요.

| 프로젝트 | 방식 |
|---|---|
| `rento` | 카테고리 그룹 (개발 / 트러블슈팅 / 회고) |
| `nalssi-ipda` | 순서 목록 |

---

## 폴더 구조

```text
src/
├── content/
│   ├── projects/          # 카드 1개 = 파일 1개
│   ├── chapters/<ID>/     # 글 1개 = 파일 1개
│   └── resume/            # 경력기술서 (updated 가 가장 큰 1장이 실림)
├── pages/
│   ├── index.astro                        # 히어로 + 카드 그리드
│   ├── about.astro                        # 학력 · 경력 · 자격증
│   ├── resume.astro                       # 경력기술서
│   ├── 404.astro
│   └── projects/[project]/
│       ├── index.astro                    # 챕터 목록
│       └── [chapter].astro                # 글 본문
├── components/            # Header, Footer, ThemeToggle, ProjectCard, ChapterRow, TerminalWindow
├── lib/content.ts         # 컬렉션 조회 · 정렬 · 그룹핑 · 날짜 포맷
├── styles/tokens.css      # 디자인 토큰 — 색을 바꾸려면 여기만
├── site.config.ts         # 이름 / 소개 / 링크 / 내비
└── about.config.ts        # /about 페이지 데이터
```

---

## 테마

헤더 우측 버튼으로 라이트 / 다크를 전환합니다. **첫 방문은 다크**이고,
선택은 `localStorage` 에 남아 다음 방문에도 유지됩니다.

색을 바꾸려면 `src/styles/tokens.css` 의 두 블록만 고치면 됩니다.
두 블록은 **같은 토큰 이름을 1:1 로** 갖고 있어야 합니다. 하나라도 빠지면
라이트 모드에서 다크 값이 그대로 새어 나옵니다.

시스템 설정(`prefers-color-scheme`)을 따라가게 하려면
`src/layouts/BaseLayout.astro` 의 인라인 스크립트에서 기본값 `'dark'` 를
`matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'` 로 바꾸세요.

---

## 커버 이미지

`public/covers/` 에 넣고 frontmatter 에 `cover: /covers/파일명.png` 로 참조합니다.
권장 비율 **16:9** (예: 1200×675). 없으면 ASCII 플레이스홀더가 나옵니다.

여러 장을 상세 페이지 상단에 가로로 흘리려면 `gallery` 배열을 씁니다.

---

## 배포 설정 (최초 1회)

1. GitHub 에 **`JangBJ.github.io`** 이름으로 저장소를 만든다 (반드시 이 이름 — 그래야 루트로 서빙됨)
2. 저장소 **Settings → Pages → Source** 를 **GitHub Actions** 로 바꾼다
3. `main` 에 push

이후 `main` 에 push 할 때마다 `.github/workflows/deploy.yml` 이 빌드 후 배포합니다.

> 일반 저장소(예: `github.com/JangBJ/blog`)로 옮긴다면
> `astro.config.mjs` 에 `base: '/blog'` 를 추가해야 합니다.
