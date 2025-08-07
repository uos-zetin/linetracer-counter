import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

import { CompetitionResponseDto } from "./competition.dto";
import { ManualRecordResponseDto } from "./manual-record.dto";
import { ParticipantResponseDto } from "./participant.dto";
import { RecordResponseDto } from "./record.dto";
import { TimerLogResponseDto } from "./timer-log.dto";

const StatusTypes = ["ready", "ongoing", "closed"] as const;

export class DivisionResponseDto {
  @ApiProperty({ description: "대회 부문 ID" })
  id!: string;

  @ApiProperty({ description: "연결된 대회 ID" })
  competitionId!: string;

  @ApiProperty({ description: "대회 부문 이름", example: "Expert-DC 본선" })
  name!: string;

  @ApiProperty({
    description: "주어진 경연 시간(ms)",
    example: 4 * 60 * 1000, // 4분
  })
  timeLimit!: number;

  @ApiProperty({
    description: "대회 부문 설명",
    example: "멍때리면서 DC 모터 라인트레이서를 굴려보세요!",
  })
  description!: string;

  @ApiProperty({ description: "대회 부문 생성 시각", format: "date-time" })
  createdAt!: Date;

  @ApiProperty({
    description: "대회 부문 상태",
    type: String,
    enum: StatusTypes,
  })
  status!: (typeof StatusTypes)[number];
}

export class CreateDivisionDto {
  @ApiProperty({ description: "대회 부문 이름", example: "Expert-DC 본선" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: "주어진 경연 시간(ms)",
    example: 4 * 60 * 1000, // 4분
  })
  @IsNumber()
  @IsNotEmpty()
  timeLimit!: number;

  @ApiProperty({
    description: "대회 부문 설명",
    example: "멍때리면서 DC 모터 라인트레이서를 굴려보세요!",
  })
  @IsString()
  description!: string;
}

export class UpdateDivisionDto {
  @ApiProperty({ description: "대회 부문 이름", example: "Expert-DC 본선" })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: "주어진 경연 시간(ms)",
    example: 4 * 60 * 1000, // 4분
  })
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  timeLimit?: number;

  @ApiProperty({
    description: "대회 부문 설명",
    example: "멍때리면서 DC 모터 라인트레이서를 굴려보세요!",
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class DivisionProgressResponseDto {
  @ApiProperty({ description: "대회 부문 정보" })
  division!: DivisionResponseDto;

  @ApiProperty({ description: "대회 정보" })
  competition!: CompetitionResponseDto;

  @ApiProperty({ description: "현재 경연자 정보", nullable: true })
  runner!: {
    participant: ParticipantResponseDto;
    timerLogs: TimerLogResponseDto[];
    records: RecordResponseDto[];
    manualRecords: ManualRecordResponseDto[];
  } | null;

  @ApiProperty({
    description: "다음 경연자 정보",
    type: [ParticipantResponseDto],
  })
  nextRunners!: ParticipantResponseDto[];

  @ApiProperty({ description: "최고 기록 정보", type: [RecordResponseDto] })
  topRecords!: RecordResponseDto[];
}

export class SetCurrentRunnerDto {
  @ApiProperty({ description: "설정할 경연자의 참가자 ID" })
  @IsString()
  @IsNotEmpty()
  participantId!: string;
}

export class ChangeParticipantOrderDto {
  @ApiProperty({ description: "변경할 참가자의 참가자 ID" })
  @IsString()
  @IsNotEmpty()
  participantId!: string;

  @ApiProperty({ description: "변경할 참가자의 순번" })
  @IsNumber()
  @IsNotEmpty()
  order!: number;
}
