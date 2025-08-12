import { ImagePlus } from "lucide-react";
import { useProgressService } from "@/features/progress";
import { useSingleImageUpload } from "../lib/use-image-upload";

export function TimerPageHeader() {
  const progressService = useProgressService();
  const competition = progressService.use.competition();
  const { image, handleFile, inputRef } = useSingleImageUpload();

  return (
    <header
      className="
        sticky top-0 z-20 w-full
        flex items-center justify-center text-center
        bg-muted
        shadow-lg
        group
        cursor-pointer
        "
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      tabIndex={0}
      role="button"
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
            bg-primary text-primary-foreground
            text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-9xl py-4 sm:py-6 md:py-8 2xl:py-16
            font-bold text-center tracking-tight
            aspect-banner flex items-center justify-center
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
          flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4
          pointer-events-none
        "
      >
        <ImagePlus className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 2xl:w-20 2xl:h-20 text-white" />
        <span className="text-white text-sm sm:text-base md:text-lg lg:text-xl 2xl:text-3xl font-medium">{image ? "헤더 이미지 변경" : "헤더 이미지 추가"}</span>
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
