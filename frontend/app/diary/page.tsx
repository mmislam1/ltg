import SimplifiedDietChart from "../components/simplifiedDietChart";
import PageSuspense from "../components/pageSuspense";

export default function DiaryPage() {
  return (
    <PageSuspense>
      <SimplifiedDietChart />
    </PageSuspense>
  );
}
