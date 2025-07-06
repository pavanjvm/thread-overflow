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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { communities } from '@/lib/mock-data';

const formSchema = z.object({
  communityId: z.string().min(1, 'Please select a community.'),
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  content: z.string().min(20, 'Content must be at least 20 characters long.'),
});

export default function NewPostPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      communityId: '',
      title: '',
      content: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // TODO: Replace with your API call to create a new post.
    console.log('Form values:', values);
    
    toast({
      title: 'Post Created!',
      description: 'Your new post has been successfully created.',
    });
    router.push('/feed');
  };

  return (
    <>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Create a New Post</CardTitle>
          <CardDescription>Share your thoughts with the community.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="communityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a community to post in" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {communities.map((community) => (
                          <SelectItem key={community.id} value={community.id}>
                            c/{community.slug}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a descriptive title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Write your post content here..." className="min-h-[200px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit">Create Post</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
}
