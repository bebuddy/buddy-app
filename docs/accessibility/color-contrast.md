# 명도 대비 가이드 (초기 토큰 기준)

## 텍스트/배경 조합 표
> 계산 기준: WCAG 대비 비율 (최소 3:1, 권장 4.5:1)

| 텍스트 | 배경 | 대비비 |
| --- | --- | --- |
| `--color-neutral-1000` (#333333) | `--color-neutral-100` (#ffffff) | 12.63:1 |
| `--color-neutral-900` (#4a4a4a) | `--color-neutral-100` (#ffffff) | 8.86:1 |
| `--color-neutral-800` (#606060) | `--color-neutral-100` (#ffffff) | 6.29:1 |
| `--color-neutral-700` (#777777) | `--color-neutral-100` (#ffffff) | 4.48:1 |
| `--color-neutral-600` (#808080) | `--color-neutral-100` (#ffffff) | 3.95:1 |
| `--color-secondary-500` (#6163ff) | `--color-neutral-100` (#ffffff) | 4.43:1 |
| `--color-neutral-100` (#ffffff) | `--color-secondary-500` (#6163ff) | 4.43:1 |
| `--color-primary-500` (#ff883f) | `--color-neutral-100` (#ffffff) | 2.37:1 (미달) |
| `--color-neutral-100` (#ffffff) | `--color-primary-500` (#ff883f) | 2.37:1 (미달) |
| `--color-neutral-1000` (#333333) | `--color-primary-500` (#ff883f) | 5.32:1 |

## 가이드
- **주황계열(primary)** 배경에서는 흰색 텍스트 대신 `--color-on-primary`(#333333) 사용 권장
- **보라계열(secondary)** 배경은 흰색 텍스트가 4.43:1로 최소 기준 충족
- 회색 텍스트는 최소 `--color-neutral-600` 이상 사용 권장

## 토큰 제안
- `--color-on-primary`: 기본 텍스트 컬러로 `#333333` 사용
- `--color-on-secondary`: 기본 텍스트 컬러로 `#ffffff` 사용

> 실제 서비스 색상 조합은 Figma/Storybook 단계에서 재측정 후 확정하세요.
