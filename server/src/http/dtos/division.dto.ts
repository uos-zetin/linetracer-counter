import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsIn } from "class-validator";

const StatusTypes = ["ready", "ongoing", "closed"] as const;

export class DivisionResponseDto {
  @ApiProperty({ description: "대회 부문 ID" })
  id!: string;

  @ApiProperty({ description: "연결된 대회 ID" })
  competitionId!: string;

  @ApiProperty({ description: "대회 부문 이름", example: "Expert-DC 본선" })
  name!: string;

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
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: "대회 부문 설명",
    example: "멍때리면서 DC 모터 라인트레이서를 굴려보세요!",
  })
  @IsNotEmpty()
  description!: string;
}

export class UpdateDivisionDto {
  @ApiProperty({ description: "대회 부문 이름", example: "Expert-DC 본선" })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: "대회 부문 설명",
    example: "멍때리면서 DC 모터 라인트레이서를 굴려보세요!",
  })
  @IsOptional()
  description?: string;
}

export class SetDivisionStatusDto {
  @ApiProperty({
    description: "대회 부문 상태",
    type: String,
    enum: StatusTypes,
  })
  @IsIn(StatusTypes)
  status!: (typeof StatusTypes)[number];
}
