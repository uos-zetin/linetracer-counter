import { useSingleImageUpload } from "../lib/use-image-upload";
import { useProgressService } from "@/features/progress";

export function TimerPageHeader() {
  const progressService = useProgressService();
  const competition = progressService.useCompetition();
  const { image, handleFile, inputRef } = useSingleImageUpload();

  return (
    <header
      className="
        sticky top-0 z-20 w-full
        flex items-center justify-center text-center
        bg-gray-200
        group
        cursor-pointer
        "
      onClick={() => inputRef.current?.click()}
    >
      {/* 기본 텍스트 또는 이미지 */}
      {image ? (
        <div className="relative w-full">
          <img
            src={image}
            alt="Competition Header"
            className="
              w-full h-auto
              object-contain
              block
              "
          />
        </div>
      ) : (
        <h1
          className="
            w-full
            bg-uos-primary-blue text-white
            text-[5vw] py-[1vw]
            font-bold text-center tracking-tight
            aspect-banner
          "
        >
          {(competition?.name || "No Competition").toUpperCase()}
        </h1>
      )}

      {/* 마우스 오버 시 업로드 UI */}
      <div
        className="
          absolute inset-0 bg-black/40 backdrop-blur-sm
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          flex flex-col items-center justify-center gap-[0.5vw]
          pointer-events-none
        "
      >
        <svg
          data-slot="icon"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="w-[3vw] h-[3vw] text-white"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
          />
        </svg>
        <span className="text-white text-[1.2vw] font-medium">{image ? "헤더 이미지 변경" : "헤더 이미지 추가"}</span>
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />
    </header>
  );
}
