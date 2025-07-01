# `features/` 디렉터리

`features` 레이어는 **“사용자 작업 단위(Use-Case)”** 를 하나씩 완결 (데이터 → 상태 → UI → 사이드 이펙트 처리까지) 하는 **작은 Vertical Slice** 집합입니다.
예) “카운터 증가”, “로그인 요청”, “테마 전환” 같이 **한 번의 사용자 액션**을 책임지는 로직과 UI를 여기서 구현합니다.

> **계층 규칙** `widgets` → **features** → entities → shared  
> • 다른 `features`를 import할 수 있지만 _상위_ `widgets`·`pages`·`app`은 import 금지.  
> • `eslint-plugin-fsd-lint` 의 `layer-imports` 룰이 위반 시 오류를 표시합니다.

---

## 1. 책임(Responsibilities)

| 항목              | 설명                                                   |
| ----------------- | ------------------------------------------------------ |
| **비즈니스 로직** | API 호출, 검증, 상태 갱신 등 “행위” 중심 로직          |
| **상태 관리**     | 로컬 상태(Zustand, Redux 등) 또는 캐시(TanStack Query) |
| **사이드 이펙트** | 토스트, 네비게이션, 로그 전송 등 액션 후 효과          |
| **UI(선택)**      | 행동을 트리거하는 버튼·폼 등 _(작은 단일 컴포넌트)_    |
| **Public API**    | `index.ts` 한 곳에서 export 하여 외부 의존 경로 고정   |

---

## 2. 구조 & 명명 규칙

```
features/
└─ increment-counter/          ← kebab-case (use-case 이름)
   ├─ ui.tsx                   ← “+” 버튼 등 UI (필요 시)
   ├─ model.ts                 ← 상태·service 함수
   ├─ api.ts                   ← (선택) API 호출 래퍼
   ├─ index.ts                 ← export { IncrementButton } from './ui';
   ├─ increment-counter.test.tsx   ← (선택) 테스트
   └─ README.md                ← (선택) 세부 가이드
```

| 규칙            | 내용                                                   |
| --------------- | ------------------------------------------------------ |
| **폴더**        | 항상 **kebab-case** (`reset-password`, `add-to-cart`)  |
| **핵심 파일**   | `model.ts` + `ui.tsx`(필요 시) + `index.ts`            |
| **추가 파일**   | `api.ts`, `types.ts`, 테스트, 스토리북 등              |
| **컴포넌트 명** | 코드 내부에서는 **PascalCase** (`IncrementButton`)     |
| **경로 import** | 외부에서 `@features/increment-counter` 경로까지만 사용 |

---

## 3. 생성 가이드

1. **폴더 이름** : `features/<use-case>/` – kebab-case.
2. **필수 파일** : `model.ts`(**로직**) & `index.ts`(**Public API**)
3. **UI가 필요하면** : `ui.tsx` 생성 후 `index.ts`에서 export

   ```ts
   export { default as IncrementButton } from "./ui";
   ```

4. **상태·API 구분** :
   - 단순 로컬 상태 → `model.ts`
   - 서버 통신 → `api.ts` + `model.ts`(service)

5. ESLint 오류(레이어 위반)가 없으면 완료

---

## 4. import 허용 · 금지

| 허용(✓)                                                          | 금지(✗)                             |
| ---------------------------------------------------------------- | ----------------------------------- |
| `features/*` (다른 feature 재사용)<br>`entities/*`<br>`shared/*` | `widgets/*`<br>`pages/*`<br>`app/*` |

---

## 5. FAQ

| 질문                                         | 답변                                                                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **여러 페이지에서 써도 되나요?**             | 네. feature는 페이지·위젯 어디서든 재사용 가능합니다.                                                                               |
| **UI 없는 feature도 가능한가요?**            | 가능합니다. 예) `use-auth-refresh`처럼 순수 훅만 export해도 OK.                                                                     |
| **복잡한 상태·폼은 어디까지 feature인가요?** | “단일 액션으로 설명될 수 있는 단위”까지만 feature에 두고, 복잡한 폼 단계는 별도 feature로 쪼개거나 위젯 수준 레이아웃으로 올립니다. |

---

## 6. 업데이트 지침

- **폴더·파일 네이밍** (kebab-case)과 **Public API 위치(index.ts)** 를 지켜 주세요.
- 로직이 커지면 `model/`·`ui/` 서브폴더를 만들어 세분화해도 됩니다.
- README를 변경할 때는 **책임 문단**·**구조 예시**·**FAQ** 를 함께 업데이트해 주세요.
