# 자동화 점검 가이드

## eslint-plugin-jsx-a11y
- 설정 위치: `eslint.config.mjs`
- 적용 범위: JSX 전반 (alt 텍스트, label 연결, role/state)

### 실행
```bash
npm run lint
```

## Playwright + axe-core
- 구성 파일: `playwright.config.ts`
- 테스트 파일: `tests/a11y.spec.ts`

### 실행
1. 앱 실행
   ```bash
   npm run dev
   ```
2. 별도 터미널에서 테스트
   ```bash
   npm run test:a11y
   ```

### 참고
- 기본 루트는 `http://localhost:3000`
- 로그인/권한 필요한 화면은 시나리오별로 인증 스텁 또는 테스트 계정이 필요
- 초기에는 위반이 존재할 수 있으므로 개선 후 통과 기준으로 사용
