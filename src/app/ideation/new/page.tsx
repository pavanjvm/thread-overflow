
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters long.').max(100, "Title can't be longer than 100 characters."),
  description: z.string().min(50, 'Description must be at least 50 characters long.').max(2000, "Description can't be longer than 2000 characters."),
  status: z.enum(['Open for prototyping', 'Self-prototyping'], {
    required_error: 'You need to select a status for this idea.',
  }),
});

export default function SubmitIdeaPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // TODO: Replace with your API call to create a new idea.
    console.log('Form values:', values);

    toast({
      title: 'Idea Submitted!',
      description: `Your idea "${values.title}" has been submitted.`,
    });
    router.push('/ideation');
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
                Share a problem or an idea with the community. Others can then submit proposals to build a solution.
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
                        placeholder="Describe the problem in detail. What are the pain points? Who is affected? What would a good solution look like?"
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
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>What's the status of this idea?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent has-[[data-state=checked]]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="Open for prototyping" />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel className="font-normal">
                              Open for Prototyping
                            </FormLabel>
                             <FormDescription>
                               Anyone in the community can submit a proposal for this idea.
                            </FormDescription>
                          </div>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent has-[[data-state=checked]]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="Self-prototyping" />
                          </FormControl>
                           <div className="space-y-1">
                            <FormLabel className="font-normal">
                              I'm Prototyping This
                            </FormLabel>
                            <FormDescription>
                                You plan to work on this idea yourself. Only you can submit a proposal.
                            </FormDescription>
                          </div>
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
