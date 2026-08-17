import PageSuspense from "../../components/pageSuspense";
import { AuthSuspenseFallback } from "../../components/suspenseFallback";
import SignUpClientPage from "./SignUpClientPage";

export default function SignUpPage() {
  return (
    <PageSuspense fallback={<AuthSuspenseFallback />}>
      <SignUpClientPage />
    </PageSuspense>
  );
}
