import { AdminLayout } from "./admin-layout";
import { ParticipantManagement } from "./participant-management";

export function AdminParticipantsPage() {
  return (
    <AdminLayout>
      <ParticipantManagement />
    </AdminLayout>
  );
}