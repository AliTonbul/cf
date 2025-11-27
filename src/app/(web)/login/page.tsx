import { LoginForm } from "@/components/LoginForm"

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
