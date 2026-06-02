
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ghost, Shield, Users2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/lib/types';

export default function SignupPage() {
  const router = useRouter();
  const { setCurrentUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspaceRole, setWorkspaceRole] = useState<User['role']>('USER');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const localUser: User = {
      id: `local-${Date.now()}`,
      name: trimmedName || trimmedEmail.split('@')[0] || 'User',
      avatarUrl: null,
      role: workspaceRole,
    };

    void password;
    setCurrentUser(localUser);
    router.push('/hackathons');
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <Ghost className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Create a local admin or participant workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
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
                    <p className="mt-1 text-xs text-muted-foreground">Best for builders joining challenges and shipping submissions.</p>
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
                    <p className="mt-1 text-xs text-muted-foreground">Best for managing hackathons and creating new ones.</p>
                  </button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">
                Create an account
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
