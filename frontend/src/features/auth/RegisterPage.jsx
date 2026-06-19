import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button, Alert } from '../../components/ui/index.jsx'
import { COMMON_CURRENCIES } from '../../utils/constants'

const schema = z.object({
  fullName:          z.string().min(2, 'At least 2 characters'),
  email:             z.string().email('Enter a valid email'),
  password:          z.string().min(8, 'At least 8 characters'),
  confirmPassword:   z.string(),
  preferredCurrency: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export default function RegisterPage() {
  const { register: authRegister } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName:          '',
      email:             '',
      password:          '',
      confirmPassword:   '',
      preferredCurrency: 'USD',
    },
  })

  const onSubmit = async ({ fullName, email, password, preferredCurrency }) => {
    try {
      setServerError(null)
      await authRegister({ fullName, email, password, preferredCurrency })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setServerError(err?.response?.data?.error ?? 'Registration failed.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white
                    flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">💰</span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500">Start tracking your expenses today</p>
        </div>

        <div className="card">
          {serverError && (
            <div className="mb-5"><Alert type="error">{serverError}</Alert></div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Full name</label>
              <input
                className={`input ${errors.fullName ? 'input-error' : ''}`}
                placeholder="Jane Doe"
                {...register('fullName')}
              />
              {errors.fullName && <p className="text-xs text-danger-600">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="you@example.com"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-danger-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                className={`input ${errors.password ? 'input-error' : ''}`}
                placeholder="Min. 8 characters"
                {...register('password')}
              />
              {errors.password && <p className="text-xs text-danger-600">{errors.password.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Confirm password</label>
              <input
                type="password"
                className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Repeat password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="text-xs text-danger-600">{errors.confirmPassword.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Default currency</label>
              <select
                className="input bg-white"
                {...register('preferredCurrency')}
              >
                {COMMON_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full mt-2"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}