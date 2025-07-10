
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function NewHackathonPage() {
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
