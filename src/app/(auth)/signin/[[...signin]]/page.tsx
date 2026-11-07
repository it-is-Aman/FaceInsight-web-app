import { SignIn } from "@clerk/nextjs";

export const metadata = { title: "Sign in", robots: { index: false } };

export default function SignInPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <SignIn />
    </div>
  );
}
