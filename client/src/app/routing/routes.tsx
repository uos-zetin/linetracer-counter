import { createBrowserRouter, type RouteObject } from "react-router";
import { TimerPage } from "@/pages/timer";
import { CounterSelectorPage } from "@/pages/counter-selector";

const routes: RouteObject[] = [
  {
    path: "/counter",
    element: <CounterSelectorPage />,
  },
  {
    path: "/counter/:counterId/timer",
    element: <TimerPage />,
  },
  {
    path: "/",
    element: <div>홈페이지</div>,
  },
];

export const router = createBrowserRouter(routes);
