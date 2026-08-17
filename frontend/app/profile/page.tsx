import PageSuspense from "../components/pageSuspense";
import ProfileClientPage from "./ProfileClientPage";

export default function ProfilePage() {
  return (
    <PageSuspense>
      <ProfileClientPage />
    </PageSuspense>
  );
}
