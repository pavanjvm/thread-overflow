'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { MessageCircle, Zap, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex flex-col items-center text-center space-y-12 py-12">
      <header className="space-y-4">
        <h1 className="text-6xl font-bold text-primary animate-bounce">
          Thread Overflow
        </h1>
        <p className="text-2xl text-muted-foreground max-w-2xl">
          Where your silly thoughts, brilliant ideas, and random musings collide in a big, friendly internet explosion!
        </p>
      </header>

      <div className="relative">
        <Image
          src="https://placehold.co/800x450.png"
          alt="A zany collage of cartoon characters chatting and exchanging ideas"
          width={800}
          height={450}
          className="rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
          data-ai-hint="cartoon characters community"
        />
         <div className="absolute -top-8 -left-8 bg-accent p-4 rounded-full animate-pulse">
            <MessageCircle className="h-10 w-10 text-accent-foreground" />
        </div>
         <div className="absolute -bottom-8 -right-8 bg-primary p-4 rounded-full animate-ping">
            <Zap className="h-10 w-10 text-primary-foreground" />
        </div>
      </div>

      <div className="flex space-x-4">
        <Button asChild size="lg">
          <Link href="/signup">Get Started!</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/feed">See What's Happening</Link>
        </Button>
      </div>

      <section className="w-full max-w-4xl space-y-8 pt-12">
        <h2 className="text-4xl font-bold">Why You'll Love It Here</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center space-y-2 p-6 bg-card rounded-lg shadow-lg">
            <Users className="h-12 w-12 text-primary" />
            <h3 className="text-2xl font-semibold">Zany Communities</h3>
            <p className="text-muted-foreground">Find your people, whether you're into knitting sweaters for squirrels or debating the physics of cartoons.</p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-6 bg-card rounded-lg shadow-lg">
            <Zap className="h-12 w-12 text-primary" />
            <h3 className="text-2xl font-semibold">Post Anything</h3>
            <p className="text-muted-foreground">Got a hot take on pineapple on pizza? A picture of your cat looking distinguished? Share it all!</p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-6 bg-card rounded-lg shadow-lg">
            <MessageCircle className="h-12 w-12 text-primary" />
            <h3 className="text-2xl font-semibold">Endless Banter</h3>
            <p className="text-muted-foreground">Jump into conversations, vote on the best posts, and earn shiny stars for your brilliant commentary.</p>
          </div>
        </div>
      </section>

       <footer className="w-full pt-12">
            <p className="text-muted-foreground">© {year} Thread Overflow. Don't take us too seriously.</p>
       </footer>

    </div>
  );
}
