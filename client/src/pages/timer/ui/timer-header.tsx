import { ImagePlus } from "@/shared/ui";
import { useProgressService } from "@/features/progress";
import { useSingleImageUpload } from "../lib/use-image-upload";

export function TimerPageHeader() {
  const progressService = useProgressService();
  const competition = progressService.use.competition();
  const { image, handleFile, inputRef } = useSingleImageUpload();

  return (
    <header
      className="
        sticky top-0 z-20 w-full h-[15vh]
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
        <div className="relative w-full h-full">
          <img
            src={image}
            alt="Competition Header"
            className="
              w-full h-full
              object-cover
              "
          />
        </div>
      ) : (
        <h1
          className="
            w-full h-full
            bg-primary text-primary-foreground
            font-bold text-center tracking-tight flex items-center justify-center
          "
          style={{ fontSize: "6vh" }}
        >
          {(competition?.name || "No Competition").toUpperCase()}
        </h1>
      )}

      {/* 마우스 오버 시 업로드 UI */}
      <div
        className="
          absolute inset-0 bg-black/40 backdrop-blur-sm
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          flex flex-col items-center justify-center pointer-events-none
        "
        style={{ gap: "1vh" }}
      >
        <ImagePlus className="text-white" style={{ width: "3vh", height: "3vh" }} />
        <span className="text-white font-medium" style={{ fontSize: "2vh" }}>
          {image ? "헤더 이미지 변경" : "헤더 이미지 추가"}
        </span>
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
