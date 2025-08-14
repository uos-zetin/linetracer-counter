import { Suspense } from "react";
import { LoadingPage } from "@/pages/loading";

export const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingPage />}>{children}</Suspense>
);
