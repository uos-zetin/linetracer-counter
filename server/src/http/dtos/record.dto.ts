import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class RecordResponseDto {
  @ApiProperty({ type: String, description: "기록 ID" })
  id!: string;

  @ApiProperty({ type: String, description: "참가자 ID" })
  participantId!: string;

  @ApiProperty({ type: Number, description: "기록 값", example: 1000 })
  value!: number;

  @ApiProperty({
    type: String,
    description: "기록 출처",
    enum: ["stopwatch", "manual", "other"],
    example: "stopwatch",
  })
  source!: "stopwatch" | "manual" | "other";

  @ApiProperty({
    type: String,
    description: "기록 상태",
    enum: ["pending", "approved", "rejected"],
    example: "pending",
  })
  status!: "pending" | "approved" | "rejected";

  @ApiProperty({ type: String, description: "비고", example: "테스트 기록" })
  note!: string;

  @ApiProperty({ type: String, description: "생성 시각", format: "date-time" })
  createdAt!: Date;
}

export class AddRecordDto {
  @ApiProperty({ type: Number, description: "기록 값", example: 1000 })
  @IsNumber()
  @Min(0)
  value!: number;

  @ApiProperty({
    type: String,
    description: "기록 출처",
    enum: ["stopwatch", "manual", "other"],
    example: "stopwatch",
  })
  @IsEnum(["stopwatch", "manual", "other"])
  source!: "stopwatch" | "manual" | "other";

  @ApiProperty({ type: String, description: "비고", example: "테스트 기록" })
  @IsString()
  @IsNotEmpty()
  note!: string;
}

export class SetRecordNoteDto {
  @ApiProperty({ type: String, description: "비고", example: "수정된 비고" })
  @IsString()
  @IsNotEmpty()
  note!: string;
}

export class SetRecordStatusDto {
  @ApiProperty({
    type: String,
    description: "기록 상태",
    enum: ["pending", "approved", "rejected"],
    example: "approved",
  })
  @IsEnum(["pending", "approved", "rejected"])
  status!: "pending" | "approved" | "rejected";
}
