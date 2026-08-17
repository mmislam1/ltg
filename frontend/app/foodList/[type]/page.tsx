import PageSuspense from "../../components/pageSuspense";
import FoodListClientPage from "./FoodListClientPage";

export default function FoodListPage() {
  return (
    <PageSuspense>
      <FoodListClientPage />
    </PageSuspense>
  );
}
