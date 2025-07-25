
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Welcome Back!</h1>
        <p className="text-muted-foreground mt-2 text-lg">Where would you like to go today?</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <Link href="/feed" className="block">
          <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="items-center text-center p-8">
              <CardTitle className="text-2xl">Community Forum</CardTitle>
              <CardDescription className="text-base mt-2">
                Engage in discussions, ask questions, and share your knowledge with the community.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/ideation" className="block">
          <Card className="h-full hover:border-accent/80 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="items-center text-center p-8">
              <CardTitle className="text-2xl">Ideation Portal</CardTitle>
              <CardDescription className="text-base mt-2">
                Submit problems, share ideas, and build prototypes to solve real-world challenges.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/hackathons" className="block">
          <Card className="h-full hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="items-center text-center p-8">
              <CardTitle className="text-2xl">Hackathon Portal</CardTitle>
              <CardDescription className="text-base mt-2">
                Join hackathons, build projects, and compete for amazing prizes and recognition.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
