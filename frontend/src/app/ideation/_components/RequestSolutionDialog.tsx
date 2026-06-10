
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { useState } from 'react';
import { DollarSign } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';


const formSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters long.').max(100, "Title can't be longer than 100 characters."),

  description: z.string().min(50, 'Description must be at least 50 characters long.').max(2000, "Description can't be longer than 2000 characters."),
  potentialDollarValue: z.string().optional().refine(
    (val) => !val || !isNaN(parseFloat(val)), { message: "Must be a valid number."}
  ).transform((val) => val ? parseFloat(val) : undefined),

});

export default function RequestSolutionDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

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
      await axios.post(
        `${API_BASE_URL}/api/ideas`,
        { ...values, type: 'SOLUTION_REQUEST' },
        { withCredentials: true }
      );

      toast({
        title: 'Solution Requested!',
        description: `Your request "${values.title}" has been submitted.`,
      });
      setOpen(false);
      form.reset();
    } catch (error: any) {
      console.error('Error submitting solution request:', error);
      toast({
        title: 'Submission Failed',
        description: error.response?.data?.error || 'An error occurred while submitting your request.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Request a Solution</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Request a Solution</DialogTitle>
              <DialogDescription>
                Clearly describe a problem you're facing. The community can then propose ideas and build prototypes to solve it.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
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
                    <FormLabel>Problem Description</FormLabel>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
