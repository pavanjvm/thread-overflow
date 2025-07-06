'use client';

import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { suggestPostTitlesAction } from './actions';
import { Loader2, Wand2 } from 'lucide-react';
import { communities } from '@/lib/mock-data';

const formSchema = z.object({
  communityId: z.string().min(1, 'Please select a community.'),
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  content: z.string().min(20, 'Content must be at least 20 characters long.'),
});

export default function NewPostPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      communityId: '',
      title: '',
      content: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    toast({
      title: 'Post Created!',
      description: 'Your new post has been successfully created.',
    });
    router.push('/');
  };

  const handleSuggestTitles = async () => {
    const content = form.getValues('content');
    if (content.length < 20) {
      toast({
        variant: 'destructive',
        title: 'Content too short',
        description: 'Please write at least 20 characters of content to get title suggestions.',
      });
      return;
    }
    setIsSuggesting(true);
    try {
      const result = await suggestPostTitlesAction({ postContent: content });
      if (result && result.titles) {
        setSuggestions(result.titles);
        setIsDialogOpen(true);
      } else {
         toast({ variant: 'destructive', title: 'Error', description: 'Could not generate title suggestions.' });
      }
    } catch (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSelectSuggestion = (title: string) => {
    form.setValue('title', title);
    setIsDialogOpen(false);
  }

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
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Input placeholder="Enter a descriptive title" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSuggestTitles}
                        disabled={isSuggesting}
                      >
                        {isSuggesting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Wand2 className="h-4 w-4" />
                        )}
                        <span className="ml-2 hidden sm:inline">Suggest Titles</span>
                      </Button>
                    </div>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Title Suggestions</DialogTitle>
            <DialogDescription>
              Here are some AI-generated titles based on your content. Click one to use it.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {suggestions.map((title, index) => (
                <Button key={index} variant="outline" className="justify-start text-left h-auto" onClick={() => handleSelectSuggestion(title)}>
                    {title}
                </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
