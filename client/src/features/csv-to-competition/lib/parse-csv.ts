import Papa from "papaparse";
import type { ParsedData, CsvParseResult, CsvValidationResult, GroupedData } from "../model/types";

export const csvHeader = [
  "이름",
  "이메일",
  "소속",
  "로봇 이름",
  "CPU",
  "ROM",
  "RAM",
  "모터 드라이버",
  "모터",
  "ADC",
  "센서",
  "대회 이름",
  "참가 부문",
  "참가 순번",
  "실제 순번",
  "하고 싶은 말",
  "참가 신청일",
];

export const requiredField = ["이름", "소속", "로봇 이름", "참가 순번", "참가 부문", "대회 이름"];

export const validateCsvHeaders = (headers: string[]): CsvValidationResult => {
  const missingHeaders = requiredField.filter((field) => !headers.includes(field));

  return {
    isValid: missingHeaders.length === 0,
    missingHeaders: missingHeaders.length > 0 ? missingHeaders : undefined,
  };
};

export const validateCsvData = (data: Record<string, string>[]): CsvValidationResult => {
  const invalidRows: number[] = [];

  data.forEach((row, index) => {
    const missingRequiredFields = requiredField.filter((field) => !row[field] || row[field].trim() === "");
    if (missingRequiredFields.length > 0) {
      invalidRows.push(index + 1);
    }
  });

  return {
    isValid: invalidRows.length === 0,
    invalidRows: invalidRows.length > 0 ? invalidRows : undefined,
  };
};

/**
 * CSV에서 대회명 추출
 * "대회 이름" 컬럼의 첫 번째 유효한 값 사용
 */
export const extractCompetitionName = (rawData: Record<string, string>[]): string => {
  if (rawData.length === 0) {
    throw new Error('CSV 데이터가 비어있습니다');
  }

  // "대회 이름" 필드에서 첫 번째 비어있지 않은 값 찾기
  for (const row of rawData) {
    const competitionName = row["대회 이름"];
    if (competitionName && competitionName.trim()) {
      return competitionName.trim();
    }
  }

  throw new Error('CSV에서 대회명을 찾을 수 없습니다. "대회 이름" 컬럼을 확인해주세요.');
};

/**
 * CSV에서 부문명 목록 추출
 */
export const extractDivisionNames = (rawData: Record<string, string>[]): string[] => {
  const divisions = new Set<string>();
  
  rawData.forEach((row) => {
    const division = row["참가 부문"];
    if (division && division.trim()) {
      divisions.add(division.trim());
    }
  });

  return Array.from(divisions);
};

export const transformCsvData = (
  rawData: Record<string, string>[]
): { participants: ParsedData[]; divisions: string[]; competitionName: string } => {
  const participants: ParsedData[] = [];
  const divisions: string[] = [];
  const competitionName = extractCompetitionName(rawData);

  rawData.forEach((row) => {
    const participant: ParsedData = {
      name: row["이름"],
      team: row["소속"],
      robotName: row["로봇 이름"],
      orderRaw: row["참가 순번"],
      comment: row["하고 싶은 말"] || "",
    };

    const division = row["참가 부문"];

    participants.push(participant);
    if (!divisions.includes(division)) {
      divisions.push(division);
    }
  });

  return { participants, divisions, competitionName };
};

export const groupDataByDivision = (rawData: Record<string, string>[]): GroupedData[] => {
  const divisionMap: Record<string, ParsedData[]> = {};

  rawData.forEach((row) => {
    const participant: ParsedData = {
      name: row["이름"],
      team: row["소속"],
      robotName: row["로봇 이름"],
      orderRaw: row["참가 순번"],
      comment: row["하고 싶은 말"] || "",
    };

    const division = row["참가 부문"];

    if (!divisionMap[division]) {
      divisionMap[division] = [];
    }
    divisionMap[division].push(participant);
  });

  return Object.entries(divisionMap).map(([divisionName, participants]) => ({
    divisionName,
    participants,
  }));
};

export const parseCsvFile = (file: File): Promise<CsvParseResult> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      complete: (results) => {
        try {
          const rawData = results.data as Record<string, string>[];

          // 헤더 검증
          const headerValidation = validateCsvHeaders(csvHeader);
          if (!headerValidation.isValid) {
            resolve({
              success: false,
              error: `필수 헤더가 누락되었습니다: ${headerValidation.missingHeaders?.join(", ")}`,
            });
            return;
          }

          // 데이터 검증
          const dataValidation = validateCsvData(rawData);
          if (!dataValidation.isValid) {
            resolve({
              success: false,
              error: `다음 행에서 필수 필드가 누락되었습니다: ${dataValidation.invalidRows?.join(", ")}번째 행`,
            });
            return;
          }

          // 데이터 변환 (대회명도 함께 추출)
          const { participants, competitionName } = transformCsvData(rawData);

          // 그룹화
          const groupedData = groupDataByDivision(rawData);

          // 부문명 목록 추출
          const divisionNames = extractDivisionNames(rawData);

          resolve({
            success: true,
            data: participants,
            groupedData,
            competitionName, // 추출된 대회명 포함
            divisionNames, // 추출된 부문명 목록 포함
          });
        } catch {
          resolve({
            success: false,
            error: "CSV 파일 처리 중 오류가 발생했습니다.",
          });
        }
      },
      error: (error) => {
        resolve({
          success: false,
          error: `CSV 파일 파싱 오류: ${error.message}`,
        });
      },
    });
  });
};
