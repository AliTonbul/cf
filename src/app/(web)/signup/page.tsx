import { SignupForm } from "@/components/SignUpForm"

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}
