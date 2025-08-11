
'use client';

import Link from 'next/link';
import { Ghost, Plus, Trophy, User, LogOut, Settings, Users, Search, Bell, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import React, { type FormEvent, useEffect, useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { notifications, conversations } from '@/lib/mock-data';
import { ThemeToggle } from './ThemeToggle';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
}

const Header = ({ showSidebar = true, setIsChatOpen }: { showSidebar?: boolean, setIsChatOpen: (open: boolean) => void }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultSearch = searchParams.get('q') ?? '';
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isHackathonSection = pathname.startsWith('/hackathons');
  const isIdeationSection = pathname.startsWith('/ideation') || pathname === '/leaderboard';
  const isDashboardPage = pathname === '/dashboard';

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/profile/me`, { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);
  
  const unreadNotificationCount = notifications.filter(n => !n.read).length;
  const unreadMessagesCount = conversations.filter(c => !c.lastMessage.read && c.lastMessage.senderId !== 'user-1').length;

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get('search') as string;
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/feed');
    }
  };

  return (
    <>
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 gap-4 px-4">
          <div className="flex items-center gap-2">
            {showSidebar && <SidebarTrigger />}
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-primary font-bold text-lg">
              <Ghost className="h-6 w-6" />
              <span className="hidden sm:inline">thread overflow</span>
            </Link>
          </div>
          
          <div className="flex-1 max-w-lg mx-4">
            {!isDashboardPage && !isIdeationSection && !isHackathonSection && (
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  name="search"
                  type="search"
                  placeholder="Search..."
                  className="pl-10 w-full"
                  defaultValue={defaultSearch}
                  key={defaultSearch}
                />
              </form>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <>
              {!isHackathonSection && !isIdeationSection && !isDashboardPage && (
                <Button asChild className="hidden md:inline-flex">
                  <Link href="/posts/new">
                    <Plus className="mr-2" />
                    New Post
                  </Link>
                </Button>
              )}

              {isIdeationSection && (
                  <div className="hidden md:flex gap-2">
                      <Button asChild variant="outline">
                          <Link href="/leaderboard">
                              <Trophy className="mr-2" />
                              Leaderboard
                          </Link>
                      </Button>
                  </div>
              )}
            </>
            
            <Button variant="ghost" className="relative h-10 w-10 rounded-full" onClick={() => setIsChatOpen(true)}>
                <MessageSquare className="h-6 w-6" />
                {unreadMessagesCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Bell className="h-6 w-6" />
                    {unreadNotificationCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                    )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length > 0 ? (
                      notifications.map(notification => (
                          <DropdownMenuItem key={notification.id} asChild className={cn(!notification.read && 'font-bold')}>
                            <Link href={notification.href} className="flex gap-3">
                                <div className="w-full">
                                    <p className="text-sm leading-snug whitespace-normal">{notification.text}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{notification.createdAt}</p>
                                </div>
                                {!notification.read && <div className="self-center h-2 w-2 rounded-full bg-primary shrink-0"></div>}
                            </Link>
                          </DropdownMenuItem>
                      ))
                  ) : (
                      <DropdownMenuItem disabled>You have no new notifications.</DropdownMenuItem>
                  )}
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatarUrl || "https://placehold.co/40x40.png"} alt={user?.name || 'User'} data-ai-hint="user avatar" />
                    <AvatarFallback>{(user?.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    {loading ? (
                      <>
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                        <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email || ''}</p>
                      </>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!isHackathonSection && !isIdeationSection && !isDashboardPage &&(
                  <DropdownMenuItem asChild className="md:hidden">
                    <Link href="/posts/new">
                      <span className="flex items-center">
                        <Plus className="mr-2" />New Post
                      </span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/c/new">
                    <span className="flex items-center">
                      <Users className="mr-2" />Create Community
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/leaderboard">
                    <span className="flex items-center">
                      <Trophy className="mr-2" />Leaderboard
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <span className="flex items-center">
                      <User className="mr-2" />Profile
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem><Settings className="mr-2" />Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/login">
                    <span className="flex items-center">
                      <LogOut className="mr-2" />Log out
                    </span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
