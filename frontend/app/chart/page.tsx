import PageSuspense from "../components/pageSuspense";
import NutritionChartClientPage from "./NutritionChartClientPage";

export default function NutritionChartPage() {
  return (
    <PageSuspense>
      <NutritionChartClientPage />
    </PageSuspense>
  );
}
