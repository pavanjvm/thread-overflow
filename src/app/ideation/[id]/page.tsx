
'use client';

import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Wrench, FileText, Info, CircleDollarSign, Lock, Trash2 } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import SubIdeaCard from '@/components/SubIdeaCard';
import ProposalCard from '@/components/ProposalCard';
import PrototypeCard from '@/components/PrototypeCard';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import VoteButtons from '@/components/VoteButtons';
import { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import type { Idea, SubIdea, Proposal, Prototype } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const typeConfig = {
  'IDEATION': { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
  'SOLUTION_REQUEST': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
  default: { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300' },
};


export default function IdeaDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('ideas');
  const [idea, setIdea] = useState<Idea | null>(null);
  const [ideaSubmissions, setIdeaSubmissions] = useState<SubIdea[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchIdeaData = async () => {
    try {
      const [ideaRes, subIdeasRes, proposalsRes, prototypesRes] = await Promise.all([
        axios.get<Idea>(`${API_BASE_URL}/api/ideas/${id}`, { withCredentials: true }),
        axios.get<SubIdea[]>(`${API_BASE_URL}/api/subidea/${id}/subideas`, { withCredentials: true }),
        axios.get<Proposal[]>(`${API_BASE_URL}/api/proposals/${id}/proposals`, { withCredentials: true }),
        axios.get<Prototype[]>(`${API_BASE_URL}/api/prototypes/${id}/prototypes`, { withCredentials: true }),
      ]);

      setIdea(ideaRes.data);
      setProposals(proposalsRes.data || []);

      // Map team to array of User objects if needed
      setPrototypes((prototypesRes.data || []).map(proto => ({
        ...proto,
        team: proto.team?.map((member: any) => member.user || member) || []
      })));

      // Fetch comments for each SubIdea
      const subIdeasWithComments = await Promise.all(
        (subIdeasRes.data || []).map(async (subIdea) => {
          try {
            const commentsRes = await axios.get(`${API_BASE_URL}/api/comments/${subIdea.id}`, { withCredentials: true });
            return {
              ...subIdea,
              comments: commentsRes.data.comments || []
            };
          } catch (error) {
            console.error(`Error fetching comments for SubIdea ${subIdea.id}:`, error);
            return {
              ...subIdea,
              comments: []
            };
          }
        })
      );

      // Fetch comments for each Prototype
      const prototypesWithComments = await Promise.all(
        (prototypesRes.data || []).map(async (proto) => {
          try {
            const commentsRes = await axios.get(`${API_BASE_URL}/api/comments/${proto.id}/prototype`, { withCredentials: true });
            return {
              ...proto,
              team: proto.team?.map((member: any) => member.user || member) || [],
              comments: commentsRes.data.comments || []
            };
          } catch (error) {
            console.error(`Error fetching comments for Prototype ${proto.id}:`, error);
            return {
              ...proto,
              team: proto.team?.map((member: any) => member.user || member) || [],
              comments: []
            };
          }
        })
      );

      setIdeaSubmissions(subIdeasWithComments);
      setPrototypes(prototypesWithComments);
    } catch (error) {
      console.error('Error fetching idea data:', error);
      notFound();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchIdeaData();
    }
  }, [id]);

  const acceptedProposal = currentUser ? proposals.find(p => String(p.authorId) === String(currentUser.id) && p.status?.trim().toUpperCase() === 'ACCEPTED') : undefined;

  const handleCloseIdea = async () => {
    if (!idea) return;

    setIsClosing(true);
    try {
      await axios.patch(`${API_BASE_URL}/api/ideas/${idea.id}/close`, {}, { withCredentials: true });

      // Update the idea status locally
      setIdea(prev => prev ? { ...prev, status: 'CLOSED' } : null);

      toast({
        title: "Idea Closed",
        description: "The idea has been successfully closed.",
      });

      setShowCloseDialog(false);
    } catch (error: any) {
      console.error('Error closing idea:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to close the idea.",
        variant: "destructive",
      });
    } finally {
      setIsClosing(false);
    }
  };

  const handleDeleteIdea = async () => {
    if (!idea) return;

    setIsDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/ideas/${idea.id}`, { withCredentials: true });

      toast({
        title: "Idea Deleted",
        description: "The idea has been successfully deleted.",
      });

      // Redirect to ideation page
      window.location.href = '/ideation';
    } catch (error: any) {
      console.error('Error deleting idea:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete the idea.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/h-full" />
        </header>
        <Tabs defaultValue="ideas" className="w-full">
          <TabsList>
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </TabsList>
        </Tabs>
      </div>
    );
  }

  if (!idea) {
    notFound();
  }

  const config = typeConfig[idea.type] || typeConfig.default;
  const isProjectOwner = currentUser?.id === idea.authorId;

  const renderActionButton = () => {
    switch (activeTab) {
      case 'ideas':
        return (
          <Button asChild>
            <Link href={`/ideation/${id}/submit-idea`}>
              <span>
                <Lightbulb className="mr-2 h-4 w-4" /> Share Your Thoughts
              </span>
            </Link>
          </Button>
        );
      case 'proposals':
        return (
          <Button asChild>
            <Link href={`/ideation/${id}/submit-proposal`}>
              <span>
                <FileText className="mr-2 h-4 w-4" /> Submit Proposal
              </span>
            </Link>
          </Button>
        );
      case 'prototypes':
        return acceptedProposal ? (
          <Button asChild>
            <Link href={`/ideation/${id}/build-prototype?proposalId=${acceptedProposal.id}`}>
              <span>
                <Wrench className="mr-2 h-4 w-4" /> Build a Prototype
              </span>
            </Link>
          </Button>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div>
              <Badge
                variant={config.variant}
                className={cn('mb-2', config.className)}
              >
                {idea.type}
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">{idea.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={idea.author.avatarUrl || ''} data-ai-hint="user avatar" />
                  <AvatarFallback>{idea.author?.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <span>Posted by {idea.author.name}</span>
                <span>•</span>
                <span>{formatRelativeTime(idea.createdAt)}</span>
              </div>
            </div>
            <p className="text-lg text-muted-foreground mt-4">{idea.description}</p>
            {idea.potentialDollarValue && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mt-4">
                <CircleDollarSign className="h-5 w-5" />
                <span className="font-semibold text-lg">
                  ${idea.potentialDollarValue.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">Potential Value</span>
              </div>
            )}
          </div>

          {/* Status and Actions */}
          <div className="flex flex-col items-end gap-3 ml-6">
            {/* Status Badge */}
            <Badge
              variant={idea.status === 'OPEN' ? 'default' : 'secondary'}
              className={cn(
                'text-sm font-medium',
                idea.status === 'OPEN'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
              )}
            >
              {idea.status === 'OPEN' ? 'Open' : 'Closed'}
            </Badge>

            {/* Action Buttons - Only show for idea owner */}
            {isProjectOwner && (
              <div className="flex gap-2">
                {idea.status === 'OPEN' && (
                  <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                        <Lock className="h-4 w-4 mr-1" />
                        Close
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Close Idea</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to close this idea? Once closed, no new submissions will be accepted.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCloseDialog(false)} disabled={isClosing}>
                          Cancel
                        </Button>
                        <Button onClick={handleCloseIdea} disabled={isClosing} className="bg-orange-600 hover:bg-orange-700">
                          {isClosing ? 'Closing...' : 'Close Idea'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Idea</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this idea? This action cannot be undone and will permanently remove the idea and all associated content.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
                        Cancel
                      </Button>
                      <Button onClick={handleDeleteIdea} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                        {isDeleting ? 'Deleting...' : 'Delete Idea'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </header>
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="ideas">Ideas and Suggestions ({ideaSubmissions.length})</TabsTrigger>
            <TabsTrigger value="proposals">Proposals ({proposals.length})</TabsTrigger>
            <TabsTrigger value="prototypes">Prototypes ({prototypes.length})</TabsTrigger>
          </TabsList>
          {renderActionButton()}
        </div>
        <div className="py-6">
          <TabsContent value="ideas" className="space-y-6">
            <div className="space-y-6">
              {ideaSubmissions.length > 0 ? (
                ideaSubmissions.map((subIdea) => (
                  <SubIdeaCard
                    key={subIdea.id}
                    subIdea={subIdea}
                    onCommentAdded={() => {
                      // Refresh the data when a comment is added
                      fetchIdeaData();
                    }}
                  />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No ideas submitted yet. Be the first!</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="proposals" className="space-y-6">
            <div className="space-y-6 mt-6">
              {proposals.length > 0 ? (
                proposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    isProjectOwner={isProjectOwner}
                  />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No proposals submitted yet.</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="prototypes">
            <div className="space-y-6">
              {activeTab === 'prototypes' && !acceptedProposal ? (
                <Card className="bg-muted/50 w-full">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Info className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      You must have an accepted proposal to build a prototype. <Link href={`/ideation/${id}/submit-proposal`} className="text-primary hover:underline font-medium">Submit a proposal</Link> to get started.
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {prototypes.length > 0 ? (
                  prototypes.map((proto) => (
                    <PrototypeCard
                      key={proto.id}
                      prototype={proto}
                      onCommentAdded={() => {
                        fetchIdeaData();
                      }}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8 col-span-full">No prototypes submitted yet.</p>
                )}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
