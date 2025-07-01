# `entities/` 디렉터리

`entities` 레이어는 **도메인 객체(데이터 모델)** 를 표현하고 관리합니다.
데이터 구조, 전역(또는 장기) 상태, API 쿼리, **원시(primitives) UI** 까지 “한 객체의 모든 핵심 요소”를 이곳에 모읍니다.

> **계층 규칙** `features / widgets / pages / app` → **entities** → shared
>
> - `entities/*` 는 오직 **`shared/*`만** import할 수 있습니다.
> - 상위 레이어( features·widgets·pages·app )를 역-참조하면 `eslint-plugin-fsd-lint/layer-imports` 오류가 납니다.

---

## 1. 책임 (Responsibilities)

| 항목                 | 설명                                                              |
| -------------------- | ----------------------------------------------------------------- |
| **데이터 모델**      | 타입·스키마·DTO·normalizer 등                                     |
| **전역/도메인 상태** | Zustand slice, Redux slice, TanStack Query atom 등                |
| **API 통신**         | CRUD 쿼리·mutation, 캐싱 키 정의                                  |
| **원시 UI**          | 단독으로 의미가 있는 **작은 컴포넌트** (숫자 값, 아바타, 태그 등) |
| **셀렉터 & 헬퍼**    | 파생 데이터 계산, 포맷 변환                                       |

`entities`는 **비즈니스 로직이나 사용자 액션 처리는 갖지 않습니다.**
(그 부분은 `features`에 맡기세요.)

---

## 2. 구조 & 명명 규칙

```
entities/
└─ counter/                    ← kebab-case (도메인 명)
   ├─ model.ts                 ← Zustand slice / selectors
   ├─ api.ts                   ← (선택) 서버 쿼리
   ├─ types.ts                 ← Counter 타입 정의
   ├─ ui/                      ← 원시 UI 모음
   │   ├─ counter-value.tsx    ← <CounterValue />
   │   └─ index.ts
   ├─ index.ts                 ← Public API
   ├─ counter.test.ts          ← (선택) 테스트
   └─ README.md                ← (선택) 세부 가이드
```

| 규칙                   | 내용                                                          |
| ---------------------- | ------------------------------------------------------------- |
| **폴더**               | 항상 `kebab-case` (`user`, `score-board`, `competition-info`) |
| **핵심 파일**          | `model.ts` + `index.ts` (Public API)                          |
| **옵션 파일**          | `api.ts`, `types.ts`, `selectors.ts`, 테스트 등               |
| **UI 서브폴더**        | `ui/` 내부 파일 역시 `kebab-case` (`counter-value.tsx`)       |
| **컴포넌트·타입 이름** | 코드 안에서는 `PascalCase` (`CounterValue`, `CounterState`)   |

---

## 3. Public API (예시)

```ts
// entities/counter/index.ts
export type { CounterState } from "./types";
export { useCounterStore, selectCounter } from "./model";
export { CounterValue } from "./ui";
```

외부 사용

```tsx
import { CounterValue, useCounterStore } from "@entities/counter";
```

---

## 4. 생성 가이드

1. **폴더 이름** `entities/<domain>/` – kebab-case
2. **필수 파일**
   - `model.ts` : 상태·셀렉터
   - `index.ts` : Public API re-export

3. **UI가 필요하면** `ui/` 폴더와 파일 추가 → `index.ts`에서 export
4. API 통신이 있으면 `api.ts`에 정의하고, `model.ts`나 `features`에서 호출
5. ESLint 오류가 없으면 완료

---

## 5. import 허용 · 금지

| 허용(✓)    | 금지(✗)                                             |
| ---------- | --------------------------------------------------- |
| `shared/*` | `features/*`<br>`widgets/*`<br>`pages/*`<br>`app/*` |

---

## 6. FAQ

| 질문                                                  | 답변                                                                                                                             |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **엔티티 안에서 또 다른 엔티티를 import해도 될까요?** | 가급적 피하세요. 교차 의존이 생기면 도메인 경계가 흐려집니다. 필요한 경우 `shared` 헬퍼로 추출하거나 상위 레이어에서 조합하세요. |
| **엔티티가 화면(UI) 없이도 되나요?**                  | 가능합니다. API + 상태만 가진 데이터 전용 엔티티도 흔합니다.                                                                     |
| **API 호출과 상태를 분리할 때 기준은?**               | CRUD 요청·캐싱 키는 `api.ts`, 그 결과를 저장·가공하는 로직은 `model.ts`에 둡니다.                                                |

---

## 7. 업데이트 지침

- 새 엔티티를 만들 때는 **폴더 = 도메인 명(kebab-case)**, `model.ts` + `index.ts`부터 작성하세요.
- 공통 규칙이 바뀌면 README – **역할·구조·제약** 항목을 함께 갱신해 주세요.
