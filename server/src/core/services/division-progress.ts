import {
  DivisionNotOngoingError,
  RunnerNotParticipatedError,
  RunnerNotSetError,
} from "@/core/errors";
import {
  DivisionProgressState,
  DivisionProgressStateStore,
  Unsubscriber,
} from "@/core/interfaces";
import { Division, DivisionProgress, Record } from "@/core/models";
import { CompetitionService } from "@/core/services/competition";
import {
  ParticipantEvent,
  ParticipantService,
} from "@/core/services/participant";
import EventEmitter from "events";

export type DivisionProgressCallback = (
  progress: DivisionProgress
) => Promise<void>;

type RunnerEvent =
  | {
      type: "runner-event";
      participantId: string;
      event: ParticipantEvent;
    }
  | {
      type: "state-changed";
      state: DivisionProgressState;
    };

interface RunnerEventEmitter extends EventEmitter {
  on(divisionId: string, listener: (event: RunnerEvent) => void): this;
  off(divisionId: string, listener: (event: RunnerEvent) => void): this;
  emit(divisionId: string, event: RunnerEvent): boolean;
}

/**
 * 대회 부문 진행 상황 및 상태 관리 서비스
 *
 * 다음과 같은 포괄적인 기능을 제공합니다:
 * - 부문 생명주기 관리 (시작/종료/초기화)
 * - 경연자 지정 및 순서 관리
 * - 실시간 진행 상황 추적 및 이벤트 구독
 * - 참가자 순서 관리
 */
export class DivisionProgressService {
  private readonly competitionSrv: CompetitionService;
  private readonly participantSrv: ParticipantService;
  private readonly stateStore: DivisionProgressStateStore;
  private readonly runnerEventEmitter: RunnerEventEmitter = new EventEmitter();

  constructor(di: {
    competitionService: CompetitionService;
    participantService: ParticipantService;
    divisionProgressStateStore: DivisionProgressStateStore;
  }) {
    this.competitionSrv = di.competitionService;
    this.participantSrv = di.participantService;
    this.stateStore = di.divisionProgressStateStore;
  }

  /**
   * 대회 부문을 시작한다.
   *
   * - 대회 부문이 시작되면 경연 순번이 결정된다.
   * - 대회 부문의 상태를 "ongoing"으로 변경한다.
   */
  public async openDivision(divisionId: string) {
    const division = await this.competitionSrv.getDivision(divisionId);
    if (division.status === "ongoing") {
      return;
    }

    // 참가자를 조회하여 참가 순번(orderRaw)으로 정렬한 후 ID 스냅샷 생성
    const participants = await this.participantSrv.getParticipants(divisionId);
    const participantOrder = participants
      .sort((a, b) => a.orderRaw - b.orderRaw)
      .map((p) => p.id);

    await this.stateStore.setState(divisionId, {
      runnerId: null,
      participantOrder,
    });
    await this.competitionSrv.setDivisionStatus(divisionId, "ongoing");
  }

  /**
   * 대회 부문을 종료한다.
   *
   * - 대회 부문이 종료되면 경연 순번 정보가 초기화된다.
   * - 대회 부문의 상태를 "closed"로 변경한다.
   */
  public async closeDivision(divisionId: string) {
    const division = await this.competitionSrv.getDivision(divisionId);
    if (division.status === "closed") {
      return;
    }

    await this.stateStore.resetState(divisionId);
    await this.competitionSrv.setDivisionStatus(divisionId, "closed");
  }

  /**
   * 대회 부문을 초기화한다.
   *
   * - 대회 부문의 진행 정보를 초기화한다.
   * - 대회 부문의 상태를 "ready"로 변경한다.
   */
  public async resetDivision(divisionId: string) {
    await this.stateStore.resetState(divisionId);
    await this.competitionSrv.setDivisionStatus(divisionId, "ready");
  }

  /**
   * 부문이 "ongoing" 상태인지 검증하고 부문 데이터를 반환한다.
   * @throws DivisionNotOngoingError 부문이 진행 중 상태가 아닌 경우
   */
  private async getDivisionAndCheckOngoing(
    divisionId: string
  ): Promise<Division> {
    const division = await this.competitionSrv.getDivision(divisionId);
    if (division.status !== "ongoing") {
      throw new DivisionNotOngoingError(
        `Division ${divisionId} is not ongoing`
      );
    }
    return division;
  }

  /**
   * 부문의 현재 활성 경연자를 설정한다.
   * @throws DivisionNotOngoingError 부문이 진행 중 상태가 아닌 경우
   * @throws RunnerNotParticipatedError 경연자가 참가자 목록에 없는 경우
   */
  public async setRunner(divisionId: string, runnerId: string) {
    await this.getDivisionAndCheckOngoing(divisionId);

    const state = await this.stateStore.getState(divisionId);
    if (!state.participantOrder.includes(runnerId)) {
      throw new RunnerNotParticipatedError(
        `Runner ${runnerId} is not participated in the division ${divisionId}`
      );
    }

    const newState = { ...state, runnerId };
    await this.stateStore.setState(divisionId, newState);
    this.onStateChanged(divisionId, newState);
  }

