
import { ideas, comments } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import VoteButtons from '@/components/VoteButtons';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import CommentCard from '@/components/CommentCard';

export default async function SubIdeaDetailsPage({ params }: { params: { id: string, ideaId: string } }) {
  const idea = ideas.find((p) => p.id === params.id);
  const subIdea = idea?.subIdeas.find((p) => p.id === params.ideaId);

  if (!idea || !subIdea) {
    notFound();
  }
  
  // Using mock comments for demonstration
  const ideaComments = comments.slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-[64px_1fr] gap-4">
      <div className="flex justify-center">
           <VoteButtons initialVotes={subIdea.votes} />
       </div>
      <div>
        <div className="mb-4">
            <Button variant="ghost" asChild>
                <Link href={`/ideation/${idea.id}`} legacyBehavior>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Project
                </Link>
            </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{subIdea.title}</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={subIdea.author.avatarUrl} data-ai-hint="user avatar" />
                  <AvatarFallback>{subIdea.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>Posted by {subIdea.author.name}</span>
                <span>•</span>
                <span>{subIdea.createdAt}</span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{subIdea.description}</p>
          </CardContent>
        </Card>

        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">{ideaComments.length} Comments</h2>
            <Separator />
            <div className="space-y-6 mt-6">
                {ideaComments.map((comment) => (
                    <CommentCard 
                        key={comment.id} 
                        comment={comment}
                    />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}

