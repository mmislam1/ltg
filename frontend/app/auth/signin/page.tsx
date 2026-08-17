import PageSuspense from "../../components/pageSuspense";
import { AuthSuspenseFallback } from "../../components/suspenseFallback";
import SignInClientPage from "./SignInClientPage";

export default function SignInPage() {
  return (
    <PageSuspense fallback={<AuthSuspenseFallback />}>
      <SignInClientPage />
    </PageSuspense>
  );
}
