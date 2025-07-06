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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, UploadCloud } from "lucide-react";
import { useState, useEffect } from 'react';
import Image from 'next/image';

const formSchema = z.object({
  communityId: z.string().min(1, 'Please select a community.'),
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  content: z.string().optional(),
  media: z.any().optional(),
});

export default function NewPostPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      communityId: '',
      title: '',
      content: '',
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (mediaPreview) {
          URL.revokeObjectURL(mediaPreview);
      }
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
      setMediaType(file.type.startsWith('image/') ? 'image' : 'video');
      form.setValue('media', e.target.files);
    }
  };

  useEffect(() => {
    return () => {
        if (mediaPreview) {
            URL.revokeObjectURL(mediaPreview);
        }
    }
  }, [mediaPreview]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // TODO: Replace with your API call to create a new post.
    // This will now include `values.media` which is a FileList.
    // You will likely want to upload this file to your backend/storage service.
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

              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4" /> Text Post</TabsTrigger>
                    <TabsTrigger value="media"><UploadCloud className="mr-2 h-4 w-4" /> Image or Video</TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="mt-4">
                     <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                        <FormItem>
                            <FormControl>
                            <Textarea placeholder="Write your post content here... (optional if uploading media)" className="min-h-[200px]" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </TabsContent>
                <TabsContent value="media" className="mt-4">
                    <FormField
                        control={form.control}
                        name="media"
                        render={() => (
                            <FormItem>
                                <FormControl>
                                    <label htmlFor="media-upload" className="relative flex justify-center items-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                        <Input 
                                            id="media-upload"
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*,video/*"
                                            onChange={handleFileChange}
                                        />
                                        {mediaPreview ? (
                                            <>
                                                {mediaType === 'image' ? (
                                                    <Image src={mediaPreview} alt="Media preview" fill className="object-contain rounded-md" />
                                                ) : (
                                                    <video src={mediaPreview} controls className="w-full h-full object-contain rounded-md" />
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center text-muted-foreground">
                                                <UploadCloud className="h-10 w-10 mx-auto mb-2" />
                                                <p className="font-semibold">Click to upload</p>
                                                <p className="text-xs">PNG, JPG, GIF, MP4, WEBM</p>
                                            </div>
                                        )}
                                    </label>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </TabsContent>
              </Tabs>
              
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
