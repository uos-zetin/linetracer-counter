import { QRCodeCanvas } from "qrcode.react";

interface QRViewerProps {
  url: string;
  title?: string;
}

export function QRViewer({ url, title = "대회 전체 기록" }: QRViewerProps) {
  return (
    <div className="w-full h-full flex flex-col bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      {/* 타이틀 */}
      <div className="bg-muted py-1 sm:py-1.5 md:py-2 shrink-0">
        <h2 className="text-center text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-4xl font-semibold text-foreground">
          {title}
        </h2>
      </div>

      {/* QR 코드 영역 */}
      <div className="flex-1 flex items-center justify-center">
        <QRCodeCanvas
          value={url}
          size={1024}
          level="H"
          bgColor="transparent"
          style={{
            width: "18dvh",
            height: "18dvh",
            padding: "1dvh",
          }}
        />
      </div>
    </div>
  );
}
