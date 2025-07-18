# `pages/` 디렉터리

각 URL 경로에 대응하는 **페이지 컴포넌트**를 구현하는 최상위 레이어입니다.
라우팅, 데이터 로딩, 페이지 레이아웃 등 **화면 전체의 조합**을 담당합니다.

---

## 1. 역할 · 책임

| 구분              | 설명                                   |
| ----------------- | -------------------------------------- |
| **URL 대응**      | 폴더명이 URL 경로와 일치               |
| **레이아웃 조합** | widgets, features를 조합하여 화면 구성 |
| **데이터 로딩**   | 페이지 진입 시 필요한 데이터 fetch     |
| **페이지 설정**   | 메타 태그, 페이지별 전용 스타일 등     |

---

## 2. 구조 · 파일 설명

```
pages/
└─ [page-name]/
   ├─ ui.tsx             # 메인 페이지 컴포넌트
   ├─ ui/                # 세부 UI 컴포넌트들 (복잡한 경우)
   │  ├─ [component].tsx # 기능별 컴포넌트들
   │  └─ ...
   ├─ index.ts           # Public API
   └─ README.md          # (선택) 페이지 설명
```

| 파일/폴더           | 역할 및 제약사항                                     |
| ------------------- | ---------------------------------------------------- |
| **폴더명**          | kebab-case 사용. URL 경로와 일치                     |
| **`ui.tsx`**        | 메인 페이지 컴포넌트. 전체 페이지 레이아웃 담당      |
| **`ui/[comp].tsx`** | 페이지 세부 컴포넌트들. 복잡한 경우 별도 파일로 분리 |
| **`index.ts`**      | Public API 정의. 라우터에서 import                   |

---

## 3. import 규칙

- **허용**: `widgets/*`, `features/*`, `entities/*`, `shared/*`
- **금지**: `app/*`, `pages/*` (다른 페이지)

---

## 4. 서비스 페이지 목록

| URL 경로                             | 폴더             | 설명                                             |
| ------------------------------------ | ---------------- | ------------------------------------------------ |
| `/`                                  | home             | [홈 페이지](./home/README.md) (로그인/대시보드)  |
| `/counter`                           | counter-selector | [계수 선택 페이지](./counter-selector/README.md) |
| `/counter/:counterId/timer`          | timer            | [타이머 페이지](./timer/README.md)               |
| `/admin`                             | admin            | [참가자 관리 페이지](./admin/README.md)          |
| `/counter/:counterId/controller`     | controller       | [컨트롤러 페이지](./controller/README.md)        |
| `/:competitionId/dashboard`          | dashboard        | [대시보드 페이지](./dashboard/README.md)         |
| `/counter/:counterId/manual-counter` | manual-counter   | [수동 계수 페이지](./manual-counter/README.md)   |
