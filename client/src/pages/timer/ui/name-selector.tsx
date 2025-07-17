import { useNavigate, useParams } from "react-router";
import { useState } from "react";

const mockStopwatchNames = [
  "계수기-A",
  "계수기-B",
  "계수기-C",
  "계수기-D",
  "계수기-E",
  "계수기-F",
  "계수기-G",
  "계수기-H",
];

export function NameSelector() {
  const navigate = useNavigate();
  const { competitionId } = useParams();
  const [selectedStopwatch, setSelectedStopwatch] = useState<string>("");

  const handleSubmit = () => {
    if (selectedStopwatch && competitionId) {
      navigate(`/${competitionId}/timer?name=${encodeURIComponent(selectedStopwatch)}`);
    }
  };

  return (
    <main className="flex flex-col min-h-screen h-full bg-uos-gray-mist">
      <header className="sticky top-0 z-20 w-full flex items-center justify-center text-center bg-uos-primary-blue text-white">
        <h1 className="text-[5vw] py-4 font-bold text-center tracking-tight">계수기 선택</h1>
      </header>

      <section className="flex-1 flex items-center justify-center p-[2vw]">
        <div className="bg-white rounded-lg shadow-lg p-[3vw] max-w-[60vw] w-full">
          <h2 className="text-[2.5vw] font-bold text-center mb-[2vw] text-gray-800">사용할 계수기를 선택하세요</h2>

          <div className="mb-[3vw]">
            <select
              value={selectedStopwatch}
              onChange={(e) => setSelectedStopwatch(e.target.value)}
              className="w-full p-[1.5vw] text-[1.5vw] border border-gray-300 rounded-lg focus:ring-2 focus:ring-uos-primary-blue focus:border-transparent outline-none transition-all duration-200"
            >
              <option value="">계수기를 선택하세요</option>
              {mockStopwatchNames.map((stopwatchName) => (
                <option key={stopwatchName} value={stopwatchName}>
                  {stopwatchName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center gap-[1vw]">
            <button
              onClick={() => navigate(-1)}
              className="px-[2vw] py-[1vw] bg-gray-500 text-white rounded-lg text-[1.5vw] font-medium hover:bg-gray-600 transition-colors"
            >
              뒤로가기
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedStopwatch}
              className={`
                px-[2vw] py-[1vw] rounded-lg text-[1.5vw] font-medium transition-colors
                ${
                  selectedStopwatch
                    ? "bg-uos-primary-blue text-white hover:bg-blue-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              타이머 시작
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
