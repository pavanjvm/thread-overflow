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

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.').max(30, "Name can't be longer than 30 characters."),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters long.')
    .max(30, "Slug can't be longer than 30 characters.")
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
});

export default function NewCommunityPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    // In a real app, you would send this to your backend.
    // We will just show a toast and redirect.
    toast({
      title: 'Community Created!',
      description: `The community c/${values.slug} has been successfully created.`,
    });
    router.push(`/c/${values.slug}`);
  };

  return (
    <div className="flex justify-center items-center py-12">
        <Card className="max-w-2xl w-full">
        <CardHeader>
            <CardTitle>Create a Community</CardTitle>
            <CardDescription>Start a new community and grow your audience.</CardDescription>
        </CardHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Community Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. Awesome Developers" {...field} onChange={(e) => {
                            field.onChange(e);
                            const slug = e.target.value
                                .trim()
                                .toLowerCase()
                                .replace(/\s+/g, '-')
                                .replace(/[^\w-]+/g, '')
                                .replace(/--+/g, '-')
                                .substring(0, 30);
                            form.setValue('slug', slug, { shouldValidate: true });
                        }} />
                    </FormControl>
                    <FormDesc>This will be the display name for your community. It will also be used to generate the slug.</FormDesc>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Community Slug</FormLabel>
                    <FormControl>
                        <div className="flex items-center">
                            <span className="text-muted-foreground bg-muted px-3 py-2 rounded-l-md border border-r-0 border-input text-sm">c/</span>
                            <Input placeholder="e.g. awesome-devs" {...field} className="rounded-l-none" />
                        </div>
                    </FormControl>
                     <FormDesc>This is the URL for your community. It must be unique.</FormDesc>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </CardContent>
            <CardFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Creating..." : "Create Community"}
                </Button>
            </CardFooter>
            </form>
        </Form>
        </Card>
    </div>
  );
}
