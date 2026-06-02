
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BadgeCheck, Ghost, Shield, Users2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspaceRole, setWorkspaceRole] = useState<User['role']>('USER');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const localUser: User = {
      id: `local-${Date.now()}`,
      name: trimmedEmail.split('@')[0] || 'User',
      avatarUrl: null,
      role: workspaceRole,
    };

    setCurrentUser(localUser);
    router.push('/hackathons');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Ghost className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription>Choose a role, enter anything, and get into the platform immediately.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Workspace</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setWorkspaceRole('USER')}
                    className={`rounded-xl border p-3 text-left transition-colors ${workspaceRole === 'USER' ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <div className="flex items-center gap-2 font-medium">
                      <Users2 className="h-4 w-4" />
                      Participant
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Join programs, submit projects, and track stage progress.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkspaceRole('ADMIN')}
                    className={`rounded-xl border p-3 text-left transition-colors ${workspaceRole === 'ADMIN' ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <div className="flex items-center gap-2 font-medium">
                      <Shield className="h-4 w-4" />
                      Admin
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Manage hackathons and create new programs.</p>
                  </button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>

                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                
                <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                    Forgot your password?
                  </Link>

              </div>
              <div className="rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <BadgeCheck className="h-4 w-4" />
                  No backend validation
                </div>
                <p className="mt-1">This local session only decides whether you enter as an admin or participant.</p>
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
