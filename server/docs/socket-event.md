# Socket 이벤트 API 문서

## 개요

라인트레이서 대회 시스템의 Socket.IO 기반 실시간 이벤트 API에 대한 클라이언트용 문서이다.

### 소켓 네임스페이스

1. **`/socket/divisions/progress`** - 대회 진행 상황 실시간 모니터링
2. **`/socket/counters`** - 계수기 상태 및 이벤트 실시간 모니터링

## Division Progress 네임스페이스

대회 부문의 실시간 진행 상황을 제공한다. 현재 경연자, 다음 경연자, 최고 기록 등의 정보를 실시간으로 받을 수 있다.

### 연결 요구사항

- 경로: `/socket/divisions/progress`
- **파라미터**
  - `divisionId` Query (string, required): 모니터링할 대회 부문 ID
  - `Authorization` Header (string, required): 인증을 위한 세션키
- 예시
  - `/socket/divisions/progress?divisionId=02cf136d-06fe-4fcc-a83e-396405bed112`

### 이벤트

#### `message` 이벤트 (수신)

- 연결 시 즉시 대회 부문의 `DivisionProgress`를 전송한다.
- 대회 부문의 진행 상황이 변경될 때 `DivisionProgress`를 전송한다.
  - `Division` 엔티티에 변경이 발생할 때
  - 현재 경연자가 변경될 때
  - 현재 경연자에 대한 `Participant`가 변경될 때
  - 현재 경연자에 대한 `TimerLog`가 추가될 때
  - 현재 경연자에 대한 `Record`가 추가/변경될 때
  - 현재 경연자에 대한 `ManualRecord`가 추가될 때
  - 현재 경연자에 대한 다음 경연자 목록이 변경될 때
- **데이터 형식**
  - [Core Model](../src/core/models.ts)의 `DivisionProgress` 타입

#### `error` 이벤트 (수신)

- 연결 또는 인증 오류 시 수신한다.
- **데이터 형식**
  ```typescript
  interface SocketErrorMessage {
    code:
      | "MISSING_DIVISION_ID"
      | "MISSING_SESSION"
      | "INVALID_SESSION"
      | "SUBSCRIPTION_ERROR";
    message?: string;
  }
  ```
- **오류 코드 설명**
  - `MISSING_DIVISION_ID`: divisionId 쿼리 파라미터가 누락됨
  - `MISSING_SESSION`: session 쿼리 파라미터가 누락됨
  - `INVALID_SESSION`: 유효하지 않은 세션
  - `SUBSCRIPTION_ERROR`: 구독 중 알 수 없는 오류 발생

## Counter 네임스페이스

계수기의 실시간 상태와 이벤트를 제공하는 네임스페이스이다. 계수기의 실시간 상태 변화를 실시간으로 모니터링할 수 있다.

### 연결 요구사항

- 경로: `/socket/counters`
- **파라미터**
  - `deviceId` Query (string, required): 모니터링할 계수기 장치 ID
  - `Authorization` Header (string, required): 인증을 위한 세션키
- 예시
  - `/socket/counters?deviceId=02cf136d-06fe-4fcc-a83e-396405bed112`

### 이벤트

#### `message` 이벤트 (수신)

- 연결 시 즉시 계수기의 현재 상태 정보를 전송한다.
- 계수기에 이벤트 발생 시 계수기의 현재 상태 정보를 전송한다.
  - 계수기 시작/정지 상태가 변경될 때
  - 계수기가 대회 부문에 연결될 때
- 데이터 예시
  ```json
  {
    "deviceId": "02cf136d-06fe-4fcc-a83e-396405bed112",
    "name": "Counter 001",
    "startedAt": 1717209600000,
    "stoppedAt": null,
    "divisionId": null
  }
  ```

#### `event` 이벤트 (수신)

- 계수기에서 발생하는 실시간 이벤트를 수신한다.
- **데이터 형식**
  ```typescript
  type CounterEvent =
    | {
        type: "counter:updated";
        startedAt: number | null;
        stoppedAt: number | null;
      }
    | {
        type: "division:bound";
        divisionId: string;
      }
    | {
        type: "division:unbound";
      };
  ```
- 데이터 예시
  ```json
  {
    "type": "counter:updated",
    "startedAt": 1717209600000,
    "stoppedAt": null
  }
  ```
  ```json
  {
    "type": "division:bound",
    "divisionId": "02cf136d-06fe-4fcc-a83e-396405bed112"
  }
  ```
- **이벤트 타입 설명**
  - `counter:updated`: 계수기 시작/정지 상태가 변경됨
  - `division:bound`: 계수기가 대회 부문에 연결됨
  - `division:unbound`: 계수기가 대회 부문에서 해제됨

#### `error` 이벤트 (수신)

