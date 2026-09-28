// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// JangBJ.github.io 저장소는 루트(/)로 서빙되므로 base 설정이 필요 없습니다.
// 일반 저장소(예: github.com/JangBJ/blog)로 옮긴다면 base: '/blog' 를 추가하세요.
//
// remark / rehype 플러그인을 쓰려면 `npm i @astrojs/markdown-remark` 가 필요합니다.
// (Astro 7부터 기본 마크다운 프로세서가 바뀌어 unified 파이프라인이 기본 설치가 아닙니다)
// 지금은 플러그인 없이 CSS 로 해결하고 있어 설치하지 않았습니다 — global.css 의 `.prose table` 참고.
export default defineConfig({
  site: 'https://JangBJ.github.io',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      // 듀얼 테마: 다크 색이 인라인으로, 라이트 색은 --shiki-light 변수로 나옵니다.
      // 전환은 global.css 의 [data-theme='light'] 규칙이 담당합니다.
      themes: { dark: 'ayu-dark', light: 'github-light' },
      defaultColor: 'dark',
      wrap: true,
    },
  },
});
