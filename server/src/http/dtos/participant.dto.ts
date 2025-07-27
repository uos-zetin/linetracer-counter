import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class ParticipantResponseDto {
  @ApiProperty({ description: "참가자 ID" })
  id!: string;

  @ApiProperty({ description: "대회 부문 ID" })
  divisionId!: string;

  @ApiProperty({ description: "참가자 이름", example: "김태환" })
  name!: string;

  @ApiProperty({ description: "팀 이름", example: "멍때리기팀" })
  teamName!: string;

  @ApiProperty({ description: "로봇 이름", example: "멍때리기로봇" })
  robotName!: string;

  @ApiProperty({
    description: "하고 싶은 말",
    example: "멍때리면서 라인트레이서를 굴려보겠습니다!",
  })
  comment!: string;

  @ApiProperty({ description: "원본 경연 순번", example: 1 })
  orderRaw!: number;

  @ApiProperty({ description: "생성 시각", format: "date-time" })
  createdAt!: Date;
}

export class CreateParticipantDto {
  @ApiProperty({ description: "참가자 이름", example: "김태환" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: "팀 이름", example: "멍때리기팀" })
  @IsString()
  @IsNotEmpty()
  teamName!: string;

  @ApiProperty({ description: "로봇 이름", example: "멍때리기로봇" })
  @IsString()
  @IsNotEmpty()
  robotName!: string;

  @ApiProperty({
    description: "하고 싶은 말",
    example: "멍때리면서 라인트레이서를 굴려보겠습니다!",
  })
  @IsString()
  @IsNotEmpty()
  comment!: string;

  @ApiProperty({ description: "원본 경연 순번", example: 1 })
  @IsNumber()
  orderRaw!: number;
}

export class UpdateParticipantDto {
  @ApiProperty({ description: "참가자 이름", example: "김태환" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: "팀 이름", example: "멍때리기팀" })
  @IsString()
  @IsOptional()
  teamName?: string;

  @ApiProperty({ description: "로봇 이름", example: "멍때리기로봇" })
  @IsString()
  @IsOptional()
  robotName?: string;

  @ApiProperty({
    description: "하고 싶은 말",
    example: "멍때리면서 라인트레이서를 굴려보겠습니다!",
  })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({ description: "원본 경연 순번", example: 1 })
  @IsNumber()
  @IsOptional()
  orderRaw?: number;
}
