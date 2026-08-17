import PageSuspense from "../components/pageSuspense";
import CustomRecipeClientPage from "./CustomRecipeClientPage";

export default function CustomRecipePage() {
  return (
    <PageSuspense>
      <CustomRecipeClientPage />
    </PageSuspense>
  );
}
