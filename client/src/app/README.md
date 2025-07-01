# `app/` 디렉터리

최상위 **엔트리(entry) 레이어**로서, 브라우저에 첫 번째 로드되는 코드와 전역 환경을 모두 여기서 초기화합니다.
`app`을 제외한 다른 레이어는 이 폴더를 **직접 임포트할 일이 없습니다.**

---

## 1. 역할 · 책임

| 구분                   | 설명                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------- |
| **엔트리 포인트**      | `index.tsx`에서 `ReactDOM.createRoot` → `<AppProviders>`로 감싼 뒤, `#root`에 마운트   |
| **전역 Provider 스택** | 테마, 라우터, React Query 등 앱 전역 컨텍스트를 `app/providers/`에서 한 줄로 묶어 관리 |
| **라우팅**             | `app/routing/`에 모든 URL ↔ 페이지 매핑(lazy import) 정의                             |
| **전역 스타일**        | `index.css` — Tailwind 호출(`@import "tailwindcss";`)과 전역 CSS 변수                  |
| **개발 도구**          | MSW 설정, React Query Devtools 등 개발 전용 툴 삽입                                    |

---

## 2. 구조 · 파일 설명

```
app/
├─ index.tsx
├─ index.css
├─ providers/
│  ├─ theme-provider.tsx
│  ├─ router-provider.tsx
│  ├─ query-provider.tsx
│  └─ index.ts
└─ routing/
   ├─ routes.tsx
   └─ index.ts
```

| 파일/폴더        | 규칙 · 팁                                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`index.tsx`**  | _절대_ 다른 레이어에서 import하지 말 것.<br>오직 앱 부트스트랩 책임만 가짐.                                                                      |
| **`providers/`** | - **이름 = kebab-case**<br>- 각 Provider는 `children` 만 받아 return<br>- `app-providers.tsx` 안에서 `<ThemeProvider><RouterProvider>…`처럼 중첩 |
| **`routing/`**   | - `routes.tsx`에 **페이지 경로 ↔ 컴포넌트**만 정의 (데이터 X)<br>- `createBrowserRouter(routes)`를 `router.ts`에 래핑                           |
| **`index.css`**  | Tailwind 한 줄과 전역 CSS 변수 외의 복잡한 스타일은 금지                                                                                         |

---

## 3. import 규칙

- **허용**: `pages/*`, `widgets/*`, `features/*`, `entities/*`, `shared/*`
- **금지**: 어느 레이어에서도 `app/*`을 import하는 행위
  → `app`은 **루트전용**. 다른 레이어가 필요하면 하위 레이어로 옮겨야 함.

---

## 4. 전역 Provider 추가 절차

1. `app/providers/xxx-provider.tsx` 생성

   ```tsx
   import { XxxProviderLib } from "xxx";

   export const XxxProvider = ({ children }: PropsWithChildren) => <XxxProviderLib>{children}</XxxProviderLib>;
   ```

2. `app/providers/app-providers.tsx`에서 삽입

   ```tsx
   export const AppProviders = ({ children }: PropsWithChildren) => (
     <ThemeProvider>
       <RouterProvider router={router}>
         <XxxProvider>{children}</XxxProvider>
       </RouterProvider>
     </ThemeProvider>
   );
   ```

3. 추가 설정이 필요하면 **app 레이어 내부**에서만 처리한다.

---

## 5. 자주 묻는 질문

| 질문                                           | 답변                                                                                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **페이지 컴포넌트를 직접 import해도 되나요?**  | ❌ `app` 레이어는 라우팅을 lazy import로 연결할 뿐, 페이지 내부 로직을 여기서 직접 사용하지 않습니다.                                |
| **Dev 전용 도구는 어디 넣나요?**               | `providers` 안에서 `if (import.meta.env.DEV) { <Devtools/> }` 식으로 조건부 삽입.                                                    |
| **SSR 엔트리나 테스트용 엔트리를 추가하려면?** | `/app/index.ssr.tsx`, `/app/index.test.tsx`처럼 **app 폴더 안에 별도 엔트리 파일**을 두고, 공통 Provider 스택은 그대로 재사용하세요. |

> 이 README를 업데이트할 때는 **역할 · 구조 · 규칙** 3가지만 명확히 유지해 주세요. 후임 개발자가 “app은 부트스트랩 전용 레이어”임을 바로 이해할 수 있도록 하는 것이 목적입니다.
