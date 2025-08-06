'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MessageSquare, Edit, Lightbulb, Wrench, FileText, Calendar, Upload, Camera } from 'lucide-react';
import PostCard from '@/components/PostCard';
import { useEffect, useState } from 'react';
import type { Post, User, Idea, Proposal, Prototype } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { API_BASE_URL } from '@/lib/constants';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userIdeas, setUserIdeas] = useState<Idea[]>([]);
  const [userProposals, setUserProposals] = useState<Proposal[]>([]);
  const [userPrototypes, setUserPrototypes] = useState<Prototype[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    bio: '',
    avatarUrl: '',
  });
  
  // Get current user from auth context
  const { currentUser } = useAuth();
  
  // This user data will come from API call
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch profile data from API
  const fetchProfileData = async () => {
    if (!currentUser?.id) {
      setError('No user logged in');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching profile for user ID:', currentUser.id);
      const response = await axios.get(`${API_BASE_URL}/api/profile/${currentUser.id}/overview`, { 
        withCredentials: true 
      });
      
      console.log('API Response:', response.data);
      
      // Your API returns the data directly, not wrapped in a data object
      const apiData = response.data;

      // Verify we have user data
      if (!apiData || !apiData.user) {
        throw new Error('No user data in response');
      }

      // Set user data from API response
      setUser(apiData.user);
      setUserPosts(apiData.posts || []);
      setUserIdeas(apiData.ideas || []);
      setUserProposals(apiData.proposals || []);
      setUserPrototypes(apiData.prototypes || []);
      
      console.log('Profile data loaded successfully:', {
        user: apiData.user,
        postsCount: apiData.posts?.length || 0,
        ideasCount: apiData.ideas?.length || 0,
        proposalsCount: apiData.proposals?.length || 0,
        prototypesCount: apiData.prototypes?.length || 0
      });
      
    } catch (err) {
      console.error('Error fetching profile data:', err);
      if (axios.isAxiosError(err)) {
        setError(`API Error: ${err.response?.status} - ${err.response?.data?.message || err.message}`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered, currentUser:', currentUser);
    fetchProfileData();
  }, [currentUser?.id]);

  const handleEditProfile = () => {
    if (!user) return;
    setEditForm({
      name: user.name,
      email: user.email || '',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    try {
      // Here you would make an API call to update the profile
      // const response = await axios.put(`${API_BASE_URL}/api/profile/${currentUser.id}`, editForm, { withCredentials: true });
      
      // For now, just update local state
      setUser(prev => prev ? ({
        ...prev,
        name: editForm.name,
        email: editForm.email,
        bio: editForm.bio,
        avatarUrl: editForm.avatarUrl,
      }) : null);
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      // Handle error appropriately
    }
  };

  const handleAvatarUpload = () => {
    // In a real app, this would trigger a file upload dialog
    alert('Avatar upload functionality would be implemented here');
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-grow space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t pt-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-8 w-16 mx-auto" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-destructive mb-4">Error loading profile: {error}</p>
            <Button onClick={fetchProfileData} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show message if no user data
  if (!user) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No profile data found.</p>
            <Button onClick={fetchProfileData} variant="outline" className="mt-4">
              Retry Loading Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Header Card */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start gap-6">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              <AvatarImage src={user.avatarUrl ?? undefined} data-ai-hint="user avatar" />
              <AvatarFallback className="text-4xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Button 
              size="sm" 
              variant="secondary" 
              className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
              onClick={handleAvatarUpload}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-grow">
            <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
              <div>
                <CardTitle className="text-4xl">{user.name}</CardTitle>
                <CardDescription className="mt-2 text-lg">{user.email}</CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">
                    <Calendar className="h-3 w-3 mr-1" />
                    Joined {user.joinedAt ? formatDate(user.joinedAt) : "Unknown"}
                  </Badge>
                </div>
              </div>
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={handleEditProfile}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update your profile information and bio.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="avatarUrl" className="text-right">
                        Avatar URL
                      </Label>
                      <Input
                        id="avatarUrl"
                        value={editForm.avatarUrl}
                        onChange={(e) => setEditForm(prev => ({ ...prev, avatarUrl: e.target.value }))}
                        className="col-span-3"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="bio" className="text-right">
                        Bio
                      </Label>
                      <Textarea
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        className="col-span-3"
                        rows={4}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {user.bio || "No bio provided yet."}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-500 mr-1" />
                <p className="text-2xl font-bold">{user.stars}</p>
              </div>
              <p className="text-sm text-muted-foreground">Stars Earned</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-blue-500 mr-1" />
                <p className="text-2xl font-bold">{user.totalIdeas}</p>
              </div>
              <p className="text-sm text-muted-foreground">Ideas</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-500 mr-1" />
                <p className="text-2xl font-bold">{user.totalProposals}</p>
              </div>
              <p className="text-sm text-muted-foreground">Proposals</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Wrench className="h-5 w-5 text-purple-500 mr-1" />
                <p className="text-2xl font-bold">{user.totalPrototypes}</p>
              </div>
              <p className="text-sm text-muted-foreground">Prototypes</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Activity Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Activity & Contributions</CardTitle>
          <CardDescription>Your posts, ideas, proposals, and prototypes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="posts">Posts ({userPosts.length})</TabsTrigger>
              <TabsTrigger value="ideas">Ideas ({userIdeas.length})</TabsTrigger>
              <TabsTrigger value="proposals">Proposals ({userProposals.length})</TabsTrigger>
              <TabsTrigger value="prototypes">Prototypes ({userPrototypes.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="mt-6">
              {userPosts.length > 0 ? (
                <div className="space-y-6">
                  {userPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No posts yet. Start sharing your thoughts!</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="ideas" className="mt-6">
              {userIdeas.length > 0 ? (
                <div className="space-y-4">
                  {userIdeas.map(idea => (
                    <Card key={idea.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <h3 className="font-semibold text-lg mb-2">{idea.title}</h3>
                          <p className="text-muted-foreground mb-3 line-clamp-2">{idea.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{formatDate(idea.createdAt)}</span>
                            <Badge variant={idea.type === 'IDEATION' ? 'default' : 'secondary'}>
                              {idea.type === 'IDEATION' ? 'Ideation' : 'Solution Request'}
                            </Badge>
                            {idea.potentialDollarValue && (
                              <Badge variant="outline">
                                ${idea.potentialDollarValue.toLocaleString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No ideas yet. Share your innovative thoughts!</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="proposals" className="mt-6">
              {userProposals.length > 0 ? (
                <div className="space-y-4">
                  {userProposals.map(proposal => (
                    <Card key={proposal.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <h3 className="font-semibold text-lg mb-2">{proposal.title}</h3>
                          <p className="text-muted-foreground mb-3 line-clamp-2">{proposal.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{formatDate(proposal.createdAt)}</span>
                            <Badge variant={
                              proposal.status === 'ACCEPTED' ? 'default' : 
                              proposal.status === 'REJECTED' ? 'destructive' : 'secondary'
                            }>
                              {proposal.status}
                            </Badge>
                            {proposal.presentationUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={proposal.presentationUrl} target="_blank" rel="noopener noreferrer">
                                  View Presentation
                                </a>
                              </Button>
                            )}
                          </div>
                          {proposal.rejectionReason && (
                            <p className="text-sm text-destructive mt-2">Rejection reason: {proposal.rejectionReason}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No proposals yet. Start contributing solutions!</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="prototypes" className="mt-6">
              {userPrototypes.length > 0 ? (
                <div className="space-y-4">
                  {userPrototypes.map(prototype => (
                    <Card key={prototype.id} className="p-4">
                      <div className="flex items-start gap-4">
                        {prototype.imageUrl && (
                          <img 
                            src={prototype.imageUrl} 
                            alt={prototype.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-grow">
                          <h3 className="font-semibold text-lg mb-2">{prototype.title}</h3>
                          <p className="text-muted-foreground mb-3 line-clamp-2">{prototype.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span>{formatDate(prototype.createdAt)}</span>
                          </div>
                          {prototype.liveUrl && prototype.liveUrl.trim() !== "" && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={prototype.liveUrl} target="_blank" rel="noopener noreferrer">
                                View Live Demo
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No prototypes yet. Start building your ideas!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}