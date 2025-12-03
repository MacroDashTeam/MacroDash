import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Bull from '../assets/bull.jpeg';

type LoginScreenProps = {
  onLogin: (email: string, password: string) => void;
  isLoading?: boolean;
  error?: string;
};

export default function LoginScreen({ onLogin, isLoading = false, error }: LoginScreenProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1320] p-4">
      <Card className="w-full max-w-md bg-[#0B1320]/95 backdrop-blur border-white/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={Bull} alt="MacroDash Logo" className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Welcome to MacroDash</CardTitle>
          <CardDescription className="text-gray-400">
            Sign in to access your macroeconomic dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#1a2332] border-white/20 text-white placeholder:text-gray-400 focus:border-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#1a2332] border-white/20 text-white placeholder:text-gray-400 focus:border-blue-500"
                required
              />
            </div>
            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300">
                Sign up
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
