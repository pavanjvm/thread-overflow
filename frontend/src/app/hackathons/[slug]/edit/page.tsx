
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { useEffect } from 'react';

export default function EditHackathonPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // In a real app, this check should be done on the server.
    if (currentUser && currentUser.role !== 'ADMIN') {
      // Optionally redirect non-admins away
      // router.push(`/hackathons/${slug}`);
    }
  }, [currentUser, router, slug]);


  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="mx-auto max-w-2xl w-full text-center">
          <CardHeader>
            <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle className="text-2xl mt-4">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to edit this program. This action is reserved for client operators.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/hackathons/${slug}`}>Back to Hackathon</Link>
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
          <CardTitle className="text-2xl">Edit Program Workspace</CardTitle>
          <CardDescription>
            This page is for client operators to edit program details. The form for <code className="rounded bg-muted px-1 py-0.5">{slug}</code> would live here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={`/hackathons/${slug}`}>Back to Hackathon</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
