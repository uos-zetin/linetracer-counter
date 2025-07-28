import { AdminLayout } from "./ui/admin-layout";
import { AdminDashboard } from "./ui/admin-dashboard";

export function AdminPage() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}