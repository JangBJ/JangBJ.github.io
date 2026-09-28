/**
 * /about 페이지 데이터. 이 파일만 고치면 페이지에 그대로 반영됩니다.
 * 배열을 비워 두면 해당 섹션은 렌더되지 않습니다.
 */

export interface Education {
  /** 학교명 · 교육기관명 */
  school: string;
  /** 전공 · 과정명. 예: '컴퓨터공학과', '백엔드 개발자 양성 과정' */
  degree?: string;
  /** 예: '2020.03 – 2024.02' */
  period?: string;
  /** 한 줄 덧붙임. 예: '졸업', '수료' */
  note?: string;
}

export interface Career {
  /** 직무. 예: 'Backend Developer' */
  role: string;
  /** 회사명. 비우면 표시되지 않습니다. */
  company?: string;
  /** 예: '2025.08 – 재직 중' */
  period?: string;
  /** 한 줄 덧붙임 */
  note?: string;
}

export interface Certification {
  /** 자격증명 */
  name: string;
  /** 발급 기관 */
  issuer?: string;
  /** 취득일. 예: '2024.09' */
  date?: string;
  /** 한 줄 덧붙임 */
  note?: string;
}

export interface About {
  /** 페이지 상단 한 문단. 비우면 표시되지 않습니다. */
  intro: string;
  education: Education[];
  career: Career[];
  certifications: Certification[];
}

/**
 * 각 배열은 최신순으로 적습니다.
 *
 * ⚠️ 아래 값은 저장소에서 확인된 사실(Kernel360 부트캠프 참여)만 남기고
 *    나머지는 비워 둔 상태입니다. 본인 정보로 채워 주세요.
 */
export const about: About = {
  intro:
    '서버가 왜 그렇게 동작하는지 끝까지 따라가 보는 걸 좋아합니다. ' +
    '팀 프로젝트에서는 주로 도메인 모델과 실시간 데이터 흐름을 맡았고, ' +
    '개인 프로젝트로는 앱과 서버를 직접 붙여 가며 부족한 부분을 메우고 있습니다.',

  education: [
    {
      school: 'Kernel360',
      degree: '백엔드 개발자 부트캠프 (KBE 5기)',
      period: '2025.02 – 2025.07',
      note: '수료 — 팀 프로젝트 RENTO 백엔드',
    },
    // TODO: 대학교 / 전공 / 기간을 추가하세요.
  ],

  career: [
    {
      role: 'Backend Developer',
      // TODO: company, period 를 채우세요. 예: company: '○○○', period: '2025.08 – 재직 중'
    },
  ],

  certifications: [
    // TODO: 보유 자격증을 적으세요. 예:
    // { name: 'SQLD', issuer: '한국데이터산업진흥원', date: '2024.09' },
    // { name: '정보처리기사', issuer: '한국산업인력공단', date: '2024.06' },
  ],
};
