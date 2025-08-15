import { useEffect, useRef, useState } from "react";
import Marquee from "react-fast-marquee";
import { useProgressService } from "@/features/progress";

export function RunnerInfo() {
  const progressService = useProgressService();
  const runner = progressService.use.runner();
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const runnerName = runner?.participant.name || "No Runner";
  const runnerTeam = runner?.participant.teamName || "No Team";
  const runnerRobotName = runner?.participant.robotName || "No Robot";
  const displayText = `${runnerName} · ${runnerRobotName}`;
  const displayTextClassName =
    "text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-7xl font-bold text-foreground whitespace-nowrap";

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current) {
        // 가짜 span을 만들어서 실제 텍스트 크기 측정
        const hiddenSpan = document.createElement("span");
        hiddenSpan.style.visibility = "hidden";
        hiddenSpan.style.position = "absolute";
        hiddenSpan.className = displayTextClassName;
        hiddenSpan.textContent = displayText;

        document.body.appendChild(hiddenSpan);
        const textWidth = hiddenSpan.scrollWidth;
        document.body.removeChild(hiddenSpan);

        const containerWidth = containerRef.current.clientWidth;
        setShouldAnimate(textWidth > containerWidth);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [displayText, displayTextClassName]);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div ref={containerRef} className="w-full mb-1 overflow-hidden whitespace-nowrap">
        {shouldAnimate ? (
          <Marquee
            speed={128}
            gradient={true}
            gradientColor="white"
            gradientWidth={80}
            className={displayTextClassName}
          >
            <span className="pr-24">{displayText}</span>
          </Marquee>
        ) : (
          <div className={`${displayTextClassName} text-center leading-normal`}>{displayText}</div>
        )}
      </div>
      <span
        className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-5xl font-semibold text-muted-foreground text-center overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
        title="Runner Team Name"
      >
        {runnerTeam}
      </span>
    </div>
  );
}
