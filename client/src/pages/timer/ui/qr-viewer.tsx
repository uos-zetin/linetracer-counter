import { QRCodeCanvas } from "qrcode.react";

export function QRViewer() {
  const url = window.location.href;

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 border border-gray-300 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gray-100 py-[0.25vw]">
        <h2 className="text-center text-[1.5vw] font-semibold">대회 전체 기록</h2>
      </div>
      <div className="flex-1 flex items-center justify-center p-[0.5vw]">
        <QRCodeCanvas
          value={url}
          size={1024}
          level="H"
          bgColor="transparent"
          style={{ width: "70%", height: "auto", aspectRatio: "1 / 1" }}
        />
      </div>
    </div>
  );
}
