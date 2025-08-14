import { lazy } from "react";
import { createBrowserRouter, type RouteObject } from "react-router";
import { LazyWrapper } from "./lazy-wrapper";

// Lazy load all page components
const HomePage = lazy(() => import("@/pages/home").then((m) => ({ default: m.HomePage })));
const DashboardPage = lazy(() => import("@/pages/dashboard").then((m) => ({ default: m.DashboardPage })));
const CounterSelectorPage = lazy(() =>
  import("@/pages/counter-selector").then((m) => ({ default: m.CounterSelectorPage }))
);
const TimerPage = lazy(() => import("@/pages/timer").then((m) => ({ default: m.TimerPage })));
const ControllerPage = lazy(() => import("@/pages/controller").then((m) => ({ default: m.ControllerPage })));
const ManualCounter = lazy(() => import("@/pages/manual-counter").then((m) => ({ default: m.ManualCounter })));

// Admin pages
const AdminPage = lazy(() => import("@/pages/admin").then((m) => ({ default: m.AdminPage })));
const AdminDashboard = lazy(() => import("@/pages/admin").then((m) => ({ default: m.AdminDashboard })));
const CompetitionManagement = lazy(() => import("@/pages/admin").then((m) => ({ default: m.CompetitionManagement })));
const DivisionManagement = lazy(() => import("@/pages/admin").then((m) => ({ default: m.DivisionManagement })));
const ParticipantManagement = lazy(() => import("@/pages/admin").then((m) => ({ default: m.ParticipantManagement })));
const RecordManagement = lazy(() => import("@/pages/admin").then((m) => ({ default: m.RecordManagement })));
const UserManagement = lazy(() => import("@/pages/admin").then((m) => ({ default: m.UserManagement })));

// Wrapper component with Suspense

const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <LazyWrapper>
        <HomePage />
      </LazyWrapper>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <LazyWrapper>
        <DashboardPage />
      </LazyWrapper>
    ),
  },
  {
    path: "/counter",
    children: [
      {
        index: true,
        element: (
          <LazyWrapper>
            <CounterSelectorPage />
          </LazyWrapper>
        ),
      },
      {
        path: ":counterId/timer",
        element: (
          <LazyWrapper>
            <TimerPage />
          </LazyWrapper>
        ),
      },
      {
        path: ":counterId/controller",
        element: (
          <LazyWrapper>
            <ControllerPage />
          </LazyWrapper>
        ),
      },
      {
        path: ":counterId/manual-counter",
        element: (
          <LazyWrapper>
            <ManualCounter />
          </LazyWrapper>
        ),
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <LazyWrapper>
        <AdminPage />
      </LazyWrapper>
    ),
    children: [
      {
        index: true,
        element: (
          <LazyWrapper>
            <AdminDashboard />
          </LazyWrapper>
        ),
      },
      {
        path: "competitions",
        element: (
          <LazyWrapper>
            <CompetitionManagement />
          </LazyWrapper>
        ),
      },
      {
        path: "divisions",
        element: (
          <LazyWrapper>
            <DivisionManagement />
          </LazyWrapper>
        ),
      },
      {
        path: "participants",
        element: (
          <LazyWrapper>
            <ParticipantManagement />
          </LazyWrapper>
        ),
      },
      {
        path: "records",
        element: (
          <LazyWrapper>
            <RecordManagement />
          </LazyWrapper>
        ),
      },
      {
        path: "users",
        element: (
          <LazyWrapper>
            <UserManagement />
          </LazyWrapper>
        ),
      },
    ],
  },
];

// ===== 최적화 전 라우트 정의 (주석 처리) =====
// const routes: RouteObject[] = [
//   {
//     path: "/",
//     element: <HomePage />,
//   },
//   {
//     path: "/dashboard",
//     element: <DashboardPage />,
//   },
//   {
//     path: "/counter",
//     children: [
//       {
//         index: true,
//         element: <CounterSelectorPage />,
//       },
//       {
//         path: ":counterId/timer",
//         element: <TimerPage />,
//       },
//       {
//         path: ":counterId/controller",
//         element: <ControllerPage />,
//       },
//       {
//         path: ":counterId/manual-counter",
//         element: <ManualCounter />,
//       },
//     ],
//   },
//   {
//     path: "/admin",
//     element: <AdminPage />,
//     children: [
//       {
//         index: true,
//         element: <AdminDashboard />,
//       },
//       {
//         path: "competitions",
//         element: <CompetitionManagement />,
//       },
//       {
//         path: "divisions",
//         element: <DivisionManagement />,
//       },
//       {
//         path: "participants",
//         element: <ParticipantManagement />,
//       },
//       {
//         path: "records",
//         element: <RecordManagement />,
//       },
//       {
//         path: "users",
//         element: <UserManagement />,
//       },
//     ],
//   },
// ];

export const router = createBrowserRouter(routes);
