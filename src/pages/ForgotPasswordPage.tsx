import { Link } from 'react-router-dom'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Logo } from '@/components/common/Logo'
import { Button } from '@/components/ui/button'

export function ForgotPasswordPage() {
  return (
    <div className="login-canvas flex min-h-svh items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Logo to="/admin/login" />
        <h1 className="font-display mt-6 text-3xl">Reset your password</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Password reset will be available once authentication is connected.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link to="/admin/login">Back to sign in</Link>
        </Button>
      </div>
    </div>
  )
}
