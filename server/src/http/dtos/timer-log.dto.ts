import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class TimerLogResponseDto {
  @ApiProperty({ type: String, description: "타이머 로그 ID" })
  id!: string;

  @ApiProperty({ type: String, description: "참가자 ID" })
  participantId!: string;

  @ApiProperty({
    type: Number,
    description: "타이머 값",
    example: 953996400000,
  })
  value!: number;

  @ApiProperty({
    type: String,
    description: "타이머 로그 타입",
    enum: ["start", "stop", "adjust"],
    example: "start",
  })
  type!: "start" | "stop" | "adjust";

  @ApiProperty({ type: String, description: "생성 시각", format: "date-time" })
  createdAt!: Date;
}

export class AdjustTimerDto {
  @ApiProperty({
    description: "타이머 조정 시간 (밀리초, 양수는 추가, 음수는 차감)",
    example: 5000,
  })
  @IsNumber()
  adjustmentMs!: number;
}
