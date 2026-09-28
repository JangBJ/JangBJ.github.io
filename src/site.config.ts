/**
 * 사이트 전역 정보. 여기만 고치면 헤더 / 푸터 / 메타태그 / 히어로에 전부 반영됩니다.
 */
export const site = {
  /** 화면에 보이는 이름 */
  name: '장병중',
  /** 헤더 프롬프트와 푸터에 쓰이는 핸들 (보통 GitHub 아이디) */
  handle: 'JangBJ',
  /** 이름 옆 한 줄 직무 */
  role: 'Backend Developer',

  /** 메인 히어로의 터미널 블록에 한 줄씩 출력됩니다. 줄 수는 자유. */
  intro: [
    '만든 결과보다, 만들면서 내린 결정을 남깁니다.',
    '도메인이 늘어도 클래스 하나 추가하면 붙는 구조를 좋아합니다.',
  ],

  /** <head> 메타 설명 — 검색 결과와 링크 미리보기에 쓰입니다 */
  description:
    '백엔드 개발자 장병중의 개발 기록. 프로젝트마다 무엇을 고민했고 무엇을 선택했는지 챕터로 정리합니다.',

  /** 히어로 하단 바로가기. 주소는 노출하지 않고 title 툴팁으로만 남깁니다. */
  contacts: [
    { label: 'About', value: '학력 · 자격증', href: '/about/' },
    { label: 'Resume', value: '경력기술서', href: '/resume/' },
    { label: 'GitHub', value: 'github.com/JangBJ', href: 'https://github.com/JangBJ' },
    { label: 'Email', value: 'java.util.list@kakao.com', href: 'mailto:java.util.list@kakao.com' },
  ],

  /** 헤더 내비게이션 */
  nav: [
    { label: 'projects', href: '/' },
    { label: 'about', href: '/about/' },
    { label: 'resume', href: '/resume/' },
  ],
} as const;
