# `shared/` 디렉터리

`shared` 레이어는 **디자인 시스템·순수 유틸리티·재사용 훅·전역 설정**처럼 **“도메인 독립적이고 모든 레이어가 자유롭게 가져다 쓸 수 있는 코드”** 를 모아 둡니다.
비즈니스 로직·도메인 상태·URL 의존성은 **절대 포함하지 않습니다.**

> **계층 규칙** 모든 상위 레이어(**app / pages / widgets / features / entities**) → **shared**  
> `shared` 는 오직 **`shared/*` 내부만** import할 수 있습니다.  
> 위반 시 `eslint-plugin-fsd-lint/layer-imports` 가 오류를 표시합니다.

---

## 1. 책임 (Responsibilities)

| 범주            | 예시                           | 설명                             |
| --------------- | ------------------------------ | -------------------------------- |
| **UI(원자)**    | 버튼, 아이콘, 모달             | 디자인 토큰 사용, 상태 최소화    |
| **Hooks**       | `use-debounce`, `use-interval` | 순수 로직, 외부 의존 없거나 최소 |
| **Lib / Utils** | `clsx` 래퍼, 날짜 포맷터       | 변환·계산 함수, I/O 없음         |
| **Config**      | Tailwind 토큰, 상수            | 글로벌 설정·enum                 |
| **Types**       | 공통 타입, DTO                 | 여러 도메인이 공유하는 타입 정의 |

---

## 2. 구조 & 명명 규칙

```
shared/
├─ ui/                   ← 원자·분자 UI 컴포넌트
│   ├─ button/
│   │   ├─ ui.tsx
│   │   ├─ index.ts
│   │   └─ button.stories.tsx   (선택)
│   ├─ icon/
│   └─ index.ts          ← 배럴(export)
├─ hooks/
│   ├─ use-debounce.ts
│   └─ index.ts
├─ lib/
│   ├─ class-names.ts
│   └─ index.ts
├─ config/
│   ├─ tailwind-tokens.ts
│   └─ index.ts
├─ types/
│   ├─ api.d.ts
│   └─ index.ts
└─ README.md             (현재 파일)
```

| 규칙                 | 내용                                                                          |
| -------------------- | ----------------------------------------------------------------------------- |
| **모든 폴더·파일**   | **kebab-case** (`button`, `use-debounce.ts`)                                  |
| **UI 폴더**          | `ui.tsx` + `index.ts` 기본 세트 (`export { default as Button } from './ui';`) |
| **배럴**             | 각 범주 하위에 `index.ts` 를 두어 외부 노출 경로 고정                         |
| **컴포넌트·타입 명** | 코드 내부에서는 `PascalCase` (`Button`, `RequestStatus`)                      |

---

## 3. 생성 가이드

1. **폴더 위치**
   - UI 컴포넌트 → `shared/ui/<component-name>/`
   - 훅 → `shared/hooks/`
   - 유틸 함수 → `shared/lib/`

2. **파일 네이밍** : 전부 kebab-case (`use-fetch.ts`, `format-date.ts`)
3. **외부 공개** : 반드시 해당 범주 `index.ts` 에 export 추가
4. **의존성 제한** :
   - 다른 `shared/*` 는 자유롭게 import
   - **도메인 엔티티(import 불가)**, 브라우저 전역 API 사용 최소화

---

## 4. FAQ

| 질문                                     | 답변                                                                                                                            |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **디자인 시스템 색·폰트 토큰은 어디에?** | `shared/config/tailwind-tokens.ts` 에 CSS 변수·Tailwind theme.extend 값을 정의하고 `tailwind.config.ts` 에 import 하세요.       |
| **Stateful 컴포넌트도 둘 수 있나요?**    | 가능하지만 “상태가 도메인 독립적이고 아주 기본적인 UI 동작” 수준이어야 합니다. 복잡한 비즈니스 상태는 `features` 로 이동하세요. |
| **`shared` 가 너무 커지면?**             | 범주별 하위 폴더(`inputs/`, `feedback/` 등)로 나누되 **공통 규칙(폴더 = kebab-case, 배럴 export)** 을 유지합니다.               |

---

## 5. 업데이트 지침

- 새 항목을 추가할 때는 **폴더·파일 kebab-case** 와 **배럴 export** 규칙을 지켜 주세요.
- 의존성 방향(상위 → shared 단방향) 을 어기면 ESLint 오류가 나야 정상입니다.
- 이 README에 책임·구조·제약 변경 사항을 반영해 팀원 모두가 최신 규칙을 확인할 수 있도록 합니다.
