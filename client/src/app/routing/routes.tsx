import { createBrowserRouter, type RouteObject } from "react-router";
import { TimerPage, NameSelector } from "@/pages/timer";

const routes: RouteObject[] = [
  {
    path: "/:competitionId/timer",
    element: <TimerPage />,
  },
  {
    path: "/:competitionId/timer/select",
    element: <NameSelector />,
  },
  {
    path: "/",
    element: <div>홈페이지</div>,
  },
];

export const router = createBrowserRouter(routes);
