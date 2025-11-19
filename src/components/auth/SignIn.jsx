import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Icon from '../AppIcon';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        setError(error?.message);
      } else if (data?.user) {
        navigate('/financial-modeling-hub');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Icon name="TrendingUp" size={48} className="mx-auto text-primary" />
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Sign in to Financial Modeling Hub
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Access your financial models and scenarios
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e?.target?.value)}
                placeholder="Enter your email"
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e?.target?.value)}
                placeholder="Enter your password"
                className="mt-1"
              />
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <div className="flex">
                <Icon name="AlertCircle" size={16} className="text-destructive mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-destructive">{error}</div>
              </div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className="relative"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Icon name="LogIn" size={16} className="mr-2" />
                  Sign in
                </>
              )}
            </Button>
          </div>

          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-primary hover:text-primary/80">
                Sign up here
              </Link>
            </span>
          </div>
        </form>

        {/* Demo Credentials */}
        <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center">
            <Icon name="Key" size={16} className="mr-2 text-primary" />
            Demo Credentials
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Admin:</span>
              <span className="font-mono text-foreground">admin@financialmodeling.com / admin123</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">User:</span>
              <span className="font-mono text-foreground">user@financialmodeling.com / user123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;