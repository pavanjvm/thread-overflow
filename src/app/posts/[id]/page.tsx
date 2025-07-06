import { posts } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import VoteButtons from '@/components/VoteButtons';
import CommentCard from '@/components/CommentCard';
import { Separator } from '@/components/ui/separator';

export default function PostPage({ params }: { params: { id: string } }) {
  const post = posts.find((p) => p.id === params.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-[64px_1fr] gap-4">
      <div className="flex justify-center">
        <VoteButtons initialVotes={post.votes} />
      </div>
      <div>
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.author.avatarUrl} data-ai-hint="user avatar" />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>Posted by {post.author.name}</span>
              <span>•</span>
              <span>{post.createdAt}</span>
            </div>
            <CardTitle className="text-3xl">{post.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <p>{post.content}</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">{post.comments.length} Comments</h2>
          <Separator />
          <div className="space-y-6 mt-6">
            {post.comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
