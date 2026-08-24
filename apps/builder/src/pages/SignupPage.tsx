import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button, Input } from '@/components/ui';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signup(email, password, storeName);
      navigate('/home');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Sign up failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 shadow-sm"
      >
        <h1 className="mb-6 text-xl font-semibold text-ink">Create your ZetSite account</h1>

        {error && (
          <div className="mb-4 rounded-md bg-danger-subtle px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}

        <label className="mb-1 block text-sm font-medium text-ink-secondary">Store name</label>
        <Input
          type="text"
          required
          minLength={2}
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="My Store"
          className="mb-4"
        />

        <label className="mb-1 block text-sm font-medium text-ink-secondary">Email</label>
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4"
        />

        <label className="mb-1 block text-sm font-medium text-ink-secondary">Password</label>
        <Input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6"
        />

        <Button type="submit" variant="primary" disabled={submitting} className="w-full">
          {submitting ? 'Creating account...' : 'Sign up'}
        </Button>

        <p className="mt-4 text-center text-sm text-ink-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-link hover:text-link-hover">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
