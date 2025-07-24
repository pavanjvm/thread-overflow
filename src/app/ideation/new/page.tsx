
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
  FormDescription as FormDesc,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lightbulb, DollarSign } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters long.').max(100, "Title can't be longer than 100 characters."),
  description: z.string().min(50, 'Description must be at least 50 characters long.').max(2000, "Description can't be longer than 2000 characters."),
  potentialDollarValue: z.string().optional().refine(
    (val) => !val || !isNaN(parseFloat(val)), { message: "Must be a valid number."}
  ).transform((val) => val ? parseFloat(val) : undefined),
});

export default function SubmitIdeaPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      potentialDollarValue: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch('http://localhost:3000/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...values, type: 'IDEATION' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit idea.');
      }

      toast({
        title: 'Idea Submitted!',
        description: `Your idea "${values.title}" has been submitted.`,
      });
      router.push('/ideation');
    } catch (error: any) {
      console.error('Error submitting idea:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'An error occurred while submitting your idea.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
        <div className="mb-4">
            <Button variant="ghost" asChild>
                <Link href="/ideation">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Ideation Portal
                </Link>
            </Button>
        </div>
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lightbulb className="h-6 w-6 text-primary" /> Submit an Idea</CardTitle>
              <CardDescription>
                Share a well-formed idea with the community.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idea Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A better way to manage project tasks" {...field} />
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
                    <FormLabel>Idea Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the idea in detail. What are the key features? What is the user value?"
                        className="min-h-48"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="potentialDollarValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Potential Dollar Value ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                         <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <Input
                          type="number"
                          placeholder="e.g., 50000"
                          className="pl-8"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                          value={field.value ?? ''}
                        />
                      </div>
                    </FormControl>
                    <FormDesc>Estimate the potential value or cost savings of this idea.</FormDesc>
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
