import { ImagePlus } from "@/shared/ui";
import { useImageSlider } from "../lib/use-image-upload";

const INTERVAL = 8_000;
const FADE_MS = 2_000;

export function SponsorView() {
  const { images, currentIndex, nextIndex, isTransitioning, handleFiles, inputRef } = useImageSlider(INTERVAL, FADE_MS);
  const canTransition = images.length > 1;

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
      <div className="bg-muted" style={{ padding: "0.5vh 0" }}>
        <h2 className="text-center font-semibold text-foreground" style={{ fontSize: "2.5vh" }}>
          스폰서
        </h2>
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
                ${canTransition && isTransitioning ? "opacity-0" : "opacity-100"}
              `}
            />
            {canTransition && (
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
          <div
            className="text-muted-foreground italic text-center pointer-events-none break-keep"
            style={{ fontSize: "1.5vh", padding: "0.5vh 0" }}
          >
            스폰서 이미지를 업로드하세요
          </div>
        )}

        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200
                     flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4 pointer-events-none"
        >
          <ImagePlus className="text-white" style={{ width: "3vh", height: "3vh" }} />
          <span className="text-white" style={{ fontSize: "1.5vh" }}>
            이미지 업로드
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.currentTarget.value = "";
          }}
        />
      </div>
    </div>
  );
}
