
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lightbulb, Upload } from 'lucide-react';
import { ideas } from '@/lib/mock-data';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import type { Idea } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Combobox } from '@/components/ui/combobox';

const formSchema = z.object({
  ideaId: z.string({
    required_error: 'Please select an idea to submit a proposal for.',
  }),
  title: z.string().min(10, 'Title must be at least 10 characters.').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters.').max(2000),
  presentation: z.any().optional(),
});

export default function SubmitProposalPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { currentUser } = useAuth();
  
  const [ideaOptions, setIdeaOptions] = useState<{label: string, value: string}[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  useEffect(() => {
    const availableIdeas = ideas.filter(idea => {
      // It's open for anyone
      if (idea.status === 'Open for prototyping') return true;
      // It's the current user's own "self-prototyping" idea
      if (idea.status === 'Self-prototyping' && idea.author.id === currentUser?.id) return true;
      return false;
    });

    // Put user's own ideas first
    availableIdeas.sort((a, b) => {
        if (a.author.id === currentUser?.id && b.author.id !== currentUser?.id) return -1;
        if (a.author.id !== currentUser?.id && b.author.id === currentUser?.id) return 1;
        return 0;
    });

    setIdeaOptions(availableIdeas.map(i => ({ label: i.title, value: i.id })))
    
    // Set initial idea if coming from a specific idea page
    const initialIdea = ideas.find(i => i.id === id);
    if(initialIdea) {
        setSelectedIdea(initialIdea);
    }

  }, [id, currentUser]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ideaId: id || '',
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'ideaId') {
        const foundIdea = ideas.find(i => i.id === value.ideaId);
        setSelectedIdea(foundIdea || null);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // TODO: Replace with your API call to submit a proposal
    console.log('Submitting proposal:', values);

    toast({
      title: 'Proposal Submitted!',
      description: `Your proposal has been successfully submitted for the idea.`,
    });
    router.push(`/ideation/${values.ideaId}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
        <div className="mb-4">
            <Button variant="ghost" asChild>
                <Link href={id ? `/ideation/${id}` : '/ideation'}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to {id ? 'Idea' : 'Ideation Portal'}
                </Link>
            </Button>
        </div>
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="flex items-center"><Lightbulb className="mr-2 h-6 w-6 text-blue-500" />Submit a Proposal</CardTitle>
              <CardDescription>
                Select an idea and describe your approach to solving it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <FormField
                control={form.control}
                name="ideaId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Select Idea</FormLabel>
                    <Combobox 
                        options={ideaOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select an idea..."
                        searchPlaceholder="Search ideas..."
                    />
                    <FormDescription>
                        {selectedIdea ? `You are submitting a proposal for: "${selectedIdea.title}"` : 'Choose an idea to propose a solution for.'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        placeholder="Explain your proposal. How would you solve the problem? What technologies would you use? What are the key features of your proposed solution?"
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
                name="presentation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presentation (Optional)</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Input id="presentation" type="file" className="pl-12" accept=".ppt, .pptx, .pdf" onChange={(e) => field.onChange(e.target.files)} />
                            <Upload className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        </div>
                    </FormControl>
                    <FormDescription>Upload a PPT or PDF to provide more detail.</FormDescription>
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
