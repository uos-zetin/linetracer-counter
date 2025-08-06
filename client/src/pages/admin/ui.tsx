import { Outlet } from "react-router";
import { AdminLayout } from "./ui/admin-layout";

export function AdminPage() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
