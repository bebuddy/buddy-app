# 접근성 베이스 컴포넌트 가이드

## 위치
- 베이스 컴포넌트: `src/components/a11y/`

## AppButton
- 아이콘 전용 버튼은 반드시 `ariaLabel` 제공
- 최소 터치 타깃(44px)을 기본으로 확보

```tsx
<AppButton ariaLabel="저장" onClick={handleSave}>
  저장
</AppButton>
```

## AppLink
- 외부 링크는 `external`로 `rel/target` 자동 처리

```tsx
<AppLink href="/junior">후배 목록</AppLink>
<AppLink href="https://example.com" external>
  외부 링크
</AppLink>
```

## AppInput / AppTextarea
- `label`, `description`, `error`를 연결하여 `aria-describedby` 자동 구성

```tsx
<AppInput
  label="이메일"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
/>
```

## AppModal
- `open` 시 포커스 트랩, 닫힘 시 트리거로 복귀
- 기본 `appRootId="__next"` 사용

```tsx
<AppModal open={open} onClose={close} title="안내">
  <p>내용</p>
</AppModal>
```

## AppTabs
- 화살표/홈/엔드 키 지원
- `tabs` 배열로 탭/패널을 1:1 연결

```tsx
<AppTabs
  label="채팅 필터"
  tabs={[
    { id: "all", label: "전체", content: <AllList /> },
    { id: "junior", label: "후배", content: <JuniorList /> },
  ]}
/>
```

## AppToast
- `aria-live` 포함, 중요 알림은 `variant="error"`

```tsx
<AppToast open={open} message="저장 완료" onClose={close} />
```

## AppCarousel
- 자동재생 기본 OFF
- `정지/재생/이전/다음` 컨트롤 내장

```tsx
<AppCarousel
  items={[
    { id: "1", label: "첫 번째", content: <Slide1 /> },
    { id: "2", label: "두 번째", content: <Slide2 /> },
  ]}
/>
```
