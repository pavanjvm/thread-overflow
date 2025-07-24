
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ghost } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState(''); // Changed from username to name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, {
        name, // Changed from username to name
        email,
        password,
      });

      if (response.status === 200) {
        // Handle successful signup, e.g., redirect to login page or show success message
        router.push('/login');
      } else {
        // Handle signup error, e.g., show error message
        console.error('Signup failed', response.status);
      }
    } catch (error) {
      console.error('Signup failed', error);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <Ghost className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label> {/* Changed from first-name to name */}
                <Input id="name" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} /> {/* Changed from username to name and setUsername to setName */}
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
