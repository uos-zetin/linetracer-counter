# 📂 `src` 디렉터리 개요

이 프로젝트의 모든 프런트엔드 코드는 **Feature-Sliced Design(FSD)** 아키텍처를 따릅니다.
새로운 파일·폴더·페이지를 추가할 때는 아래 규칙을 먼저 확인해 주세요.

| 레이어(dir)  | 한 줄 설명                                  | 상세 가이드                              |
| ------------ | ------------------------------------------- | ---------------------------------------- |
| **app**      | 엔트리, 전역 Provider, 라우팅               | [app/README.md](app/README.md)           |
| **pages**    | **URL 1 : 1** 화면, 페이지 단위 데이터·SEO  | [pages/README.md](pages/README.md)       |
| **widgets**  | 여러 feature·entity를 조합한 재사용 섹션    | [widgets/README.md](widgets/README.md)   |
| **features** | 단일 사용자 액션(“증가”·“로그인”) 완결 로직 | [features/README.md](features/README.md) |
| **entities** | 도메인 상태·API·원시 UI                     | [entities/README.md](entities/README.md) |
| **shared**   | 디자인 시스템, 유틸, 훅 등 순수 코드        | [shared/README.md](shared/README.md)     |

> **Import 흐름(상위 → 하위)**  
> `app → pages → widgets → features → entities → shared`  
> ESLint(`eslint-plugin-fsd-lint`)가 위반 시 자동으로 경고를 표시합니다.

---

## 1. 명명 규칙

| 구분                           | 규칙                              | 왜 이렇게 쓰나요?                                                                                                                            |
| ------------------------------ | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **모든 디렉터리**              | `kebab-case`                      | 대·소문자 혼용을 없애고, CLI 탭 완성과 OS 간(Windows/macOS) 대소문자 충돌을 방지합니다.<br>예) `counter-panel/`, `user-auth/`, `data-fetch/` |
| **모든 파일**                  | `kebab-case.ext`                  | 동일 이유로 **파일도 전부 소문자-대시**로 통일합니다.<br>예) `ui.tsx`, `index.ts`, `fetch-user.ts`, `counter-store.ts`                       |
| **Public API(배럴)**           | `index.ts`                        | 여전히 폴더의 공식 출입구 역할. 내부 구조 변경 시 외부 경로는 그대로 유지됩니다.                                                             |
| **React 컴포넌트 / 타입 이름** | 코드 안에서는 **`PascalCase`**    | JS/TS 관례 유지(예: `CounterButton`, `UserDto`)—파일·폴더의 kebab-case와 구분                                                                |
| **변수‧함수**                  | `camelCase`                       | `fetchUser`, `counterStore`                                                                                                                  |
| **타입‧인터페이스**            | `PascalCase` + 의도 명확한 접미사 | `UserDto`, `CounterState`                                                                                                                    |

---

## 2. 디렉터리·파일 생성 가이드

1. 항상 **폴더 → `ui.tsx` → `index.ts`** 세트를 함께 만든다.
2. 비즈니스 로직·상태는 같은 폴더에 `model.ts`·`api.ts` 등으로 배치한다.
3. 외부에서는 오직 `index.ts`(Public API)만 import하도록 한다.

---

## 3. 페이지 추가 절차

1. `src/pages/<slug>/` 폴더 생성
2. `ui.tsx` 작성 → 페이지 컴포넌트 default export
3. `app/routing/routes.tsx`에 lazy import 형태로 라우팅 등록
4. 페이지 고유 레이아웃·SEO 메타가 필요하면 같은 폴더에 추가

---

## 4. FAQ

| 질문                                           | 답변                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`ui.tsx`와 `index.ts`는 무슨 차이인가요?**   | **`ui.tsx`** 는 폴더 안에서 “실제 컴포넌트를 구현”하는 코드 파일입니다.<br> **`index.ts`** 는 그 폴더를 외부에 내보내는 “공식 출입구(배럴)”입니다. `index.ts`가 있기 때문에 다른 모듈이 `import { Header } from "@/widgets/Header"`처럼 \*\*폴더 경로만\*\*으로도 컴포넌트를 가져올 수 있습니다. |
| **왜 `ui.tsx`라는 고정 이름을 쓰나요?**        | “이 폴더에서 핵심 UI 코드를 바로 찾고 싶을 때는 언제나 `ui.tsx`를 열면 된다”는 **검색 규칙**을 제공하기 위해서입니다. 파일명이 통일돼 있으면 새 팀원이 구조를 탐색할 때 빠르게 핵심 코드를 찾을 수 있습니다.                                                                                     |
| **`index.ts` 없이 `ui.tsx`만 두면 안 되나요?** | 가능하지만 그 경우 import 경로를 `@/widgets/Header/ui`처럼 **파일까지** 써야 합니다. 폴더 내부 구조가 바뀌면 모든 사용처를 고쳐야 하므로 유지보수가 어려워집니다. `index.ts`가 “한 번만 수정하면 외부 경로는 그대로”라는 캡슐화 역할을 합니다.                                                   |
| **스타일(CSS)은 어디에 작성하나요?**           | 공통 토큰은 `tailwind.config.ts`, 각 컴포넌트의 변형은 순수 Tailwind 클래스(`className="..."`)로 처리합니다. 별도 `.module.css` 등을 만들 경우에도 해당 슬라이스 폴더 안에 두면 됩니다.                                                                                                          |
| **다크 모드는 어떻게 관리하나요?**             | 디자인팀 확정 후 `:root[data-theme="dark"]`에 CSS 변수를 선언하고, `tailwind.config.ts`에서 `darkMode: "class"` 옵션을 활성화하세요.                                                                                                                                                             |

---

### 업데이트 방법

프로젝트 규칙이 바뀌면 **가장 먼저 이 README를 수정**하세요.
하위 디렉터리 README에는 변경 사항 링크를 반영해 주시면 됩니다.
