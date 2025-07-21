# Selector 사용 가이드라인 (v1.0)

> **Selector 시그니처**  
> `type Selector<S> = <T>(selector: (state: S) => T, equality?: (a: T, b: T) => boolean) => T`

React 컴포넌트가 **필요한 값만 구독**해 최소한으로 리렌더링하도록 만든 패턴입니다.  
이 문서는 프로젝트에서 Selector를 일관되게 적용하기 위한 규칙·예시·FAQ를 담고 있습니다.  
(예시 코드는 전부 TypeScript+Zustand 기준입니다.)

---

## 1. 필수 규칙 (TL;DR)

|  #  | 규칙                                                                            | 왜 필요한가?                                                       |
| :-: | ------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
|  1  | **전체 구독 금지** — 항상 필요한 값만 선택                                      | 전체 객체 구독 시 사소한 상태 변동에도 컴포넌트가 전부 다시 렌더됨 |
|  2  | **`shallow` 등 equality 함수 사용**                                             | 여러 함수·객체를 selector로 묶을 때 참조 안정성 유지               |
|  3  | **selector 안에서 `Date.now()` 등 변동값 금지**                                 | 매 렌더마다 값이 달라져 불필요한 렌더 유발                         |
|  4  | 간단 1차 파생(getter)은 스토어 내부, 복잡 계산은 `lib/selectors.ts` 순수 함수로 | 로직 중복 제거 + 테스트 용이                                       |
|  5  | ESLint 경고가 뜨면 즉시 해결                                                    | `no-unused-vars` (`_eq`) , `fsd-layer-import` 등 규칙 강제         |

---

## 2. 기본 사용 패턴

### 2-1. 값 하나 구독

```ts
// ✅ 필요 값만
const count = useCounterStore((s) => s.count);
```

### 2-2. 함수(액션) 구독

```ts
// ✅ 함수 묶음 + shallow 비교
const { inc, dec } = useCounterStore((s) => ({ inc: s.inc, dec: s.dec }), shallow);
```

### 2-3. 상태 + 함수 동시에

```ts
const { count, inc } = useCounterStore((s) => ({ count: s.count, inc: s.inc }), shallow);
```

---

## 3. equality 함수 가이드

| 반환값 유형                        | 추천 equality                 |
| ---------------------------------- | ----------------------------- |
| 스칼라 (number / boolean / string) | 생략 (`===` 얕은 비교로 충분) |
| 함수 참조 1-2개                    | `shallow`                     |
| 객체·배열                          | `shallow` (또는 커스텀 비교)  |

```ts
import { shallow } from "zustand/react";

const actions = useTodoStore((s) => ({ add: s.add, remove: s.remove }), shallow);
```

---

## 4. Slice 폴더 템플릿

```
entities/your-entity/
├─ model/
│  ├─ types.ts
│  └─ slice.zustand.ts
├─ lib/
│  ├─ provider.ts
│  ├─ hooks.ts          ← useElapsedMs, useActions 등
│  └─ selectors.ts      ← 순수 함수(getElapsedMs 등)
└─ index.ts             ← Public API 재-export
```

- Provider: 스토어 생성 + Context 주입만.
- hooks.ts: **Selector 호출**만 담당(컴포넌트가 selector 문법 몰라도 됨).
- selectors.ts: 스토어·React 의존 없는 순수 계산 함수.

---

## 5. 안티패턴 & 해결법

| 안티패턴                                         | 문제                           | 해결                              |
| ------------------------------------------------ | ------------------------------ | --------------------------------- |
| `const st = useStore();`                         | 전체 상태 구독 → 과도한 리렌더 | 필요한 값만 선택                  |
| `const {add, remove} = useStore(s => ({...s}) )` | 매번 새 객체 생성 → 렌더       | `shallow` 전달                    |
| selector 안에서 `Date.now()`                     | 값이 매 렌더 달라짐            | selector 외부에서 매개변수로 전달 |

---

## 6. 리렌더 디버깅 팁

```ts
const renders = useRef(0);
renders.current += 1;
console.log("MyComp renders:", renders.current);
```

- 액션 호출 후 renders 증가 수를 확인해 쓸데없는 렌더 여부를 바로 파악.
- 문제가 보이면 selector 범위·equality 설정을 점검.

---

## 7. FAQ

**Q. React(useState) 버전은 `equality` 안 쓰는데 괜찮나요?**

> 네. React 훅 스토어는 selector 결과를 즉시 계산하고, 함수 참조가 변하지 않으므로 eq 매개변수를 선언조차 하지 않아도 됩니다.

**Q. Getter 내부와 lib/selectors.ts 순수 함수가 중복 아닌가요?**

> 로직은 한 곳(lib/selectors)에만 두고, Getter쪽은 그대로 호출만 하도록 연결합니다.
> 이렇게 하면 순수 함수 테스트·재사용과 스토어 자동완성 두 가지 효과를 동시에 얻습니다.

---

## 8. 업데이트 프로세스

1. 규칙이 바뀌면 본 문서를 **최우선으로 수정**한다.
2. ESLint 설정에 동일 규칙을 반영한다.
3. 새 Slice를 추가할 때는 이 가이드의 폴더 템플릿·패턴을 복사해 시작한다.
