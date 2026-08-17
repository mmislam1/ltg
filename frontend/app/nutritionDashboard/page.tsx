import DailyReport from "../components/dailyReport";
import PageSuspense from "../components/pageSuspense";

export default function NutritionDashboard() {
  return (
    <PageSuspense>
      <DailyReport />
    </PageSuspense>
  );
}
