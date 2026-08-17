import PageSuspense from "../components/pageSuspense";
import AdminClientPage from "./AdminClientPage";

export default function AdminPage() {
  return (
    <PageSuspense>
      <AdminClientPage />
    </PageSuspense>
  );
}
