# `pages/` 디렉터리

`pages` 레이어는 **“하나의 URL ↔ 하나의 화면”** 을 1 : 1로 대응시키는 최상위 UI 계층입니다.
라우터가 매칭해 주는 시점에 **필요 데이터를 선취(fetch)** 하고, SEO 메타·레이아웃 같은 페이지 전용 설정을 담당합니다.

> ⚠️ **Import 규칙**  
> `pages`는 _다른_ `pages`를 import할 수 없습니다.  
> 하위 레이어(`widgets / features / entities / shared`)만 사용할 수 있습니다.

---

## 1. 책임(Responsibilities)

| 항목                     | 설명                                                               |
| ------------------------ | ------------------------------------------------------------------ |
| **경로 대응**            | 폴더 이름 = URL 슬러그                                             |
| **초기 데이터 fetch**    | React Router `loader` 또는 React Query `useQuery` 등               |
| **SEO 메타**             | `<Helmet>` / `react-helmet-async` 등으로 title·description·OG 설정 |
| **페이지 전용 레이아웃** | 예) 풀폭, 사이드바 숨김 등                                         |
| **사이드 이펙트 최소화** | 복잡한 비즈니스 로직은 `features`로 분리                           |

---

## 2. 구조 & 명명 규칙

```
pages/
└─ home/               ← kebab-case, URL 슬러그
   ├─ ui.tsx           ← 페이지 컴포넌트 (default export)
   ├─ index.ts         ← export { default as HomePage } from './ui'
   ├─ loader.ts        ← (선택) 데이터 프리패치
   ├─ meta.tsx         ← (선택) SEO 메타 컴포넌트
   ├─ layout.tsx       ← (선택) 페이지 레이아웃 컴포넌트
   └─ README.md        ← 페이지 설명

```

| 규칙          | 내용                                                    |
| ------------- | ------------------------------------------------------- |
| **폴더**      | 항상 `kebab-case` (`user-settings`, `order-history` 등) |
| **핵심 파일** | `ui.tsx` + `index.ts`                                   |
| **보조 파일** | `loader.ts`, `meta.tsx`, `layout.tsx` 등 필요 시 추가   |

---

## 3. 서비스 페이지 목록

| URL 경로                        | 폴더           | 설명                                                  |
| ------------------------------- | -------------- | ----------------------------------------------------- |
| /                               | home           | [홈 페이지 안내](./home/README.md)                    |
| /{competitionId}/admin          | admin          | [참가자 관리 페이지 가이드](./admin/README.md)        |
| /{competitionId}/controller     | controller     | [컨트롤러 페이지 가이드](./controller/README.md)      |
| /{competitionId}/dashboard      | dashboard      | [대시보드 페이지 가이드](./dashboard/README.md)       |
| /{competitionId}/timer          | timer          | [타이머 페이지 가이드](./timer/README.md)             |
| /{competitionId}/manual-counter | manual-counter | [수동 계수 페이지 가이드](./manual-counter/README.md) |

> 페이지를 새로 만들 때마다 **URL·폴더·설명**을 이 표에 추가해 주세요.  
> 페이지 템플릿은 [TEMPLATE.md](./TEMPLATE.md)를 참고하세요.

---

## 4. 새 페이지 추가 절차

1. **폴더 이름 규칙**
   `src/pages/<slug>/` – `<slug>`는 URL 경로와 동일한 **kebab-case** 이름으로 작성
   예) `/home` → `pages/home/`

2. **필수 파일**
   - `ui.tsx` : 페이지 컴포넌트 구현
   - `index.ts` :

     ```ts
     export { default as HomePage } from "./ui";
     ```

   - `README.md` : 페이지 설명 작성

3. **라우터 등록** (`app/routing/routes.tsx`)

   ```tsx
   import { HomePage } from "@pages/home";

   const routes = [{ path: "/home", element: <HomePage /> }];
   ```

4. (선택) **데이터 로더** `loader.ts` 또는 React Query `useQuery` 작성

---

## 5. FAQ

| 질문                                     | 답변                                                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **페이지 간 import가 왜 금지인가요?**    | URL 별 화면을 격리해 레이어 경계를 지키고, 재사용 로직은 `widgets` / `features`로 분리하기 위해서입니다. |
| **다이내믹 라우팅은 어떻게 명명하나요?** | 라우터에서 `path: '/users/:id'` 처리를 하고, 폴더는 의미 있는 slug (`user-detail`)로 생성합니다.         |
| **SSR 대응은 어디서 하나요?**            | 별도 SSR 엔트리가 필요할 때는 `app` 레이어에서 처리하고, 페이지 구조는 그대로 유지합니다.                |

> README를 업데이트할 때는 **서비스 페이지 목록 표**와 **규칙**을 항상 최신 상태로 유지해 주세요.
