import { Suspense } from "react";
import AuthPage from "@/components/AuthPage";

export const metadata = { title: "Sign in | HUBZONE" };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthPage mode="login" />
    </Suspense>
  );
}