  /**
   * 현재 경연자에 기록을 추가한다.
   * @throws DivisionNotOngoingError 부문이 진행 중 상태가 아닌 경우
   * @throws RunnerNotSetError 현재 설정된 경연자가 없는 경우
   */
  public async addRecordToRunner(
    divisionId: string,
    value: number,
    source: Record["source"],
    note: string
  ): Promise<Record> {
    await this.getDivisionAndCheckOngoing(divisionId);

    const state = await this.stateStore.getState(divisionId);
    if (state.runnerId === null) {
      throw new RunnerNotSetError(
        `Runner is not set in the division ${divisionId}`
      );
    }

    return await this.participantSrv.addRecord(
      state.runnerId,
      value,
      source,
      note
    );
  }

  /**
   * 현재 경연자를 대기열의 마지막으로 미루고 다음 경연자로 넘어간다.
   * @throws DivisionNotOngoingError 부문이 진행 중 상태가 아닌 경우
   * @throws RunnerNotSetError 현재 설정된 경연자가 없는 경우
   */
  public async postponeRunner(divisionId: string) {
    await this.getDivisionAndCheckOngoing(divisionId);

    const state = await this.stateStore.getState(divisionId);
    const { runnerId, participantOrder } = state;

    if (runnerId === null) {
      throw new RunnerNotSetError(
        `Runner is not set in the division ${divisionId}`
      );
    }

    const orderLength = participantOrder.length;

    // 다음 경연자 위치 계산
    const runnerIdx = participantOrder.indexOf(runnerId);
    const nextRunnerIdx = Math.min(runnerIdx + 1, orderLength - 1);
    const nextRunnerId = participantOrder[nextRunnerIdx];

    // 현재 경연자를 끝으로 이동시켜 참가자 순서 재구성
    const newParticipantOrder = [
      ...participantOrder.slice(0, runnerIdx),
      ...participantOrder.slice(runnerIdx + 1),
      runnerId,
    ];

    const newState = {
      runnerId: nextRunnerId,
      participantOrder: newParticipantOrder,
    };
    await this.stateStore.setState(divisionId, newState);
    this.onStateChanged(divisionId, newState);
  }

  public async getParticipantOrder(divisionId: string): Promise<string[]> {
    const state = await this.stateStore.getState(divisionId);
    return state.participantOrder;
  }

  /**
   * 대회 대기열에서 특정 참가자의 순서 위치를 변경한다.
   * @throws DivisionNotOngoingError 부문이 진행 중 상태가 아닌 경우
   * @throws RunnerNotParticipatedError 참가자가 부문에 없는 경우
   */
  public async changeParticipantOrder(
    divisionId: string,
    participantId: string,
    order: number
  ) {
    await this.getDivisionAndCheckOngoing(divisionId);

    const state = await this.stateStore.getState(divisionId);
    const { participantOrder } = state;

    const participantIdx = participantOrder.indexOf(participantId);
    if (participantIdx === -1) {
      throw new RunnerNotParticipatedError(
        `Participant ${participantId} is not participated in the division ${divisionId}`
      );
    }

    // 현재 위치에서 제거하고 새 위치에 삽입하여 참가자 순서 재정렬
    const newParticipantOrder = [...participantOrder];
    newParticipantOrder.splice(participantIdx, 1);
    newParticipantOrder.splice(order, 0, participantId);

    const newState = {
      ...state,
      participantOrder: newParticipantOrder,
    };
    await this.stateStore.setState(divisionId, newState);
    this.onStateChanged(divisionId, newState);
  }

  /**
   * 전반적인 부문 진행 정보를 조회한다.
   */
  public async getDivisionProgress(
    divisionId: string
  ): Promise<DivisionProgress> {
    // 부문 및 대회 정보 조회
    const division = await this.competitionSrv.getDivision(divisionId);
    const competition = await this.competitionSrv.getCompetition(
      division.competitionId
    );

    const { runnerId, participantOrder } = await this.stateStore.getState(
      divisionId
    );

    // 모든 관련 데이터와 함께 현재 경연자 정보 조회
    let runner: DivisionProgress["runner"] | null = null;
    if (runnerId) {
      runner = {
        participant: await this.participantSrv.getParticipant(runnerId),
        timerLogs: await this.participantSrv.getTimerLogs(runnerId),
        records: await this.participantSrv.getRecords(runnerId),
        manualRecords: await this.participantSrv.getManualRecords(runnerId),
      };
    }

    // 대기열의 다음 경연자들 조회 (최대 5명)
    const runnerIndex =
      runnerId !== null ? participantOrder.indexOf(runnerId) : -1;
    const nextRunnerIds = participantOrder.slice(
      runnerIndex + 1,
      runnerIndex + 6 // 최대 5명의 다음 참가자 표시
    );
    const nextRunners = await Promise.all(
      nextRunnerIds.map((id: string) => this.participantSrv.getParticipant(id))
    );

    // 부문 리더보드 기록 조회
    const topRecords = await this.competitionSrv.getTopRecordsByDivision(
      divisionId
    );

    return {
      competition,
      division,
      runner,
      nextRunners,
      topRecords,
    };
  }

