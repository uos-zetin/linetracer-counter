import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CompetitionResponseDto {
  @ApiProperty({ description: "대회 ID" })
  id!: string;

  @ApiProperty({ description: "대회 이름", example: "제0회 멍때리기 대회" })
  name!: string;

  @ApiProperty({
    description: "대회 설명",
    example: "멍때리기는 뇌를 쉬게 해준대요.",
  })
  description!: string;

  @ApiProperty({ description: "대회 생성 시각", format: "date-time" })
  createdAt!: Date;
}

export class CreateCompetitionDto {
  @ApiProperty({ description: "대회 이름", example: "제0회 멍때리기 대회" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: "대회 설명",
    example: "멍때리기는 뇌를 쉬게 해준대요.",
  })
  @IsString()
  @IsNotEmpty()
  description!: string;
}

export class UpdateCompetitionDto {
  @ApiProperty({ description: "대회 이름", example: "제0회 멍때리기 대회" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: "대회 설명",
    example: "멍때리기는 뇌를 쉬게 해준대요.",
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;
}
