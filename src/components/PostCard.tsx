import Link from 'next/link';
import { Post } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import VoteButtons from './VoteButtons';
import { MessageSquare } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  return (
    <Card className="hover:border-primary/50 transition-colors duration-300">
      <div className="flex">
        <div className="p-4">
          <VoteButtons initialVotes={post.votes} />
        </div>
        <div className="flex-grow">
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
            <CardTitle>
              <Link href={`/posts/${post.id}`} className="hover:text-primary transition-colors">
                {post.title}
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground line-clamp-2">{post.content}</p>
          </CardContent>
          <CardFooter>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{post.comments.length} Comments</span>
              </div>
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
