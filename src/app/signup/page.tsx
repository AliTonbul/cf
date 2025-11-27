import { SignupForm } from "@/components/SignUpForm"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}
