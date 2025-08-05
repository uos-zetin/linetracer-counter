import { createBrowserRouter, type RouteObject } from "react-router";
import { HomePage } from "@/pages/home";
import {
  AdminPage,
  AdminDashboard,
  CompetitionManagement,
  DivisionManagement,
  ParticipantManagement,
  RecordManagement,
  UserManagement,
} from "@/pages/admin";
import { TimerPage } from "@/pages/timer";
import { CounterSelectorPage } from "@/pages/counter-selector";
import { ControllerPage } from "@/pages/controller";
import { ManualCounter } from "@/pages/manual-counter";
import { DashboardPage } from "@/pages/dashboard";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/counter",
    children: [
      {
        index: true,
        element: <CounterSelectorPage />,
      },
      {
        path: ":counterId/timer",
        element: <TimerPage />,
      },
      {
        path: ":counterId/controller",
        element: <ControllerPage />,
      },
      {
        path: ":counterId/manual-counter",
        element: <ManualCounter />,
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminPage />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "competitions",
        element: <CompetitionManagement />,
      },
      {
        path: "divisions",
        element: <DivisionManagement />,
      },
      {
        path: "participants",
        element: <ParticipantManagement />,
      },
      {
        path: "records",
        element: <RecordManagement />,
      },
      {
        path: "users",
        element: <UserManagement />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
