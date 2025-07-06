'use client';

import { useForm, useFieldArray } from 'react-hook-form';
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
import { BarChart2, Image as ImageIcon, PlusCircle, X } from "lucide-react";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const formSchema = z.object({
  communityId: z.string().min(1, 'Please select a community.'),
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  content: z.string().optional(),
  media: z.any().optional(),
  pollOptions: z.array(z.object({
    value: z.string().min(1, { message: 'Option cannot be empty.' }).max(80, { message: 'Option cannot be more than 80 characters.' })
  })).min(2, "A poll must have at least two options.").max(6, "A poll can have at most six options.").optional(),
});

export default function NewPostPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPollFields, setShowPollFields] = useState(false);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      communityId: '',
      title: '',
      content: '',
    },
  });
  
  const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "pollOptions",
  });

  const handleTogglePoll = () => {
      const isShowing = !showPollFields;
      setShowPollFields(isShowing);
      if (isShowing) {
          form.setValue('pollOptions', [{ value: '' }, { value: '' }]);
      } else {
          form.setValue('pollOptions', undefined);
          form.clearErrors('pollOptions');
      }
  };
  
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

  const onSubmit = (values: z.infer<typeof formSchema>, status: 'published' | 'draft' = 'published') => {
    // TODO: Replace with your API call to create a new post.
    // This will now include `values.media`, `values.pollOptions`, and status.
    console.log('Form values:', { ...values, status });
    
    if (status === 'published') {
      toast({
        title: 'Post Created!',
        description: 'Your new post has been successfully created.',
      });
      router.push('/feed');
    } else {
      toast({
        title: 'Draft Saved!',
        description: 'Your post has been saved as a draft.',
      });
      router.push('/drafts');
    }
  };

  return (
    <>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Create a New Post</CardTitle>
          <CardDescription>Share your thoughts with the community.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(values => onSubmit(values, 'published'))}>
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
                      <FormLabel>Body</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What are your thoughts? (optional)" className="min-h-[200px]" {...field} />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
              />

              {showPollFields && (
                <div className="space-y-4 pt-4 border-t">
                  <FormLabel>Poll Options</FormLabel>
                  {fields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`pollOptions.${index}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input {...field} placeholder={`Option ${index + 1}`} />
                            </FormControl>
                            {fields.length > 2 && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="shrink-0">
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  {fields.length < 6 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '' })}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Option
                    </Button>
                  )}
                  {form.formState.errors.pollOptions && <FormMessage>{form.formState.errors.pollOptions.message}</FormMessage>}
                </div>
              )}

              {mediaPreview && (
                <div className="mt-4 relative w-full h-64 rounded-lg overflow-hidden border">
                    {mediaType === 'image' ? (
                        <Image src={mediaPreview} alt="Media preview" fill className="object-contain" />
                    ) : (
                        <video src={mediaPreview} controls className="w-full h-full object-contain" />
                    )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Input 
                    id="media-upload"
                    type="file" 
                    className="hidden" 
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Image or Video
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleTogglePoll} data-state={showPollFields ? 'active' : 'inactive'} className="data-[state=active]:bg-accent">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Poll
                </Button>
              </div>

            </CardContent>
            <CardFooter className="flex gap-2">
              <Button type="submit">Create Post</Button>
              <Button type="button" variant="outline" onClick={form.handleSubmit(values => onSubmit(values, 'draft'))}>Save as Draft</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
}
