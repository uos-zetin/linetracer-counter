# `entities/` 디렉터리

**도메인 엔티티**를 표현하는 레이어입니다.
비즈니스 도메인의 핵심 개념들(User, Competition, Record 등)을 데이터 모델, 상태, API, UI로 구현합니다.

---

## 1. 역할 · 책임

| 구분              | 설명                         |
| ----------------- | ---------------------------- |
| **데이터 모델**   | 도메인 타입, 스키마, DTO     |
| **상태 관리**     | 도메인 상태 저장소 (Store)   |
| **API 계층**      | 도메인 관련 서버 통신        |
| **UI 프리미티브** | 도메인 전용 기본 UI 컴포넌트 |
| **도메인 로직**   | 비즈니스 규칙, 검증, 계산    |

---

## 2. 구조 · 파일 설명

```
entities/
└─ [entity-name]/
   ├─ api/               # API 통신 로직
   ├─ model/             # 상태, 비즈니스 규칙
   ├─ lib/               # 도메인 전용 유틸리티
   ├─ ui/                # 도메인 전용 UI 컴포넌트
   └─ index.ts           # Public API (필수)
```

| 파일/폴더      | 역할 및 제약사항                                   |
| -------------- | -------------------------------------------------- |
| **폴더명**     | kebab-case 사용 (`user`, `competition` 등)         |
| **`api/`**     | 외부 API 통신, 쿼리 관리                           |
| **`model/`**   | 상태, 비즈니스 규칙                                |
| **`lib/`**     | 도메인 전용 유틸리티 함수                          |
| **`ui/`**      | 도메인 전용 UI 컴포넌트                            |
| **`index.ts`** | **Public API 정의. 외부에서는 이것만 import 허용** |

---

## 3. import 규칙

- **허용**: `shared/*`
- **금지**: `app/*`, `pages/*`, `widgets/*`, `features/*`, `entities/*` (다른 entity)

---

## 4. Entity 생성 기준

### 언제 Entity로 만들까?

- **비즈니스 도메인의 핵심 개념**인 경우
- **독립적인 생명주기**를 갖는 경우
- **고유한 식별자**가 있는 경우
- 예: User, Competition, Record, Participant

### 언제 다른 곳에 구현할까?

- **값 객체 (Value Object)**: `shared/lib/`에 구현
- **UI 상태**: 해당 컴포넌트 내부에 구현
- **열거형/상수**: `shared/lib/`에 구현

---

## 5. Entity 간 관계

### 원칙

- **Entity 간 직접 import 금지**: 순환 의존성과 강결합 방지
- **상위 레이어에서 조합**: Features에서 여러 Entity를 조합하여 사용

### 관계 처리 방법

- **ID 기반 참조**: 다른 Entity의 ID만 저장 (`userId`, `competitionId`)
- **Shared Layer 활용**: 공통 타입이나 유틸리티는 `shared/lib/`에 정의
- **조합은 상위에서**: Features나 Pages에서 필요한 Entity들을 조합
