import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";

export class CounterResponseDto {
  @ApiProperty({ description: "계수기 ID" })
  deviceId!: string;

  @ApiProperty({ description: "계수기 이름", example: "Line Counter #1" })
  name!: string;

  @ApiProperty({
    description: "시작 시각 (Unix timestamp, ms)",
    example: 1672531200000,
    nullable: true,
  })
  startedAt!: number | null;

  @ApiProperty({
    description: "종료 시각 (Unix timestamp, ms)",
    example: 1672531800000,
    nullable: true,
  })
  stoppedAt!: number | null;

  @ApiProperty({
    description: "연결된 대회 부문 ID",
    example: "division-123",
    nullable: true,
  })
  divisionId!: string | null;
}

export class CounterDivisionBindingDto {
  @ApiProperty({
    description: "연결할 대회 부문 ID(null이면 연결 해제)",
    type: String,
    nullable: true,
    example: "division-123",
  })
  @IsOptional()
  @IsString()
  divisionId!: string | null;
}

export class RegisterFrontBackIrCounterDeviceDto {
  @ApiProperty({
    description: "계수기 ID",
    example: "front-back-ir-counter-1",
  })
  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @ApiProperty({
    description: "계수기 이름",
    example: "Front-Back IR Counter #1",
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: "시작 센서 임계값",
    example: 100,
    minimum: 0,
    maximum: 255,
  })
  @IsNumber()
  @Min(0)
  @Max(255)
  startThreshold!: number;

  @ApiProperty({
    description: "종료 센서 임계값",
    example: 100,
    minimum: 0,
    maximum: 255,
  })
  @IsNumber()
  @Min(0)
  @Max(255)
  endThreshold!: number;

  @ApiProperty({
    description: "종료 디바운싱 시간 (ms)",
    example: 500,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  endDebouncingTime!: number;
}

function IsFrontBackIrCounterDeviceData(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isFrontBackIrCounterDeviceData",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // 배열이 아니면 false
          if (!Array.isArray(value)) {
            return false;
          }

          // 배열에 요소가 있으면 각 요소 검증
          return value.every(
            (row) =>
              Array.isArray(row) &&
              row.length === 3 &&
              row.every((item) => typeof item === "number")
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be an array of [number, number, number] arrays`;
        },
      },
    });
  };
}

export class FrontBackIrCounterDeviceDataDto {
  @ApiProperty({
    description: "[timestamp, startSensor, endSensor][]",
    example: [
      [0, 0, 0],
      [500, 110, 0],
      [1000, 60, 0],
      [1500, 0, 60],
      [2000, 0, 110],
      [2500, 0, 80],
      [3000, 0, 110],
      [3500, 0, 80],
      [4000, 0, 60],
      [4500, 0, 50],
      [5000, 0, 0],
      [5500, 0, 0],
      [6000, 0, 0],
    ],
  })
  @IsFrontBackIrCounterDeviceData()
  data!: number[][];
}
