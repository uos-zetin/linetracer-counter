import { useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { useCounterService } from "@/features/counter";
import type { CounterState } from "@/entities/counter";

export function CounterSelectorPage() {
  const navigate = useNavigate();
  const counterService = useCounterService();
  const [counters, setCounters] = useState<CounterState[]>([]);
  const [selectedCounter, setSelectedCounter] = useState<string>("");
  const [selectedCounterId, setSelectedCounterId] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    const loadCounters = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const counterList = await counterService.getAllCounters();
        setCounters(counterList);
      } catch (err) {
        console.error("Failed to load counters:", err);
        setError("계수기 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCounters();
  }, [counterService]);

  const handleNavigation = (path: string) => {
    if (selectedCounterId) {
      navigate(`/counter/${selectedCounterId}${path}`);
    }
  };

  const handleCounterSelect = (counter: CounterState) => {
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

          {error && (
            <div className="mb-[2vw] p-[1vw] bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-700 text-[1.2vw] text-center">{error}</p>
            </div>
          )}

          <div className="mb-[3vw]">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={isLoading}
                className="w-full p-[1.5vw] text-[1.5vw] border border-gray-300 rounded-lg focus:ring-2 focus:ring-uos-primary-blue focus:border-transparent outline-none transition-all duration-200 bg-white text-left flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <span className={selectedCounter ? "text-gray-900" : "text-gray-500"}>
                  {isLoading ? "계수기 목록을 불러오는 중..." : selectedCounter || "계수기를 선택하세요"}
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

              {isDropdownOpen && !isLoading && (
                <div className="absolute top-full left-0 right-0 mt-[0.25vw] bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-[20vw] overflow-y-auto">
                  {counters.length === 0 ? (
                    <div className="px-[1.5vw] py-[1vw] text-[1.5vw] text-gray-500 text-center">
                      사용 가능한 계수기가 없습니다.
                    </div>
                  ) : (
                    counters.map((counter) => (
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
                    ))
                  )}
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
