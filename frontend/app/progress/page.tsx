import PageSuspense from "../components/pageSuspense";
import ProgressClientPage from "./ProgressClientPage";

export default function ProgressPage() {
  return (
    <PageSuspense>
      <ProgressClientPage />
    </PageSuspense>
  );
}
