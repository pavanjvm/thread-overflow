
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EditHackathonPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="mx-auto max-w-2xl w-full text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Hackathon</CardTitle>
          <CardDescription>
            This page is for admins to edit hackathon details. The form to edit details for <pre className="inline bg-muted p-1 rounded">`{slug}`</pre> would be here.
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
