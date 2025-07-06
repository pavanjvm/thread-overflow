import { posts } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import PostView from '@/components/PostView';

export default function PostPage({ params }: { params: { id: string } }) {
  const post = posts.find((p) => p.id === params.id);

  if (!post) {
    notFound();
  }

  return <PostView post={post} />;
}
