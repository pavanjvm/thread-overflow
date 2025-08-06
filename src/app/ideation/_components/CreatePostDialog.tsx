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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

const formSchema = z.object({
  type: z.enum(['IDEATION', 'SOLUTION_REQUEST'], { required_error: 'You must select a post type.' }),
  title: z.string().min(10, 'Title must be at least 10 characters long.').max(100, "Title can't be longer than 100 characters."),
  description: z.string().min(50, 'Description must be at least 50 characters long.').max(2000, "Description can't be longer than 2000 characters."),
  potentialBenefits: z.array(z.string()).min(1, 'Select at least one benefit'),
});

interface CreatePostDialogProps {
  onSuccess?: () => void;
}

export default function CreatePostDialog({ onSuccess }: CreatePostDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [customTag, setCustomTag] = useState('');
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      potentialBenefits: [],
    },
  });

  const postType = form.watch('type');

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    const handleScroll = () => {
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const isAtBottom = scrollHeight - scrollTop <= clientHeight + 5;
        setShowScrollIndicator(!isAtBottom && scrollHeight > clientHeight);
      }
    };

    const handleResize = () => {
      handleScroll();
    };

    const timeoutId = setTimeout(() => {
      if (scrollContainer) {
        handleScroll();
        scrollContainer.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
      }
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [dialogKey, postType]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(`${API_BASE_URL}/api/ideas`, values, { withCredentials: true });

      toast({
        title: `${postType === 'IDEATION' ? 'Idea' : 'Solution Request'} Submitted!`,
        description: `Your post "${values.title}" has been submitted.`,
      });
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting post:', error);
      toast({
        title: 'Submission Failed',
        description: error.response?.data?.error || 'An error occurred while submitting your post.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setDialogKey(prev => prev + 1);
    } else {
      form.reset();
      setCustomTag('');
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>+ Create a Post</Button>
      </DialogTrigger>
      <DialogContent 
        key={dialogKey} 
        className="sm:max-w-2xl w-[95vw] max-h-[90vh] flex flex-col relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
            <DialogHeader className="flex-shrink-0 pb-4">
              <DialogTitle>Create a New Post</DialogTitle>
              <DialogDescription>
                Share an idea or request a solution from the community.
              </DialogDescription>
            </DialogHeader>
            
            <div 
              ref={scrollContainerRef} 
              className="flex-grow overflow-y-auto px-6 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Post Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="IDEATION" />
                            </FormControl>
                            <FormLabel className="font-normal">Idea</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="SOLUTION_REQUEST" />
                            </FormControl>
                            <FormLabel className="font-normal">Solution Request</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {postType && (
                  <>
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={`e.g., A better way to ${postType === 'IDEATION' ? 'build something' : 'solve a problem'}`} 
                              {...field} 
                            />
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
                          <FormLabel>{postType === 'IDEATION' ? 'Idea Description' : 'Problem Description'}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={postType === 'IDEATION' ? 'Describe the idea in detail...' : 'Describe the problem in detail...'}
                              className="min-h-48 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="potentialBenefits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Potential Benefits</FormLabel>
                          <FormControl>
                            <div>
                              <div className="flex flex-wrap gap-2">
                                {['developer-productivity', 'cost-savings', 'time-savings'].map(tag => (
                                  <label key={tag} className="flex items-center space-x-1">
                                    <input
                                      type="checkbox"
                                      value={tag}
                                      checked={field.value?.includes(tag)}
                                      onChange={e => {
                                        const checked = e.target.checked;
                                        if (checked) {
                                          field.onChange([...(field.value || []), tag]);
                                        } else {
                                          field.onChange((field.value || []).filter(t => t !== tag));
                                        }
                                      }}
                                    />
                                    <span className="text-sm capitalize">{tag.replace('-', ' ')}</span>
                                  </label>
                                ))}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Input
                                  placeholder="Add custom tag"
                                  value={customTag}
                                  onChange={e => setCustomTag(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter' && customTag.trim()) {
                                      e.preventDefault();
                                      if (!(field.value || []).includes(customTag.trim())) {
                                        field.onChange([...(field.value || []), customTag.trim()]);
                                      }
                                      setCustomTag('');
                                    }
                                  }}
                                />
                                <Button 
                                  type="button" 
                                  size="icon" 
                                  variant="outline" 
                                  onClick={() => {
                                    if (customTag.trim() && !(field.value || []).includes(customTag.trim())) {
                                      field.onChange([...(field.value || []), customTag.trim()]);
                                      setCustomTag('');
                                    }
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              {(field.value || []).length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {(field.value || []).map(tag => (
                                    <Badge 
                                      key={tag} 
                                      variant="outline" 
                                      className="text-sm font-normal cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                      onClick={() => {
                                        field.onChange((field.value || []).filter(t => t !== tag));
                                      }}
                                    >
                                      {tag} ×
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </div>
            
            <DialogFooter className="flex-shrink-0 pt-4 border-t bg-background">
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting || !postType}
                className="w-full sm:w-auto"
              >
                {form.formState.isSubmitting ? 'Submitting...' : `Submit ${postType === 'IDEATION' ? 'Idea' : 'Request'}`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        
        {showScrollIndicator && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none z-10">
            <ChevronDown className="h-6 w-6 text-muted-foreground animate-bounce" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}