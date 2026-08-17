import PageSuspense from "../components/pageSuspense";
import ManageMealsClientPage from "./ManageMealsClientPage";

export default function ManageMealsPage() {
  return (
    <PageSuspense>
      <ManageMealsClientPage />
    </PageSuspense>
  );
}
