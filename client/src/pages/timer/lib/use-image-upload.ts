import { useEffect, useRef, useState } from "react";

export interface ImageUploadHookResult {
  images: string[];
  currentIndex: number;
  handleFiles: (files: FileList | null) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export interface SingleImageUploadHookResult {
  image: string | null;
  handleFile: (files: FileList | null) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function useSingleImageUpload(): SingleImageUploadHookResult {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [image, setImage] = useState<string | null>(null);

  const handleFile = (fileList: FileList | null) => {
    if (!fileList?.length) return;

    const file = fileList[0]; // 첫 번째 파일만 사용
    if (!file.type.startsWith("image/")) return;

    // 이전 이미지 URL 해제
    if (image) {
      URL.revokeObjectURL(image);
    }

    const url = URL.createObjectURL(file);
    setImage(url);
  };

  // 메모리 해제
  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  return {
    image,
    handleFile,
    inputRef,
  };
}

export function useImageUpload(): ImageUploadHookResult {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;

    const urls = Array.from(fileList)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => URL.createObjectURL(file));

    setImages((prev) => {
      if (prev.length === 0) {
        setCurrentIndex(0);
      }
      return [...prev, ...urls];
    });
  };

  // 메모리 해제
  useEffect(() => {
    return () => {
      images.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  return {
    images,
    currentIndex,
    handleFiles,
    inputRef,
  };
}

export interface ImageSliderHookResult extends ImageUploadHookResult {
  currentIndex: number;
  nextIndex: number;
  isTransitioning: boolean;
}

export function useImageSlider(intervalMs: number = 8000, fadeDurationMs: number = 2000): ImageSliderHookResult {
  const uploadHook = useImageUpload();
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 이미지 추가 시 인덱스 초기화
  useEffect(() => {
    if (uploadHook.images.length > 0) {
      setCurrentIndex(0);
      setNextIndex(uploadHook.images.length > 1 ? 1 : 0);
    }
  }, [uploadHook.images.length]);

  // 슬라이더 로직
  useEffect(() => {
    if (uploadHook.images.length <= 1) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const intervalId = setInterval(() => {
      setIsTransitioning(true);
      timeoutId = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex((prev) => {
          const next = (prev + 1) % uploadHook.images.length;
          setNextIndex((next + 1) % uploadHook.images.length);
          return next;
        });
      }, fadeDurationMs);
    }, intervalMs);

    return () => {
      clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [uploadHook.images.length, intervalMs, fadeDurationMs]);

  return {
    ...uploadHook,
    currentIndex,
    nextIndex,
    isTransitioning,
  };
}