  /**
   * 특정 부문에 대해 경연자의 이벤트를 구독해야 하는데, 그 구독 정보를 저장해두는 Map이다.
   */
  private runnerWatcher: Map<
    string, // divisionId
    {
      runnerId: string | null; // 현재 감시 중인 경연자 ID
      unsubscribe: Unsubscriber | null; // 참가자 이벤트 구독 해제 함수
    }
  > = new Map();

  /**
   * 경연자 이벤트를 구독 및 관리한다.
   *
   * - 경연 부문의 현재 경연자가 설정되면 이 메서드를 호출하여 경연자 이벤트를 재구독해야 한다.
   * - 경연자 이벤트가 발생하면 DivisionProgress 메시지 구독자에게 이벤트를 전달한다.
   */
  private watchRunner(divisionId: string, runnerId: string | null) {
    const watcher = this.runnerWatcher.get(divisionId);

    // 경연자 초기화 시 watcher 정리
    if (runnerId === null) {
      watcher?.unsubscribe?.();
      this.runnerWatcher.delete(divisionId);
      return;
    }

    const subscribe = (runnerId: string) => {
      return this.participantSrv.subscribeParticipantEvent(
        runnerId,
        async (event: ParticipantEvent) => {
          this.runnerEventEmitter.emit(divisionId, {
            type: "runner-event",
            participantId: runnerId,
            event,
          });
        }
      );
    };

    if (!watcher) {
      // watcher가 없는 경우 새로 구독
      this.runnerWatcher.set(divisionId, {
        runnerId,
        unsubscribe: subscribe(runnerId),
      });
    } else if (watcher.runnerId !== runnerId) {
      // 경연자 변경 시 watcher 구독 해제 및 새로 구독
      watcher.unsubscribe?.();
      watcher.unsubscribe = subscribe(runnerId);
      watcher.runnerId = runnerId;
    }
  }

  /**
   * 부문 상태 변경 시 이 메서드를 호출하여 이벤트 발생 및 경연자 감시 업데이트를 수행한다.
   */
  private onStateChanged(divisionId: string, state: DivisionProgressState) {
    this.watchRunner(divisionId, state.runnerId);
    this.runnerEventEmitter.emit(divisionId, {
      type: "state-changed",
      state,
    });
  }

  /**
   * 실시간 부문 진행 업데이트를 구독한다.
   *
   * 다음에 대한 포괄적인 이벤트 모니터링을 설정한다:
   * - 부문 정보 변경
   * - 현재 경연자 데이터 (기록, 수동 계수, 타이머 로그)
   * - 부문 최고 기록 업데이트
   *
   * 모니터링되는 데이터가 변경될 때마다 콜백 함수가 호출된다.
   *
   * @param divisionId - 진행 업데이트를 모니터링할 부문
   * @param callback - 진행 데이터 변경 시 호출할 함수
   * @returns 모니터링을 중지하고 리소스를 정리하는 구독 해제 함수
   */
  public subscribeDivisionProgress(
    divisionId: string,
    callback: DivisionProgressCallback
  ): Unsubscriber {
    // 구독 실패를 방지하기 위해 콜백을 에러 처리로 래핑
    const safeCb = async () => {
      try {
        const progress = await this.getDivisionProgress(divisionId);
        await callback(progress);
      } catch (e) {
        console.error(e);
      }
    };

    // 경연자의 상태 변경 이벤트 구독
    this.runnerEventEmitter.on(divisionId, safeCb);

    /**
     * Lazy Watching
     *
     * 인스턴스 생성 시 부문 상태를 모두 조회하고 이벤트 구독하는 것이 비효율적이므로
     * 이벤트 구독 시 경연자를 감시하도록 한다.
     */
    (async () => {
      const watcher = this.runnerWatcher.get(divisionId);
      if (!watcher) {
        const state = await this.stateStore.getState(divisionId);
        this.watchRunner(divisionId, state.runnerId);
      }
    })();

    // 부문 레벨 이벤트 구독 (상태 변경 등)
    const unsubscribeDivisionEvent = this.competitionSrv.subscribeDivisionEvent(
      divisionId,
      async (event) => {
        if (event.type === "deleted") {
          return;
        }
        await safeCb();
      }
    );

    // 모든 구독을 제거하는 정리 함수 반환
    return () => {
      this.runnerEventEmitter.off(divisionId, safeCb); // 경연자의 상태 변경 이벤트 구독 해제
      unsubscribeDivisionEvent(); // 부문 이벤트 구독 해제
    };
  }
}
