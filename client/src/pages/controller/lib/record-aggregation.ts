import type { ManualRecord, RecordForm } from "@/entities/record";

/**
 * 선택된 수동 계수 기록 배열에서 중간값(홀수) 또는 평균값(짝수)을 계산하여 RecordForm으로 반환합니다.
 * @param selectedManualRecords 선택된 수동 계수 기록 배열
 * @returns 취합된 RecordForm 또는 null
 */
export function aggregateManualRecords(selectedManualRecords: ManualRecord[]): RecordForm | null {
  if (selectedManualRecords.length === 0) return null;

  const values = selectedManualRecords.map(record => record.value);
  const sortedValues = [...values].sort((a, b) => a - b);

  let aggregatedValue: number;
  let calculationType: string;

  if (sortedValues.length % 2 === 1) {
    // 홀수개: 중간값
    const middleIndex = Math.floor(sortedValues.length / 2);
    aggregatedValue = sortedValues[middleIndex];
    calculationType = "중간값";
  } else {
    // 짝수개: 중간 2개의 평균
    const middle1 = sortedValues[sortedValues.length / 2 - 1];
    const middle2 = sortedValues[sortedValues.length / 2];
    aggregatedValue = (middle1 + middle2) / 2;
    calculationType = "평균값";
  }

  const note = `${selectedManualRecords.length}개 수동 계수 기록 취합 (${calculationType}): ${selectedManualRecords
    .map(record => record.value.toString())
    .join(", ")}`;

  return {
    value: aggregatedValue,
    source: "manual",
    note
  };
}