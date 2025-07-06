import Link from 'next/link';
import { Button } from '@/components/ui/button';
import TextPressure from '@/components/TextPressure';
import IconCloudDisplay from '@/components/IconCloudDisplay';

export default function LandingPage() {
  return (
    <div className="grid md:grid-cols-2 gap-12 py-24">
      <div className="flex flex-col text-center md:text-left pt-12 md:pt-0">
        <div className="h-20">
          <TextPressure text="Thread Overflow" textColor="hsl(var(--primary))" />
        </div>
        <p className="mt-6 text-2xl text-muted-foreground max-w-lg mx-auto md:mx-0">
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
      <div className="flex justify-center items-center p-8 h-[500px]">
        <IconCloudDisplay />
      </div>
    </div>
  );
}
