
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
import { ArrowLeft, Lightbulb, Upload, Link2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Idea, SubIdea } from '@/lib/types';
import { Combobox } from '@/components/ui/combobox';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

const formSchema = z.object({
  subIdeaId: z.coerce.number({ required_error: "Please select an idea." }).min(1, { message: "Please select an idea to propose for." }),
  title: z.string().min(10, 'Title must be at least 10 characters.').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters.').max(2000),
  presentationFile: z.any().optional(),
  presentationUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
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
            const response = await axios.get<SubIdea[]>(`${API_BASE_URL}/api/subidea/${id}/subideas`, { withCredentials: true });
            // Directly use response.data as it's the array
            if (response.data && Array.isArray(response.data)) {
                const openSubIdeas = response.data
                    .filter((subIdea) => subIdea.status === 'OPEN_FOR_PROTOTYPING')
                    .map((subIdea) => ({
                        label: subIdea.title,
                        value: String(subIdea.id),
                    }));
                setAvailableSubIdeas(openSubIdeas);
            } else {
                setAvailableSubIdeas([]);
            }
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
            // Corrected to expect the Idea object directly
            const response = await axios.get<Idea>(`${API_BASE_URL}/api/ideas/${id}`, { withCredentials: true });
            setIdea(response.data); // Set the idea directly from response.data
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
      presentationFile: undefined,
      presentationUrl: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
        const { subIdeaId, title, description, presentationFile, presentationUrl } = values;

        const url = `${API_BASE_URL}/api/proposals/submit/${subIdeaId}`;

        if (presentationFile && presentationFile.length > 0) {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('file', presentationFile[0]);

            await axios.post(url, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } 
        else {
            const payload = {
                title,
                description,
                presentationUrl: presentationUrl || undefined,
            };

            await axios.post(url, payload, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

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
                        value={String(field.value)}
                        onChange={(value) => field.onChange(Number(value))}
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
              <div>
                <FormLabel>Presentation (Optional)</FormLabel>
                <FormField
                  control={form.control}
                  name="presentationFile"
                  render={({ field: { onChange, value, ...rest }}) => (
                    <FormItem className="mt-2">
                       <FormControl>
                          <div className="relative">
                              <Input 
                                  type="file" 
                                  accept=".pptx,.pdf,.doc,.docx"
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
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                            Or
                        </span>
                    </div>
                </div>
                <FormField
                    control={form.control}
                    name="presentationUrl"
                    render={({ field }) => (
                      <FormItem>
                         <FormControl>
                            <div className="relative">
                                <Input 
                                    type="url"
                                    placeholder="e.g., https://slides.com/your-deck"
                                    className="pl-12"
                                    {...field}
                                />
                                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                />
              </div>
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
