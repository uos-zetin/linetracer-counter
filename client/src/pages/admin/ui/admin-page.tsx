import { Outlet } from "react-router";
import { AdminLayout } from "./admin-layout";

export function AdminPage() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
