import { createBrowserRouter, type RouteObject } from "react-router";
import { HomePage } from "@/pages/home";
import { AdminPage } from "@/pages/admin";
import { TimerPage } from "@/pages/timer";
import { CounterSelectorPage } from "@/pages/counter-selector";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/counter",
    element: <CounterSelectorPage />,
  },
  {
    path: "/counter/:counterId/timer",
    element: <TimerPage />,
  },
  {
    path: "/admin",
    element: <AdminPage />,
  },
];

export const router = createBrowserRouter(routes);
