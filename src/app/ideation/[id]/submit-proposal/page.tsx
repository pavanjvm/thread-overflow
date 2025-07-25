
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
import { useEffect, useState } from 'react';
import type { Idea, SubIdea } from '@/lib/types';
import { Combobox } from '@/components/ui/combobox';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

const formSchema = z.object({
  subIdeaId: z.coerce.number({ required_error: "Please select an idea." }).min(1, { message: "Please select an idea to propose for." }),
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
  const [availableSubIdeas, setAvailableSubIdeas] = useState<{label: string, value: string}[]>([]);

  useEffect(() => {
    const fetchOpenSubIdeas = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/subidea/${id}/subideas`, { withCredentials: true });
            const openSubIdeas = response.data
                .filter((subIdea: SubIdea) => subIdea.status === 'OPEN_FOR_PROTOTYPING')
                .map((subIdea: SubIdea) => ({
                    label: subIdea.title,
                    value: subIdea.id,
                }));
            setAvailableSubIdeas(openSubIdeas);
        } catch (error) {
            console.error("Error fetching open sub-ideas:", error);
            toast({
                title: 'Error',
                description: 'Could not fetch open sub-ideas for this project.',
                variant: 'destructive',
            });
        }
    };
    
    const fetchParentIdea = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/ideas/${id}`, { withCredentials: true });
            setIdea(response.data);
        } catch (error) {
            console.error("Error fetching parent idea:", error);
        }
    }

    if (id) {
        fetchOpenSubIdeas();
        fetchParentIdea();
    }
  }, [id, toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subIdeaId: 0,
      title: '',
      description: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
        const formData = new FormData();
        formData.append('subIdeaId', values.subIdeaId.toString());
        formData.append('title', values.title);
        formData.append('description', values.description);
        if (values.presentation && values.presentation.length > 0) {
            formData.append('file', values.presentation[0]);
        }

        await axios.post(`${API_BASE_URL}/api/proposals/${id}/proposals`, formData, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        toast({
            title: 'Proposal Submitted!',
            description: `Your proposal has been successfully submitted.`,
        });
        router.push(`/ideation/${id}`);

    } catch (error: any) {
        console.error('Error submitting proposal:', error);
        toast({
            title: 'Submission Failed',
            description: error.response?.data?.error || 'An error occurred while submitting your proposal.',
            variant: 'destructive',
        });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
          <Button variant="ghost" asChild>
              <Link href={id ? `/ideation/${id}` : '/ideation'}>
                  <span>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to {idea ? 'Project' : 'Ideation Portal'}
                  </span>
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
                  name="subIdeaId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Idea to Build On</FormLabel>
                      <Combobox
                        options={availableSubIdeas}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select an idea..."
                        searchPlaceholder="Search ideas by title..."
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
                {form.form_state.isSubmitting ? 'Submitting...' : 'Submit Proposal'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
