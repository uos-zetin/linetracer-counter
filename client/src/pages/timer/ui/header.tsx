interface TimerViewHeaderProps {
  type: "text" | "image";
  content: string;
  alt?: string;
}

export function TimerPageHeader({ type = "text", content, alt = "Competition Header" }: TimerViewHeaderProps) {
  return (
    <header
      className="
        sticky top-0 z-20 w-full
        flex items-center justify-center text-center
        bg-uos-primary-blue
        text-white
        "
    >
      {type === "text" ? (
        <h1
          className="
            text-[5vw] py-[1vw]
            font-bold text-center tracking-tight
            aspect-banner
          "
        >
          {content.toUpperCase()}
        </h1>
      ) : (
        <img
          src={content}
          alt={alt}
          className="
            w-full h-auto
            object-cover
            "
        />
      )}
    </header>
  );
}
