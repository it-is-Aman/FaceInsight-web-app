import { SignUp } from "@clerk/nextjs";

export const metadata = { title: "Create account", robots: { index: false } };

export default function SignUpPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <SignUp />
    </div>
  );
}
