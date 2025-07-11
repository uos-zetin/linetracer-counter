import { ManualRecord } from "@/core/models";

import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ManualRecordResponseDto implements ManualRecord {
  @ApiProperty({
    type: String,
    description: "수동 계수 기록 ID",
  })
  id!: string;

  @ApiProperty({
    type: String,
    description: "참가자 ID",
  })
  participantId!: string;

  @ApiProperty({
    type: Number,
    description: "수동 계수 기록 값 (밀리초)",
    example: 5000,
  })
  value!: number;

  @ApiProperty({
    type: String,
    description: "수동 계수자 이름",
    example: "김계란",
  })
  recorderName!: string;

  @ApiProperty({
    type: String,
    format: "date-time",
    description: "생성 시각",
  })
  createdAt!: Date;
}

export class AddManualRecordDto {
  @ApiProperty({
    type: Number,
    description: "수동 계수 기록 값 (밀리초)",
    example: 5000,
  })
  @IsNumber()
  @IsNotEmpty()
  value!: number;

  @ApiProperty({
    type: String,
    description: "수동 계수자 이름",
    example: "김계란",
  })
  @IsString()
  @IsNotEmpty()
  recorderName!: string;
}
