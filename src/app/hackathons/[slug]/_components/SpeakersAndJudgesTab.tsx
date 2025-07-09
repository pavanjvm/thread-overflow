import type { Hackathon, HackathonPerson } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const PersonCard = ({ person }: { person: HackathonPerson }) => (
  <Card className="text-center p-4">
    <Avatar className="h-24 w-24 mx-auto mb-4">
      <AvatarImage src={person.avatarUrl} alt={person.name} data-ai-hint="person portrait" />
      <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
    </Avatar>
    <p className="font-bold text-lg">{person.name}</p>
    <p className="text-sm text-muted-foreground">{person.title}</p>
  </Card>
);

export default function SpeakersAndJudgesTab({ hackathon }: { hackathon: Hackathon }) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Speakers</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {hackathon.speakers.map((speaker) => (
            <PersonCard key={speaker.name} person={speaker} />
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4">Judges</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {hackathon.judges.map((judge) => (
            <PersonCard key={judge.name} person={judge} />
          ))}
        </div>
      </section>
    </div>
  );
}
