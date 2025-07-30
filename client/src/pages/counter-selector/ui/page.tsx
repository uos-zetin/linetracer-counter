import { useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";

const mockCounters = [
  { id: "counter-001", name: "계수기-A (테스트용)" },
  { id: "counter-002", name: "계수기-B (데모용)" },
  { id: "counter-003", name: "계수기-C (개발용)" },
  { id: "counter-004", name: "계수기-D" },
  { id: "counter-005", name: "계수기-E" },
  { id: "counter-006", name: "계수기-F" },
  { id: "counter-007", name: "계수기-G" },
  { id: "counter-008", name: "계수기-H" },
];

export function CounterSelectorPage() {
  const navigate = useNavigate();
  const [selectedCounter, setSelectedCounter] = useState<string>("");
  const [selectedCounterId, setSelectedCounterId] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigation = (path: string) => {
    if (selectedCounterId) {
      navigate(`/counter/${selectedCounterId}${path}`);
    }
  };

  const handleCounterSelect = (counter: typeof mockCounters[0]) => {
    setSelectedCounter(counter.name);
    setSelectedCounterId(counter.id);
    setIsDropdownOpen(false);
  };

  return (
    <main className="flex flex-col min-h-screen h-full bg-uos-gray-mist">
      <header className="sticky top-0 z-20 w-full flex items-center justify-center text-center bg-uos-primary-blue text-white">
        <h1 className="text-[3.5vw] py-[0.75vw] font-bold text-center tracking-tight">계수기 선택</h1>
      </header>

      <section className="flex-1 flex items-center justify-center p-[2vw]">
        <div className="bg-white rounded-lg shadow-lg p-[3vw] max-w-[60vw] w-full">
          <h2 className="text-[2.5vw] font-bold text-center mb-[2vw] text-gray-800">사용할 계수기를 선택하세요</h2>

          <div className="mb-[3vw]">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full p-[1.5vw] text-[1.5vw] border border-gray-300 rounded-lg focus:ring-2 focus:ring-uos-primary-blue focus:border-transparent outline-none transition-all duration-200 bg-white text-left flex items-center justify-between"
              >
                <span className={selectedCounter ? "text-gray-900" : "text-gray-500"}>
                  {selectedCounter || "계수기를 선택하세요"}
                </span>
                <svg
                  className={`w-[1.5vw] h-[1.5vw] transition-transform duration-200 mr-[0.5vw] ${
                    isDropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.2vw" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-[0.25vw] bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-[20vw] overflow-y-auto">
                  {mockCounters.map((counter) => (
                    <button
                      key={counter.id}
                      onClick={() => handleCounterSelect(counter)}
                      className={`w-full px-[1.5vw] py-[1vw] text-[1.5vw] text-left hover:bg-gray-100 transition-colors ${
                        selectedCounter === counter.name
                          ? "bg-uos-primary-blue text-white hover:bg-blue-600"
                          : "text-gray-900"
                      }`}
                    >
                      {counter.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-[1vw] flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="px-[2vw] py-[1vw] bg-gray-500 text-white rounded-lg text-[1.5vw] font-medium hover:bg-gray-600 transition-colors"
            >
              뒤로가기
            </button>
            <button
              onClick={() => handleNavigation("/controller")}
              disabled={!selectedCounterId}
              className={`
                px-[2vw] py-[1vw] rounded-lg text-[1.5vw] font-medium transition-colors
                ${
                  selectedCounterId
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              컨트롤러
            </button>
            <button
              onClick={() => handleNavigation("/timer")}
              disabled={!selectedCounterId}
              className={`
                px-[2vw] py-[1vw] rounded-lg text-[1.5vw] font-medium transition-colors
                ${
                  selectedCounterId
                    ? "bg-uos-primary-blue text-white hover:bg-blue-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              타이머
            </button>
            <button
              onClick={() => handleNavigation("/manual-counter")}
              disabled={!selectedCounterId}
              className={`
                px-[2vw] py-[1vw] rounded-lg text-[1.5vw] font-medium transition-colors
                ${
                  selectedCounterId
                    ? "bg-orange-600 text-white hover:bg-orange-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              수동 계수
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
