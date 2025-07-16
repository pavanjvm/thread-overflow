
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
import { Input } from '@/components/ui/input';
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

const formSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters.').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters.').max(2000),
});

export default function SubmitProposalPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [idea, setIdea] = useState<Idea | null>(null);

  useEffect(() => {
    const foundIdea = ideas.find(p => p.id === id);
    if (foundIdea) {
      setIdea(foundIdea);
    }
  }, [id]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // TODO: Replace with your API call to submit a proposal
    console.log('Submitting proposal for idea:', id, values);

    toast({
      title: 'Proposal Submitted!',
      description: `Your proposal has been successfully submitted.`,
    });
    router.push(`/ideation/${id}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
        <div className="mb-4">
            <Button variant="ghost" asChild>
                <Link href={id ? `/ideation/${id}` : '/ideation'}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to {idea ? 'Idea' : 'Ideation Portal'}
                </Link>
            </Button>
        </div>
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="flex items-center"><Lightbulb className="mr-2 h-6 w-6 text-blue-500" />Submit a Proposal</CardTitle>
              <CardDescription>
                You are submitting a proposal for the {idea?.type.toLowerCase()}: <span className="font-semibold text-foreground">{idea?.title}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposal Title</FormLabel>
                    <FormControl>
                      <Input placeholder="A short, descriptive title for your proposal" {...field} />
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
                    <FormLabel>Describe Your Approach</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Explain your proposal. How would you solve the problem? What technologies would you use?"
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
                {form.formState.isSubmitting ? 'Submitting...' : 'Submit Proposal'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
