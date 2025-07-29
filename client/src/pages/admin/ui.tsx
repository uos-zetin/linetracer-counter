import { AdminLayout } from "./ui/admin-layout";
import { Outlet } from "react-router";

export function AdminPage() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
