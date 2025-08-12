import { ImagePlus } from "lucide-react";
import { useImageSlider } from "../lib/use-image-upload";

const INTERVAL = 8_000;
const FADE_MS = 2_000;

export function SponsorView() {
  const { images, currentIndex, nextIndex, isTransitioning, handleFiles, inputRef } = useImageSlider(INTERVAL, FADE_MS);

  return (
    <div
      className="w-full h-full bg-card border border-border rounded-lg shadow-sm
                 flex flex-col overflow-hidden"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label="이미지 업로드"
    >
      <div className="bg-muted py-1 sm:py-1.5 md:py-2">
        <h2 className="text-center text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-4xl font-semibold text-foreground">스폰서</h2>
      </div>
      <div className="relative flex-1 cursor-pointer group flex items-center justify-center overflow-hidden">
        {images.length > 0 && (
          <>
            <img
              key={`current-${currentIndex}`}
              src={images[currentIndex]}
              alt="sponsor-current"
              style={{ transitionDuration: `${FADE_MS}ms` }}
              className={`
                absolute inset-0 m-auto max-w-full max-h-full object-contain
                transition-opacity ease-in-out
                ${isTransitioning ? "opacity-0" : "opacity-100"}
              `}
            />
            {images.length > 1 && (
              <img
                key={`next-${nextIndex}`}
                src={images[nextIndex]}
                alt="sponsor-next"
                style={{ transitionDuration: `${FADE_MS}ms` }}
                className={`
                  absolute inset-0 m-auto max-w-full max-h-full object-contain
                  transition-opacity ease-in-out
                  ${isTransitioning ? "opacity-100" : "opacity-0"}
                `}
              />
            )}
          </>
        )}
        {images.length === 0 && (
          <div className="text-muted-foreground italic text-center text-[10px] sm:text-xs pointer-events-none px-2 break-keep">
            스폰서 이미지를 업로드하세요
          </div>
        )}

        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200
                     flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4 pointer-events-none"
        >
          <ImagePlus className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 2xl:w-16 2xl:h-16 text-white" />
          <span className="text-white text-xs sm:text-sm md:text-base 2xl:text-2xl">이미지 업로드</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}
