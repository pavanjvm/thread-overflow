'use client';

import Link from 'next/link';
import { Ghost, Plus, Trophy, User, LogOut, Settings, Users, Search } from 'lucide-react';
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
import type { FormEvent } from 'react';
import React from 'react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const Header = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const defaultSearch = searchParams.get('q') ?? '';

  const { mounted } = useSidebar();

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
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="flex items-center justify-between h-16 gap-4 px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className={cn(!mounted && 'invisible')} />
          <Link href="/feed" className="flex items-center space-x-2 text-primary font-bold text-lg">
            <Ghost className="h-6 w-6" />
            <span className="hidden sm:inline">thread overflow</span>
          </Link>
        </div>
        
        <div className="flex-1 max-w-lg mx-4">
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
        </div>

        <div className="flex items-center space-x-2">
          <Button asChild className="hidden md:inline-flex">
            <Link href="/posts/new">
              <Plus className="mr-2" />
              New Post
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://placehold.co/40x40.png" alt="@shadcn" data-ai-hint="user avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Test User</p>
                  <p className="text-xs leading-none text-muted-foreground">test@example.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
               <DropdownMenuItem asChild className="md:hidden">
                 <Link href="/posts/new"><Plus className="mr-2" />New Post</Link>
               </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/c/new"><Users className="mr-2" />Create Community</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/leaderboard"><Trophy className="mr-2" />Leaderboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile"><User className="mr-2" />Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem><Settings className="mr-2" />Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                 <Link href="/login"><LogOut className="mr-2" />Log out</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
