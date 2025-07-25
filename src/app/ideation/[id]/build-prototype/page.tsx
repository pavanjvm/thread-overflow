
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
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Wrench, X, UserPlus } from 'lucide-react';
import { ideas, users } from '@/lib/mock-data';
import { useEffect, useState, useMemo } from 'react';
import type { Idea, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Combobox } from '@/components/ui/combobox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters.').max(1000),
  imageUrl: z.string().url('Please enter a valid image URL.').optional().or(z.literal('')),
  liveUrl: z.string().url('Please enter a valid live URL.').optional().or(z.literal('')),
  team: z.array(z.string()).optional(),
});


export default function BuildPrototypePage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [idea, setIdea] = useState<Idea | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
      liveUrl: '',
      team: [],
    },
  });

  const availableUsersForTeam = useMemo(() => {
    return users
      .filter(u => !teamMembers.some(tm => tm.id === u.id))
      .map(u => ({ label: u.name, value: u.id }));
  }, [teamMembers]);

  const handleAddTeamMember = (userId: string) => {
    if (!userId) return;
    const userToAdd = users.find(u => u.id === userId);
    if (userToAdd && !teamMembers.some(tm => tm.id === userToAdd.id)) {
      const newTeamMembers = [...teamMembers, userToAdd];
      setTeamMembers(newTeamMembers);
      form.setValue('team', newTeamMembers.map(u => u.id));
    }
  }

  const handleRemoveTeamMember = (userId: string) => {
    const newTeamMembers = teamMembers.filter(u => u.id !== userId);
    setTeamMembers(newTeamMembers);
    form.setValue('team', newTeamMembers.map(u => u.id));
  }
  
  useEffect(() => {
    const foundIdea = ideas.find(p => p.id === id);
    if (foundIdea) {
      setIdea(foundIdea);
    } else {
        console.error("Idea not found");
    }
  }, [id]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // TODO: Replace with your API call to submit a prototype for the project.
    console.log('Submitting prototype for idea', id, values);

    toast({
      title: 'Prototype Submitted!',
      description: `Your prototype "${values.title}" has been successfully submitted.`,
    });
    router.push(`/ideation/${id}`);
  };
  
  if (!idea) {
      return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-4">
                <Skeleton className="h-8 w-48" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        </div>
      );
  }

  return (
    <div className="max-w-2xl mx-auto">
        <div className="mb-4">
            <Button variant="ghost" asChild>
                <Link href={`/ideation/${id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Idea
                </Link>
            </Button>
        </div>
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="flex items-center"><Wrench className="mr-2 h-6 w-6 text-yellow-500" />Build a Prototype</CardTitle>
              <CardDescription>
                You are building a prototype for the idea: <span className="font-semibold text-foreground">{idea.title}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prototype Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Working Model v1" {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your prototype. What does it do? How does it solve the problem?"
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://placehold.co/600x400.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="liveUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Live URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/live-demo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Team Members</FormLabel>
                <FormControl>
                    <div>
                        <Combobox 
                            options={availableUsersForTeam}
                            onChange={(value) => handleAddTeamMember(value)}
                            value=""
                            placeholder="Add a team member..."
                            searchPlaceholder="Search for a user..."
                            emptyText="No users found or all added."
                        />
                        <div className="mt-3 space-y-2">
                            {teamMembers.map(user => (
                                <Badge key={user.id} variant="secondary" className="p-2 text-sm font-normal flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-5 w-5">
                                            <AvatarImage src={user.avatarUrl} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {user.name}
                                    </div>
                                    <button type="button" onClick={() => handleRemoveTeamMember(user.id)} className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Submitting...' : 'Submit Prototype'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