- 연결 또는 인증 오류 시 수신한다.
- **데이터 형식**
  ```typescript
  interface SocketErrorMessage {
    code:
      | "MISSING_DEVICE_ID"
      | "MISSING_SESSION"
      | "INVALID_SESSION"
      | "SUBSCRIPTION_ERROR";
    message?: string;
  }
  ```
- **오류 코드 설명**
  - `MISSING_DEVICE_ID`: deviceId 쿼리 파라미터가 누락됨
  - `MISSING_SESSION`: session 쿼리 파라미터가 누락됨
  - `INVALID_SESSION`: 유효하지 않은 세션
  - `SUBSCRIPTION_ERROR`: 구독 중 알 수 없는 오류 발생

## Socket.IO 클라이언트 예제 코드

### 기본 연결 예제

```javascript
import { io } from "socket.io-client";

// Division Progress 소켓 연결
const divisionProgressSocket = io(
  "http://localhost:3000/socket/divisions/progress",
  {
    query: {
      divisionId: "division-123",
    },
    extraHeaders: {
      authorization: "Session your-session-token",
    },
  }
);

// Counter 소켓 연결
const counterSocket = io("http://localhost:3000/socket/counters", {
  query: {
    deviceId: "counter-device-001",
  },
  extraHeaders: {
    authorization: "Session your-session-token",
  },
});
```

### Division Progress 이벤트 처리

```javascript
// 대회 진행 상황 실시간 업데이트
divisionProgressSocket.on("message", (progress) => {
  console.log("대회 진행 상황 업데이트:", progress);

  // 현재 경연자 정보
  if (progress.runner) {
    console.log("현재 경연자:", progress.runner.participant.name);
    console.log("팀명:", progress.runner.participant.teamName);
    console.log("로봇명:", progress.runner.participant.robotName);

    // 최신 기록
    if (progress.runner.records.length > 0) {
      const latestRecord =
        progress.runner.records[progress.runner.records.length - 1];
      console.log("최신 기록:", latestRecord.value + "ms");
    }
  }

  // 다음 경연자들
  console.log("다음 경연자들:");
  progress.nextRunners.forEach((participant, index) => {
    console.log(`${index + 1}. ${participant.name} (${participant.teamName})`);
  });

  // 최고 기록들
  console.log("현재 최고 기록들:");
  progress.topRecords.slice(0, 3).forEach((record, index) => {
    console.log(`${index + 1}위: ${record.value}ms`);
  });
});

// 오류 처리
divisionProgressSocket.on("error", (error) => {
  console.error("Division Progress 소켓 오류:", error);

  switch (error.code) {
    case "MISSING_DIVISION_ID":
      console.log("대회 부문 ID가 필요합니다.");
      break;
    case "INVALID_SESSION":
      console.log("세션이 유효하지 않습니다. 다시 로그인해주세요.");
      break;
    default:
      console.log("알 수 없는 오류가 발생했습니다.");
  }
});
```

### Counter 이벤트 처리

```javascript
// 계수기 상태 업데이트
counterSocket.on("message", (counter) => {
  console.log("계수기 상태 업데이트:", counter);

  if (counter.startedAt && !counter.stoppedAt) {
    console.log("계수기 동작 중:", new Date(counter.startedAt));
  } else if (counter.stoppedAt) {
    const duration = counter.stoppedAt - counter.startedAt;
    console.log("계수 완료:", duration + "ms");
  } else {
    console.log("계수기 대기 중");
  }

  if (counter.divisionId) {
    console.log("연결된 대회 부문:", counter.divisionId);
  }
});

// 계수기 실시간 이벤트
counterSocket.on("event", (event) => {
  console.log("계수기 이벤트:", event);

  switch (event.type) {
    case "counter:updated":
      if (event.startedAt && !event.stoppedAt) {
        console.log("🟢 계수 시작!");
      } else if (event.stoppedAt) {
        const duration = event.stoppedAt - event.startedAt;
        console.log("🔴 계수 완료! 소요시간:", duration + "ms");
      }
      break;

    case "division:bound":
      console.log("📌 대회 부문 연결됨:", event.divisionId);
      break;

    case "division:unbound":
      console.log("📌 대회 부문 연결 해제됨");
      break;
  }
});

// 오류 처리
counterSocket.on("error", (error) => {
  console.error("Counter 소켓 오류:", error);

  switch (error.code) {
    case "MISSING_DEVICE_ID":
      console.log("계수기 장치 ID가 필요합니다.");
      break;
    case "INVALID_SESSION":
      console.log("세션이 유효하지 않습니다. 다시 로그인해주세요.");
      break;
    default:
      console.log("알 수 없는 오류가 발생했습니다.");
  }
});

// 연결 상태 이벤트
counterSocket.on("connect", () => {
  console.log("Counter 소켓 연결됨");
});

counterSocket.on("disconnect", (reason) => {
  console.log("Counter 소켓 연결 해제:", reason);
});
```
