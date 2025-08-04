'use client';

import { useState } from 'react';
import type { Prototype } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import VoteButtons from './VoteButtons';
import CommentCard from './CommentCard';
import { MessageCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PrototypeCardProps {
    prototype: Prototype;
    onCommentAdded?: () => void;
}

const PrototypeCard = ({ prototype, onCommentAdded }: PrototypeCardProps) => {
    const [showComments, setShowComments] = useState(false);
    const [showAddComment, setShowAddComment] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { currentUser } = useAuth();

    const commentCount = prototype.comments?.length || 0;

    const handleSubmitComment = async () => {
        if (!commentContent.trim() || !currentUser) return;

        setIsSubmitting(true);
        try {
            await axios.post(`${API_BASE_URL}/api/comments/${prototype.id}/prototype`, {
                content: commentContent
            }, { withCredentials: true });

            setCommentContent('');
            setShowAddComment(false);
            onCommentAdded?.();
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleComments = () => {
        setShowComments(!showComments);
    };

    return (
        <Card className="h-full hover:border-primary/50 transition-colors">
            <div className="relative aspect-video w-full rounded-t-lg overflow-hidden">
                <Image src={prototype.imageUrl} alt={prototype.title} fill className="object-cover" data-ai-hint="prototype screenshot" />
            </div>

            <CardHeader>
                <CardTitle className="text-lg">{prototype.title}</CardTitle>
                <CardDescription>
                    by {prototype.author.name}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{prototype.description}</p>

                {prototype.liveUrl && (
                    <Button asChild variant="outline" size="sm" className="w-full mb-4">
                        <a href={prototype.liveUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Live Demo
                        </a>
                    </Button>
                )}

                {/* Comments Section */}
                <div className="mt-4">
                    <div className="flex items-center justify-between border-t border-muted pt-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleComments}
                            className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                        >
                            <MessageCircle className="h-4 w-4" />
                            <span className="font-medium">{commentCount}</span>
                            <span>{commentCount === 1 ? 'comment' : 'comments'}</span>
                            {showComments ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>

                        {currentUser && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAddComment(!showAddComment)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Add Comment
                            </Button>
                        )}
                    </div>

                    {showAddComment && currentUser && (
                        <div className="mt-3 p-3 bg-muted/30 rounded-lg space-y-2">
                            <Textarea
                                placeholder="Share your thoughts on this prototype..."
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                className="min-h-[80px] resize-none"
                            />
                            <div className="flex space-x-2">
                                <Button
                                    size="sm"
                                    onClick={handleSubmitComment}
                                    disabled={isSubmitting || !commentContent.trim()}
                                >
                                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setShowAddComment(false);
                                        setCommentContent('');
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {showComments && (
                        <div className="mt-3 space-y-3">
                            {prototype.comments && prototype.comments.length > 0 ? (
                                prototype.comments.map((comment) => (
                                    <CommentCard
                                        key={comment.id}
                                        comment={comment}
                                        prototypeId={prototype.id}
                                        onCommentAdded={onCommentAdded}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-4 text-muted-foreground text-sm">
                                    No comments yet. Be the first to share your thoughts!
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="flex justify-between items-center">
                <VoteButtons initialVotes={prototype.votes} />
                <div className="flex -space-x-2 overflow-hidden">
                    <TooltipProvider>
                        {prototype.team?.map((member, idx) => (
                            <Tooltip key={member.id || idx}>
                                <TooltipTrigger>
                                    <Avatar className="h-8 w-8 border-2 border-background">
                                        <AvatarImage src={member.avatarUrl || ''} data-ai-hint="user avatar" />
                                        <AvatarFallback>{member.name?.charAt(0) || '?'}</AvatarFallback>
                                    </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {member.name}
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </TooltipProvider>
                </div>
            </CardFooter>
        </Card>
    );
};

export default PrototypeCard; 