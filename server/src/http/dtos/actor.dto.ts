import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsIn, IsNotEmpty, IsString } from "class-validator";

export class ActorResponseDto {
  @ApiProperty({ description: "액터 ID" })
  id!: string;

  @ApiProperty({ description: "액터 이름", example: "홍길동" })
  name!: string;

  @ApiProperty({
    description: "액터 역할 목록",
    type: [String],
    enum: ["administrator", "manualRecorder", "stopwatchRecorder"],
    example: [],
  })
  roles!: string[];

  @ApiProperty({ description: "액터 생성 시각", format: "date-time" })
  createdAt!: Date;
}

export class RegisterActorDto {
  @ApiProperty({
    description: "액터 이름",
    example: "홍길동",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: "액터 아이디",
    example: "gd-hong",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    description: "액터 비밀번호",
    example: "super-secret",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class LoginActorDto {
  @ApiProperty({
    description: "액터 이름",
    example: "gd-hong",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    description: "액터 비밀번호",
    example: "super-secret",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export const ACTOR_ROLES = [
  "administrator",
  "manualRecorder",
  "stopwatchRecorder",
] as const;

export class SetActorRolesDto {
  @ApiProperty({
    description: "설정할 액터 역할 목록",
    type: [String],
    enum: ACTOR_ROLES,
  })
  @IsArray()
  @IsIn(ACTOR_ROLES, { each: true })
  roles!: (typeof ACTOR_ROLES)[number][];
}
