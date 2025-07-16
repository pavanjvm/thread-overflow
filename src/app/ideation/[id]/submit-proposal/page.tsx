
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
import { ArrowLeft, Lightbulb, Upload } from 'lucide-react';
import { ideas, users } from '@/lib/mock-data';
import { useEffect, useState } from 'react';
import type { Idea, SubIdea } from '@/lib/types';
import { Combobox } from '@/components/ui/combobox';

const formSchema = z.object({
  ideaId: z.string({ required_error: "Please select an idea." }).min(1, { message: "Please select an idea to propose for." }),
  title: z.string().min(10, 'Title must be at least 10 characters.').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters.').max(2000),
  presentation: z.any().optional(),
});

export default function SubmitProposalPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [idea, setIdea] = useState<Idea | null>(null);
  const [availableIdeas, setAvailableIdeas] = useState<{label: string, value: string}[]>([]);

  // Assume current user is the first user for prototyping
  const currentUser = users[0];

  useEffect(() => {
    const foundIdea = ideas.find(p => p.id === id);
    if (foundIdea) {
      setIdea(foundIdea);
      const openIdeas = foundIdea.subIdeas.filter(si => 
        si.status === 'Open for prototyping' || (si.status === 'Self-prototyping' && si.author.id === currentUser.id)
      ).map(si => ({ label: si.title, value: si.id }));
      setAvailableIdeas(openIdeas);
    }
  }, [id, currentUser.id]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ideaId: '',
      title: '',
      description: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // TODO: Replace with your API call to submit a proposal
    console.log('Submitting proposal for project:', id, values);

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
                    Back to {idea ? 'Project' : 'Ideation Portal'}
                </Link>
            </Button>
        </div>
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="flex items-center"><Lightbulb className="mr-2 h-6 w-6 text-blue-500" />Submit a Proposal</CardTitle>
              <CardDescription>
                You are submitting a proposal for the project: <span className="font-semibold text-foreground">{idea?.title}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <FormField
                  control={form.control}
                  name="ideaId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Idea to Build On</FormLabel>
                      <Combobox
                        options={availableIdeas}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select an idea..."
                        searchPlaceholder="Search ideas..."
                      />
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
                        placeholder="Explain your proposal. How would you solve the problem? What technologies would you use?"
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
                render={({ field: { onChange, value, ...rest }}) => (
                  <FormItem>
                    <FormLabel>Upload Presentation (PPTX)</FormLabel>
                     <FormControl>
                        <div className="relative">
                            <Input 
                                type="file" 
                                accept=".pptx"
                                onChange={(e) => onChange(e.target.files)}
                                className="pl-12"
                                {...rest}
                            />
                            <Upload className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        </div>
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
