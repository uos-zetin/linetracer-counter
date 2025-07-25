# 📂 `src` 디렉터리 개요

이 프로젝트의 모든 프런트엔드 코드는 **[Feature-Sliced Design(FSD)](https://feature-sliced.design/)** 아키텍처를 따릅니다.

| 레이어(dir)  | 한 줄 설명                                | 상세 가이드                              |
| ------------ | ----------------------------------------- | ---------------------------------------- |
| **app**      | 앱 진입점, 전역 설정, 라우팅 관리         | [app/README.md](app/README.md)           |
| **pages**    | URL별 페이지 컴포넌트 (1:1 매칭)          | [pages/README.md](pages/README.md)       |
| **widgets**  | 복합 UI 블록 (여러 feature 조합)          | [widgets/README.md](widgets/README.md)   |
| **features** | 사용자 액션 단위 기능 (로그인, 타이머 등) | [features/README.md](features/README.md) |
| **entities** | 도메인 모델, API 호출, 기본 UI            | [entities/README.md](entities/README.md) |
| **shared**   | 공통 UI 컴포넌트, 유틸리티, 훅            | [shared/README.md](shared/README.md)     |

> **Import 흐름(상위 → 하위)**  
> `app → pages → widgets → features → entities → shared`  
> ESLint(`eslint-plugin-fsd-lint`)가 위반 시 자동으로 경고를 표시합니다.

---

## 1. 명명 규칙

| 구분                           | 규칙                              | 왜 이렇게 쓰나요?                                                                                                                            |
| ------------------------------ | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **모든 디렉터리**              | `kebab-case`                      | 대·소문자 혼용을 없애고, CLI 탭 완성과 OS 간(Windows/macOS) 대소문자 충돌을 방지합니다.<br>예) `counter-panel/`, `user-auth/`, `data-fetch/` |
| **모든 파일**                  | `kebab-case.ext`                  | 동일 이유로 **파일도 전부 소문자-대시**로 통일합니다.<br>예) `ui.tsx`, `index.ts`, `fetch-user.ts`, `counter-store.ts`                       |
| **Public API(배럴)**           | `index.ts`                        | 폴더의 공식 출입구 역할. 내부 구조 변경 시 외부 경로는 그대로 유지됩니다.                                                                    |
| **React 컴포넌트 / 타입 이름** | 코드 안에서는 **`PascalCase`**    | JS/TS 관례 유지(예: `CounterButton`, `UserDto`)—파일·폴더의 kebab-case와 구분                                                                |
| **변수‧함수**                  | `camelCase`                       | `fetchUser`, `counterStore`                                                                                                                  |
| **타입‧인터페이스**            | `PascalCase` + 의도 명확한 접미사 | `UserDto`, `CounterState`                                                                                                                    |

---

## 2. 핵심 제약사항

### Slice 구조 규칙

- 각 slice는 **segment 단위**로 디렉터리 구조 생성
- 필수 파일: **`index.ts`** (Public API), 선택적으로 `ui/`, `model/`, `api/`, `lib/` 등
- 외부에서는 오직 **`index.ts`**만 import 허용

### Import 제한

- 상위 레이어에서 하위 레이어로만 import 가능
- 동일 레이어 내에서는 서로 import 금지 (특히 pages 간)
- ESLint가 위반 시 자동으로 오류 표시

### 스타일 관리

- 공통 토큰은 **`app/index.css`**의 **`@theme`** 영역에 정의
- 컴포넌트 스타일은 Tailwind 클래스로 처리
- 별도 CSS 파일 필요 시 해당 slice 폴더 내에 배치

### 데이터 흐름

- API 호출은 **entities** 레이어에서 관리
- 비즈니스 로직은 **features** 레이어에서 처리
- 상태 관리는 각 slice의 `model/` 디렉터리에서 담당

### 타입 정의

- 도메인 타입은 **entities**에서 정의
- Feature별 타입은 해당 **features** slice에서 정의
- 공통 타입은 **shared/types**에서 관리

---

### 업데이트 방법

프로젝트 규칙이 바뀌면 **가장 먼저 이 README를 수정**하세요.
하위 디렉터리 README에는 변경 사항 링크를 반영해 주시면 됩니다.
