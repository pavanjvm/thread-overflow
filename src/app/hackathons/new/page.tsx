
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NewHackathonPage() {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // In a real app, this check should be done on the server.
    if (currentUser && currentUser.role !== 'admin') {
      // Optionally redirect non-admins away
      // router.push('/hackathons');
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="mx-auto max-w-2xl w-full text-center">
          <CardHeader>
            <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle className="text-2xl mt-4">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to create a new hackathon. This action is reserved for administrators.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/hackathons">Back to Hackathons</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="mx-auto max-w-2xl w-full text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Hackathon</CardTitle>
          <CardDescription>
            This page is for admins to create a new hackathon. The form to add details would be here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/hackathons">Back to Hackathons</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
