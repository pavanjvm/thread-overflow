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
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, ImageIcon } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.').max(30, "Name can't be longer than 30 characters."),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters long.')
    .max(30, "Slug can't be longer than 30 characters.")
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
  description: z.string().max(500, "Description can't be longer than 500 characters.").optional(),
  icon: z.any().optional(),
  coverImage: z.any().optional(),
});

export default function NewCommunityPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
  });

  useEffect(() => {
    return () => {
        if (iconPreview) URL.revokeObjectURL(iconPreview);
        if (coverPreview) URL.revokeObjectURL(coverPreview);
    }
  }, [iconPreview, coverPreview]);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (iconPreview) {
          URL.revokeObjectURL(iconPreview);
      }
      const url = URL.createObjectURL(file);
      setIconPreview(url);
      form.setValue('icon', e.target.files);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (coverPreview) {
          URL.revokeObjectURL(coverPreview);
      }
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
      form.setValue('coverImage', e.target.files);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // TODO: Replace with your API call to create a community, now including description, icon, and coverImage.
    console.log('Form values:', values);
    
    // For this prototype, we'll just show a toast and redirect.
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
               <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your community"
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormDesc>A brief description of what your community is about.</FormDesc>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormLabel>Visuals</FormLabel>
                <FormDesc>Add an icon and cover image for your community.</FormDesc>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <FormItem>
                      <FormLabel className="text-sm font-normal">Community Icon</FormLabel>
                      <div className="flex items-center gap-4">
                          <Avatar className="h-20 w-20 border">
                            <AvatarImage src={iconPreview ?? undefined} alt="Icon preview" />
                            <AvatarFallback>
                                <Camera className="h-8 w-8 text-muted-foreground" />
                            </AvatarFallback>
                          </Avatar>
                          <Button type="button" variant="outline" onClick={() => iconInputRef.current?.click()}>
                            Upload
                          </Button>
                          <Input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            ref={iconInputRef}
                            onChange={handleIconChange}
                          />
                      </div>
                      <FormField
                          control={form.control} name="icon" render={() => <FormMessage />}
                      />
                    </FormItem>
                    <FormItem>
                      <FormLabel className="text-sm font-normal">Cover Photo</FormLabel>
                      <div
                        className="relative flex items-center justify-center h-20 w-full rounded-md border-2 border-dashed border-input bg-muted/50 cursor-pointer hover:border-primary transition-colors"
                        onClick={() => coverInputRef.current?.click()}
                      >
                        <Input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          ref={coverInputRef}
                          onChange={handleCoverChange}
                        />
                        {coverPreview ? (
                          <Image src={coverPreview} alt="Cover preview" fill className="object-cover rounded-md" />
                        ) : (
                          <div className="text-center text-muted-foreground p-2">
                            <ImageIcon className="mx-auto h-6 w-6" />
                            <p className="text-xs mt-1">Upload Cover</p>
                          </div>
                        )}
                      </div>
                      <FormField
                          control={form.control} name="coverImage" render={() => <FormMessage />}
                      />
                    </FormItem>
                </div>
              </div>
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
