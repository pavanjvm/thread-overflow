'use client';

import Link from 'next/link';
import { Flame, Home, Plus, Trophy, User, LogOut, Settings } from 'lucide-react';
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

const Header = () => {
  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2 text-primary font-bold text-lg">
              <Flame className="h-6 w-6" />
              <span>thread overflow</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/">
                  <Home className="mr-2" />
                  Home
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/leaderboard">
                  <Trophy className="mr-2" />
                  Leaderboard
                </Link>
              </Button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button asChild>
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
      </div>
    </header>
  );
};

export default Header;
