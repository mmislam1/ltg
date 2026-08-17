import PageSuspense from "../components/pageSuspense";
import CustomFoodClientPage from "./CustomFoodClientPage";

export default function CustomFoodPage() {
  return (
    <PageSuspense>
      <CustomFoodClientPage />
    </PageSuspense>
  );
}
