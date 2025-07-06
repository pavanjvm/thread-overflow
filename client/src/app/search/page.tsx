import { posts, communities, users } from '@/lib/mock-data';
import PostCard from '@/components/PostCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Star } from 'lucide-react';

export default function SearchPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const query = typeof searchParams?.q === 'string' ? searchParams.q : '';

  const filteredPosts = query
    ? posts.filter(
        (post) =>
          post.status !== 'draft' &&
          (post.title.toLowerCase().includes(query.toLowerCase()) ||
          post.content.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const filteredCommunities = query
    ? communities.filter(
        (community) =>
          community.name.toLowerCase().includes(query.toLowerCase()) ||
          community.slug.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredUsers = query
    ? users.filter((user) =>
        user.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Search Results</CardTitle>
          {query ? (
            <CardDescription>
              Showing results for: <span className="font-bold text-foreground">"{query}"</span>
            </CardDescription>
          ) : (
            <CardDescription>
              Please enter a search term in the bar above to find posts, communities, and users.
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      {query && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Posts ({filteredPosts.length})</h2>
            <div className="grid gap-6">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <p className="text-muted-foreground">No posts found matching your search.</p>
              )}
            </div>
          </div>
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">Communities ({filteredCommunities.length})</h2>
              <Card>
                <CardContent className="p-4 space-y-4">
                  {filteredCommunities.length > 0 ? (
                    filteredCommunities.map((community) => (
                      <Link key={community.id} href={`/c/${community.slug}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={community.iconUrl} data-ai-hint="community icon" />
                          <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">c/{community.slug}</p>
                          <p className="text-sm text-muted-foreground">{community.name}</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-muted-foreground p-2">No communities found.</p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">Users ({filteredUsers.length})</h2>
              <Card>
                <CardContent className="p-4 space-y-4">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <Link key={user.id} href={`/profile`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatarUrl} data-ai-hint="user avatar" />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{user.name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-4 w-4 fill-current text-primary" />
                            <span>{user.stars}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-muted-foreground p-2">No users found.</p>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
