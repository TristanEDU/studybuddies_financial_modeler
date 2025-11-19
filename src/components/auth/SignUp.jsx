import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Icon from '../AppIcon';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await authService?.signUp(email, password, fullName, companyName);
      
      if (error) {
        setError(error?.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Icon name="CheckCircle" size={48} className="mx-auto text-success" />
            <h2 className="mt-6 text-3xl font-bold text-foreground">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We've sent you a confirmation link at <strong>{email}</strong>
            </p>
            <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-sm text-warning">
                <strong>Note:</strong> After clicking the email confirmation link, you'll be redirected to localhost. 
                This is normal! Your account will be verified successfully. Simply return to this platform to sign in.
              </p>
            </div>
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => navigate('/signin')}
                className="w-full"
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Icon name="TrendingUp" size={48} className="mx-auto text-primary" />
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start building your financial models today
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-foreground">
                Full name
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e?.target?.value)}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>

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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e?.target?.value)}
                placeholder="Create a password"
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-foreground">
                Company name (optional)
              </label>
              <Input
                id="companyName"
                name="companyName"
                type="text"
                autoComplete="organization"
                value={companyName}
                onChange={(e) => setCompanyName(e?.target?.value)}
                placeholder="Enter your company name"
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
                  Creating account...
                </>
              ) : (
                <>
                  <Icon name="UserPlus" size={16} className="mr-2" />
                  Create account
                </>
              )}
            </Button>
          </div>

          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/signin" className="font-medium text-primary hover:text-primary/80">
                Sign in here
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;