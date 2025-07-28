import { createBrowserRouter, type RouteObject } from "react-router";
import { HomePage } from "@/pages/home";
import { AdminPage, AdminCompetitionsPage, AdminDivisionsPage, AdminParticipantsPage } from "@/pages/admin";
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
  {
    path: "/admin/competitions",
    element: <AdminCompetitionsPage />,
  },
  {
    path: "/admin/divisions",
    element: <AdminDivisionsPage />,
  },
  {
    path: "/admin/participants",
    element: <AdminParticipantsPage />,
  },
];

export const router = createBrowserRouter(routes);
