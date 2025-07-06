import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import TextPressure from '@/components/TextPressure';

export default function LandingPage() {
  return (
    <div className="flex-grow flex items-center">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col justify-center text-center md:text-left">
            <div className="h-32">
                <TextPressure text="Thread Overflow" textColor="hsl(var(--primary))" />
            </div>
            <p className="text-2xl text-muted-foreground max-w-lg mx-auto md:mx-0">
              Where your silly thoughts, brilliant ideas, and random musings collide in a big, friendly internet explosion!
            </p>
            <div className="flex justify-center md:justify-start space-x-4 pt-8">
              <Button asChild size="lg">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/signup">Create Account</Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center p-8">
            <Image
              src="https://placehold.co/600x450.png"
              alt="A zany collage of cartoon characters chatting and exchanging ideas"
              width={600}
              height={450}
              className="rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
              data-ai-hint="cartoon characters community"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
