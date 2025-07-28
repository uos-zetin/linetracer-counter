import { AdminLayout } from "./ui/admin-layout";
import { CompetitionManagement } from "./ui/competition-management";

export function AdminCompetitionsPage() {
  return (
    <AdminLayout>
      <CompetitionManagement />
    </AdminLayout>
  );
}