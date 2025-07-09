'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

export default function ApplyDialog() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real app, you would handle form data submission here.
    toast({
      title: "Application Submitted!",
      description: "Your idea has been submitted for review. Good luck!",
    });
    // Here you would likely close the dialog, which can be handled by controlling the `open` state.
    // For this prototype, we'll just show the toast.
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg">Apply Now</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Apply to the Hackathon</DialogTitle>
            <DialogDescription>
              Submit your idea and an optional presentation to enter. Your application will be reviewed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label htmlFor="idea">Your Idea / Concept</Label>
              <Textarea
                id="idea"
                placeholder="Describe your project idea in a few paragraphs."
                className="min-h-32"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="presentation">Presentation (PPT, PDF, etc.)</Label>
              <div className="relative">
                <Input id="presentation" type="file" className="pl-12" />
                <Upload className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                An optional presentation or pitch deck can strengthen your application.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Submit Application</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
