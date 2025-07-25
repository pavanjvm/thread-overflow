
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
import { Input } from '@/components/ui/input';
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
import { ideas } from '@/lib/mock-data';
import { useEffect, useState } from 'react';
import type { Idea } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters.').max(1000),
  status: z.enum(['Open for prototyping', 'Self-prototyping'], {
    required_error: "You need to select a prototyping status.",
  }),
});


export default function SubmitSubIdeaPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [idea, setIdea] = useState<Idea | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'Open for prototyping',
    },
  });
  
  useEffect(() => {
    const foundIdea = ideas.find(p => p.id === id);
    if (foundIdea) {
      setIdea(foundIdea);
    } else {
        console.error("Idea not found");
    }
  }, [id]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // TODO: Replace with your API call to submit a sub-idea.
    console.log('Submitting sub-idea for project', id, values);

    toast({
      title: 'Idea Submitted!',
      description: `Your idea "${values.title}" has been successfully submitted.`,
    });
    router.push(`/ideation/${id}`);
  };
  
  if (!idea) {
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
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
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
                <>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Project
                </>
              </Link>
          </Button>
      </div>
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="flex items-center"><Lightbulb className="mr-2 h-6 w-6 text-yellow-500" />Submit an Idea</CardTitle>
              <CardDescription>
                You are submitting an idea for the project: <span className="font-semibold text-foreground">{idea.title}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idea Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Use WebSockets for real-time updates" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your idea. What problem does it solve within the project? How would it work?"
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Prototyping Status</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Open for prototyping" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Open for prototyping - Anyone can submit a proposal for this idea.
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Self-prototyping" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Self-prototyping - You plan to work on this idea yourself.
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
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
