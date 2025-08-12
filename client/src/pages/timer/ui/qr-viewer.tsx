import { useRef, useLayoutEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QRViewerProps {
  url: string;
  title?: string;
}

export function QRViewer({ url, title = "대회 전체 기록" }: QRViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [qrSize, setQrSize] = useState(0);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const resize = () => {
      const rect = containerRef.current!.getBoundingClientRect();
      // 컨테이너 크기의 90%를 사용
      setQrSize(Math.min(rect.width, rect.height) * 0.9);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      {/* 타이틀 */}
      <div className="bg-muted py-1 sm:py-1.5 md:py-2 shrink-0">
        <h2 className="text-center text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-4xl font-semibold text-foreground">
          {title}
        </h2>
      </div>

      {/* QR 코드 영역 */}
      <div ref={containerRef} className="flex-1 flex items-center justify-center">
        {qrSize > 0 && (
          <QRCodeCanvas
            value={url}
            size={1024}
            level="H"
            bgColor="transparent"
            style={{
              width: qrSize,
              height: qrSize,
            }}
          />
        )}
      </div>
    </div>
  );
}
