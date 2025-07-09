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

const formSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters long.').max(100, "Title can't be longer than 100 characters."),
  problem: z.string().min(50, 'Problem statement must be at least 50 characters long.').max(2000, "Problem statement can't be longer than 2000 characters."),
});

export default function RequestSolutionDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      problem: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // TODO: Replace with your API call to create a new project/request.
    console.log('Form values:', values);

    toast({
      title: 'Solution Requested!',
      description: `Your request "${values.title}" has been submitted.`,
    });
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Request a Solution</Button>
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
                name="problem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Problem Statement</FormLabel>
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
