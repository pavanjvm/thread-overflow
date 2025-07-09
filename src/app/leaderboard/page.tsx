import { users } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Star, Medal, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const LeaderboardPage = () => {
  const sortedUsers = [...users].sort((a, b) => b.stars - a.stars);

  const rankIcons = [
    <Crown key="gold" className="h-6 w-6 text-slate-200" />,
    <Medal key="silver" className="h-6 w-6 text-slate-400" />,
    <Trophy key="bronze" className="h-6 w-6 text-slate-500" />,
  ];

  const getRankIndicator = (rank: number) => {
    if (rank < 3) {
      return rankIcons[rank];
    }
    return <span className="font-bold text-lg w-6 text-center">{rank + 1}</span>;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Weekly Leaderboard</h1>
        <p className="text-muted-foreground mt-2">Top star earners of the week.</p>
      </header>
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            {sortedUsers.map((user, index) => (
              <li
                key={user.id}
                className={cn(
                  'flex items-center justify-between p-4 transition-colors',
                  index < 3 && 'bg-card',
                  index === 0 && 'rounded-t-lg bg-slate-500/10',
                  index === 1 && 'bg-slate-600/10',
                  index === 2 && 'bg-slate-700/10'
                )}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8">
                    {getRankIndicator(index)}
                  </div>
                  <Avatar>
                    <AvatarImage src={user.avatarUrl} data-ai-hint="user avatar" />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-lg">{user.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-primary font-bold">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="text-lg">{user.stars}</span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardPage;
