
import { ideas } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';
import VoteButtons from '@/components/VoteButtons';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import CommentCard from '@/components/CommentCard';

export default async function PrototypeDetailsPage({ params }: { params: { id: string, protoId: string } }) {
  const idea = ideas.find((p) => p.id === params.id);
  const prototype = idea?.prototypes.find((p) => p.id === params.protoId);

  if (!idea || !prototype) {
    notFound();
  }

  const prototypeComments = prototype.comments || [];
  const teamMembers = prototype.team || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="mb-4">
            <Button variant="ghost" asChild>
                <Link href={`/ideation/${idea.id}#prototypes`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Idea
                </Link>
            </Button>
        </div>

      <Card>
        <CardHeader>
          <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-4">
            <Image src={prototype.imageUrl} alt={prototype.title} fill className="object-cover" data-ai-hint="prototype screenshot" />
          </div>
          <CardTitle className="text-3xl">{prototype.title}</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Avatar className="h-5 w-5">
                <AvatarImage src={prototype.author.avatarUrl} data-ai-hint="user avatar" />
                <AvatarFallback>{prototype.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>Built by {prototype.author.name}</span>
              <span>•</span>
              <span>{prototype.createdAt}</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{prototype.description}</p>
        </CardContent>
        <CardFooter className="justify-between">
          <VoteButtons initialVotes={prototype.votes} />
          {prototype.liveUrl && <Button asChild><Link href={prototype.liveUrl} target="_blank">View Live</Link></Button>}
        </CardFooter>
      </Card>

       {teamMembers.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Users className="h-5 w-5" /> Team Members</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
                {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatarUrl} data-ai-hint="user avatar" />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{member.name}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
      )}


      <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">{prototypeComments.length} Comments</h2>
          <Separator />
          {prototypeComments.length > 0 ? (
            <div className="space-y-6 mt-6">
              {prototypeComments.map((comment) => (
                <CommentCard 
                  key={comment.id} 
                  comment={comment}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground mt-6 text-center">No comments on this prototype yet.</p>
          )}
      </div>
    </div>
  );
}
