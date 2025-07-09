'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import { projects } from '@/lib/mock-data';
import { useEffect, useState } from 'react';
import type { Project } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  idea: z.string().min(20, 'Your idea must be at least 20 characters long.').max(1000, "Your idea can't be longer than 1000 characters."),
});

export default function SubmitIdeaPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [project, setProject] = useState<Project | null>(null);
  
  useEffect(() => {
    const foundProject = projects.find(p => p.id === id);
    if (foundProject) {
      setProject(foundProject);
    } else {
        console.error("Project not found");
    }
  }, [id]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idea: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // TODO: Replace with your API call to submit an idea for the project.
    console.log('Submitting idea for project', id, values);

    toast({
      title: 'Idea Submitted!',
      description: `Your idea has been successfully submitted for the project.`,
    });
    router.push(`/ideation/${id}`);
  };
  
  if (!project) {
      return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-4">
                <Skeleton className="h-8 w-48" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-32 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        </div>
      );
  }

  return (
    <div className="max-w-2xl mx-auto">
        <div className="mb-4">
            <Button variant="ghost" asChild>
                <Link href={`/ideation/${id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Project
                </Link>
            </Button>
        </div>
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="flex items-center"><Lightbulb className="mr-2 h-6 w-6 text-blue-500" />Submit an Idea</CardTitle>
              <CardDescription>
                You are submitting an idea for the project: <span className="font-semibold text-foreground">{project.title}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="idea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Idea</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your brilliant idea. How would you solve the problem? What features would it have?"
                        className="min-h-48"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Submitting...' : 'Submit Idea'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
