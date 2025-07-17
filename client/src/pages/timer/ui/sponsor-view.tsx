import { useEffect, useRef, useState } from "react";

const INTERVAL = 8_000;
const FADE_MS = 2_000;

export function SponsorView() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [images, setImages] = useState<string[]>([]);
  const [currIdx, setCurrIdx] = useState(0);
  const [nextIdx, setNextIdx] = useState(1);
  const [fade, setFade] = useState(false);

  const handleFiles = (fl: FileList | null) => {
    if (!fl?.length) return;
    const urls = Array.from(fl)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => URL.createObjectURL(f));

    setImages((prev) => {
      if (prev.length === 0) {
        setCurrIdx(0);
        setNextIdx(urls.length > 1 ? 1 : 0);
      }
      return [...prev, ...urls];
    });
  };

  useEffect(() => {
    if (images.length <= 1) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    const id = setInterval(() => {
      setFade(true);
      timeoutId = setTimeout(() => {
        setFade(false);
        setCurrIdx((p) => {
          const nc = (p + 1) % images.length;
          setNextIdx((nc + 1) % images.length);
          return nc;
        });
      }, FADE_MS);
    }, INTERVAL);
    return () => {
      clearInterval(id);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [images.length]);

  useEffect(() => () => images.forEach((u) => URL.revokeObjectURL(u)), [images]);

  return (
    <div
      className="w-full h-full aspect-auto bg-gray-50 border border-gray-300 rounded-lg shadow-sm
                 flex flex-col overflow-hidden"
      onClick={() => inputRef.current?.click()}
    >
      <div className="bg-gray-100 py-1">
        <h2 className="text-center text-[1.5vw] font-semibold">스폰서</h2>
      </div>
      <div className="relative flex-1 cursor-pointer group flex items-center justify-center overflow-hidden">
        {images.length > 0 && (
          <>
            <img
              key={currIdx}
              src={images[currIdx]}
              alt="sponsor-current"
              style={{ transitionDuration: `${FADE_MS}ms` }}
              className={`
                absolute inset-0 m-auto max-w-full max-h-full object-contain
                transition-opacity ease-in-out
                ${fade ? "opacity-0" : "opacity-100"}
              `}
            />
            <img
              key={nextIdx}
              src={images[nextIdx]}
              alt="sponsor-next"
              style={{ transitionDuration: `${FADE_MS}ms` }}
              className={`
                absolute inset-0 m-auto max-w-full max-h-full object-contain
                transition-opacity ease-in-out
                ${fade ? "opacity-100" : "opacity-0"}
              `}
            />
          </>
        )}
        {images.length === 0 && (
          <div className="text-gray-400 italic text-center text-[0.8vw] pointer-events-none">
            스폰서 이미지를 업로드하세요
          </div>
        )}

        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200
                     flex flex-col items-center justify-center gap-2 pointer-events-none"
        >
          <svg
            data-slot="icon"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="w-[2vw] h-[2vw] text-white"
          >
            <path
              clipRule="evenodd"
              fillRule="evenodd"
              d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
            />
          </svg>
          <span className="text-white text-[1vw]">이미지 업로드</span>
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
