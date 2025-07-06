'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ArrowLeft } from 'lucide-react';
import { conversations } from '@/lib/mock-data';
import type { Conversation, ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';

// Assume current user is user-1 (Alice)
const currentUserId = 'user-1';

export default function ChatPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void; }) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedConversation) {
      console.log(`Sending message to ${selectedConversation.participant.name}: ${message}`);
      // In a real app, you'd update state and call an API here.
      setMessage('');
    }
  };

  const ConversationList = () => (
    <div className="flex flex-col h-full">
        <SheetHeader className="p-4 border-b">
            <SheetTitle>Messages</SheetTitle>
            <SheetDescription>Your recent conversations.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1">
            <div className="p-2">
            {conversations.map(convo => (
                <button
                key={convo.id}
                className="w-full text-left p-3 flex items-center gap-4 rounded-lg hover:bg-accent transition-colors"
                onClick={() => setSelectedConversation(convo)}
                >
                <Avatar>
                    <AvatarImage src={convo.participant.avatarUrl} data-ai-hint="user avatar" />
                    <AvatarFallback>{convo.participant.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <p className="font-semibold truncate">{convo.participant.name}</p>
                    <p className={cn("text-sm truncate", convo.lastMessage.read || convo.lastMessage.senderId === currentUserId ? 'text-muted-foreground' : 'text-foreground font-bold')}>
                        {convo.lastMessage.content}
                    </p>
                </div>
                {!convo.lastMessage.read && convo.lastMessage.senderId !== currentUserId && (
                    <div className="h-2 w-2 rounded-full bg-primary self-start mt-2"></div>
                )}
                </button>
            ))}
            </div>
        </ScrollArea>
    </div>
  );

  const ConversationView = ({ conversation }: { conversation: Conversation }) => (
    <div className="flex flex-col h-full">
        <SheetHeader className="p-4 border-b flex flex-row items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedConversation(null)}>
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-9 w-9">
                <AvatarImage src={conversation.participant.avatarUrl} data-ai-hint="user avatar" />
                <AvatarFallback>{conversation.participant.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <SheetTitle className="text-base">{conversation.participant.name}</SheetTitle>
            </div>
        </SheetHeader>
        <ScrollArea className="flex-1 bg-muted/20">
            <div className="p-4 space-y-4">
                {conversation.messages.map(msg => (
                <div
                    key={msg.id}
                    className={cn(
                    'flex items-end gap-2',
                    msg.senderId === currentUserId ? 'justify-end' : 'justify-start'
                    )}
                >
                    {msg.senderId !== currentUserId && (
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={conversation.participant.avatarUrl} data-ai-hint="user avatar" />
                            <AvatarFallback>{conversation.participant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                    <div
                    className={cn(
                        'max-w-[75%] rounded-lg px-3 py-2 text-sm',
                        msg.senderId === currentUserId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card'
                    )}
                    >
                    {msg.content}
                    </div>
                </div>
                ))}
            </div>
        </ScrollArea>
        <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <Button type="submit" size="icon" className="shrink-0">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-0 w-[400px] sm:max-w-md">
        {selectedConversation ? (
          <ConversationView conversation={selectedConversation} />
        ) : (
          <ConversationList />
        )}
      </SheetContent>
    </Sheet>
  );
}
