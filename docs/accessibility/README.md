# 접근성 도입 가이드

## 파일 구조 제안
- `src/components/a11y/`: 접근성 베이스 컴포넌트(AppButton/AppLink/AppInput/AppModal/AppTabs/AppToast/AppCarousel)
- `src/components/`: 기존 공통 컴포넌트가 a11y 베이스를 사용하도록 리팩터링
- `docs/accessibility/`: 정책/체크리스트/테스트/자동화 문서

## 도입 순서(1~7)
1. 베이스 컴포넌트 적용: 신규 화면/기능부터 `src/components/a11y`로 표준화
2. 입력 폼 표준화: `AppInput/AppTextarea` 도입, 오류 처리/포커스 이동 규칙 확립
3. 모달/팝업 표준화: `AppModal`로 포커스 트랩/복귀/배경 inert 적용
4. 탭/캐러셀 표준화: `AppTabs/AppCarousel` 적용, 키보드/스크린리더 경로 보장
5. 알림 표준화: `AppToast`로 `aria-live` 통일, 중요 알림 다중 채널 제공
6. 린트/테스트 자동화: eslint-plugin-jsx-a11y + Playwright/axe 적용
7. QA 루프: 체크리스트 기반 수동 점검 + VoiceOver/TalkBack 시나리오 반복

## 가정
- UI는 Tailwind 기반이며, `globals.css`에 토큰/포커스 스타일을 보강하는 것을 전제로 합니다.
- 모달의 앱 루트는 `__next`를 기본으로 처리합니다. 실제 DOM 구조에 맞춰 `AppModal`의 `appRootId`를 조정하세요.
- 캐러셀, 토스트 등은 기본 예시 구현이며 실제 UI에 맞춰 스타일/컨텐츠를 확장합니다.
