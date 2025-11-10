# ZETIN Linetracer Counter System

본 레포지토리는 서울시립대학교 중앙동아리 [ZETIN](https://zetin.uos.ac.kr)에서 개최하는 전국 라인트레이서 경연대회를 위한 기록 계수 시스템입니다.

- [Usecases](./docs/use-cases.md)
- [Domain models](./docs/domain-models.md)

## Goals

- ZETIN 전국 라인트레이서 경연 대회의 기록을 계수하는 시스템
- 계수기 H/W와 연동하여 경연 기록 측정 및 현황을 보여주는 뷰 제공
- 참가자 현황, 경연 순서, 경연 기록 등을 한눈에 보여주는 뷰(대시보드) 제공
- 대회 신청 페이지와 연동하여 대회 참가자 목록을 불러올 수 있는 기능 제공

## Architecture

계수기 시스템은 크게 3개의 구성요소로 나뉩니다.

1. [Backend](./server/)

   - 계수기 시스템의 핵심 [요구사항](./docs/requirements.md)을 처리하는 서버
   - Single Source of Truth(SSOT)를 위해 대회 전반의 상태 관리는 Backend에서만 수행함(Centralized State Management)

2. [Frontend](./client/)

   - 대회, 부문, 참가자 생성/수정/삭제 UI
   - 대회 상태 조작(참가자 선택, 타이머/스톱워치 시작/종료, 기록 인정/관리) UI
   - 대회 현황판(부문 정보, 리더보드, 다음 참가자 정보, 후원 등) UI
   - 수동 계수 UI

3. [H/W Client](./counters/)

   - 로봇의 출발/도착을 1ms 정밀도로 관측할 수 있는 H/W에 탑재된 S/W
   - 센서 데이터를 Batch로 Backend에 HTTP로 전송
     - H/W Client에서 로봇의 출발/도착 이벤트를 Backend에 발생시켜도 되지만, 코어 비즈니스 로직은 모두 Backend에서 관리하고자 하는 목적
     - 물론 Backend에서의 H/W Client 계층은 추상화되어 있기 때문에 출발/도착 이벤트를 발생시키는 경우 또한 통합 가능함

## Guides

- [관리자 ID/PW를 까먹었어요](./docs/forgot-admin-credentials.md)
- [대회 생성 및 부문/참가자 일괄 등록하기](./docs/competition-bulk-upload.md)
- [계수기 H/W 셋업하기](./docs/setup-counter-hw.md)
- [대회 진행/관리 훑어보기](./docs/counter-web-overview.md)
- [수동 계수 환경 설정하기](./docs/manual-record-setup.md)
- 교내 Member@UOS 와이파이를 사용하고 싶어요(WIP)

## How to deploy

기본적으로 교내 네트워크에 위치한 동아리 서버에 배포를 하며, 동아리 서버의 인프라 호환성을 위해 docker-compose로 배포되어 있습니다. 자세한 내용은 [deloyments](./deployments/) 디렉터리를 참고 바랍니다.

## How to contribute

### Branch strategy

- GitHub Issues 등록 후 발급되는 번호로 `issue/{번호}` 브랜치 생성 후 작업
- 개발 완료된 브랜치는 최신의 `dev` 브랜치로 rebase 후 `dev` 브랜치로 PR 작성
- `dev` 브랜치에 병합할 때에는 CODEOWNER 1명 이상의 리뷰를 받고 허락이 필요함
- 릴리스 시 `dev` 브랜치를 `main` 브랜치로 병합함과 동시에 버전 태그를 붙임

<details>
<summary>commit 메시지 컨벤션</summary>

| 타입     | 설명                              | 예시                                                         |
| -------- | --------------------------------- | ------------------------------------------------------------ |
| feat     | 새로운 기능 추가                  | feat: 경연 시간 삭감 기능 추가                               |
| fix      | 버그 수정                         | fix: 경연 시간을 음수로 설정했을 때 이상동작하는 문제 수정   |
| refactor | 코드 리팩토링 (기능 변화 없음)    | refactor: 중복 코드 제거 및 함수 분리                        |
| test     | 테스트 코드 추가/수정             | test: 대회 참가 신청한 경연자 목록 불러오는 테스트 코드 추가 |
| chore    | 기타 변경사항 (빌드, 설정 등)     | chore: 패키지 업데이트 및 .gitignore 추가                    |
| docs     | 문서 수정                         | docs: README에 실행 방법 추가                                |
| style    | 포매팅, 세미콜론 등 비기능적 변경 | style: 들여쓰기 및 공백 수정                                 |
| setup    | 프로젝트 초기 설정/환경 구성      | setup: ESLint, Prettier 설정                                 |

- commit 메시지에는 맨 끝에 `#{이슈번호}`를 포함하여 작성할 것.
- 한글로 작성해도 괜찮음.
</details>

## History

- 2025-08-16 제26회 전국 라인트레이서 경연 대회에서 약 100명의 참가자 수용
- 2025-08 中 동아리 부원 대상 필드 테스트 수행
- 2025-07 中 개발 완료
