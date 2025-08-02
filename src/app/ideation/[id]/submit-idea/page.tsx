
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Idea } from '@/lib/types';


const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  description: z.string().min(20, 'Description must be at least 20 characters long.'),
  status: z.enum(['OPEN_FOR_PROTOTYPING', 'SELF_PROTOTYPING']),
});

export default function SubmitSubIdeaPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'OPEN_FOR_PROTOTYPING',
    },
  });
  
  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/ideas/${id}`, { withCredentials: true });
        setIdea(response.data);
      } catch (error) {
        console.error("Error fetching idea:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchIdea();
    }
  }, [id]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/subidea/${id}/subideas`,
        values,
        { withCredentials: true }
      );

      toast({
        title: 'Idea Submitted!',
        description: 'Your idea has been successfully submitted.',
      });

      router.push(`/ideation/${id}`);
    } catch (error: any) {
      console.error('Error submitting idea:', error);
      toast({
        title: 'Submission Failed',
        description: error.response?.data?.error || 'An error occurred while submitting your idea.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
        <div className="max-w-2xl mx-auto">
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-4 w-3/4 mb-8" />
            <div className="space-y-8">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
        <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Share your thoughts on:</h1>
            <p className="text-lg text-muted-foreground mt-1">"{idea?.title}"</p>
        </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Idea/Suggestion Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Use AI for automated content moderation" {...field} />
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
                <FormLabel>Describe Your Idea</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Provide a detailed explanation of your idea. What problem does it solve? How does it improve the original concept?"
                    className="resize-none"
                    {...field}
                    rows={6}
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
                <FormLabel>Are you planning to build a prototype for this yourself?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="OPEN_FOR_PROTOTYPING" />
                      </FormControl>
                      <FormLabel className="font-normal">
                       No, I'm just sharing the idea. It's open for anyone to prototype.
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="SELF_PROTOTYPING" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Yes, I intend to build a prototype for this idea myself.
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit Your Idea</Button>
        </form>
      </Form>
    </div>
  );
}
