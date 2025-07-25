'use client';

import { posts as mockPosts, communities as mockCommunities, users as mockUsers } from '@/lib/mock-data';
import PostCard from '@/components/PostCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Post, Community, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      setFilteredPosts(mockPosts.filter(
        (post) =>
          post.status !== 'draft' &&
          (post.title.toLowerCase().includes(lowerCaseQuery) ||
          post.content.toLowerCase().includes(lowerCaseQuery))
      ));
      setFilteredCommunities(mockCommunities.filter(
        (community) =>
          community.name.toLowerCase().includes(lowerCaseQuery) ||
          community.slug.toLowerCase().includes(lowerCaseQuery)
      ));
      setFilteredUsers(mockUsers.filter((user) =>
        user.name.toLowerCase().includes(lowerCaseQuery)
      ));
    } else {
      setFilteredPosts([]);
      setFilteredCommunities([]);
      setFilteredUsers([]);
    }
    setLoading(false);
  }, [query]);

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
            <h2 className="text-2xl font-bold tracking-tight">Posts ({loading ? '...' : filteredPosts.length})</h2>
            <div className="grid gap-6">
              {loading ? (
                 Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
              ) : filteredPosts.length > 0 ? (
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
              <h2 className="text-2xl font-bold tracking-tight">Communities ({loading ? '...' : filteredCommunities.length})</h2>
              <Card>
                <CardContent className="p-4 space-y-4">
                  {loading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    ))
                  ) : filteredCommunities.length > 0 ? (
                    filteredCommunities.map((community) => (
                      <Link
                        key={community.id}
                        href={`/c/${community.slug}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                        legacyBehavior>
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
              <h2 className="text-2xl font-bold tracking-tight">Users ({loading ? '...' : filteredUsers.length})</h2>
              <Card>
                <CardContent className="p-4 space-y-4">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <Link
                        key={user.id}
                        href={`/profile`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                        legacyBehavior>
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
