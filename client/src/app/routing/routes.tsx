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
