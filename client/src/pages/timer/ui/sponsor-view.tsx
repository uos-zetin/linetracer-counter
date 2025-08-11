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
        <h2 className="text-center text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-foreground">스폰서</h2>
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
          <div className="text-muted-foreground italic text-center text-[10px] sm:text-xs pointer-events-none">
            스폰서 이미지를 업로드하세요
          </div>
        )}

        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200
                     flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4 pointer-events-none"
        >
          <svg
            data-slot="icon"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 text-white"
          >
            <path
              clipRule="evenodd"
              fillRule="evenodd"
              d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
            />
          </svg>
          <span className="text-white text-xs sm:text-sm md:text-base">이미지 업로드</span>
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
