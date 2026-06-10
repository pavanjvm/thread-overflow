import type { Hackathon } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, CalendarPlus, Clock, Mic } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function ScheduleTab({ hackathon }: { hackathon: Hackathon }) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search schedule..." className="pl-10" />
            </div>
            <Button variant="outline">
              <CalendarPlus className="mr-2" /> Add to Calendar
            </Button>
            <Select defaultValue="berlin">
              <SelectTrigger className="w-[200px]">
                <Clock className="mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="berlin">Berlin (+02:00 UTC)</SelectItem>
                <SelectItem value="london">London (+01:00 UTC)</SelectItem>
                <SelectItem value="new-york">New York (-04:00 UTC)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">Timeline</CardTitle>
                <p className="text-sm text-muted-foreground">{hackathon.timeline.start} - {hackathon.timeline.end}</p>
              </CardHeader>
            </Card>
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">Event</CardTitle>
                <p className="text-sm text-muted-foreground">{hackathon.eventDates.start} - {hackathon.eventDates.end}</p>
              </CardHeader>
            </Card>
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">Prize Announcement</CardTitle>
                <p className="text-sm text-muted-foreground">{hackathon.prizeAnnouncement.start} - {hackathon.prizeAnnouncement.end}</p>
              </CardHeader>
            </Card>
          </div>
          
          <div className="space-y-6">
            {hackathon.schedule.map((day) => (
              <div key={day.date}>
                <h3 className="font-semibold text-muted-foreground mb-4">{day.date}</h3>
                <div className="space-y-4">
                  {day.events.map((event) => (
                    <Card key={event.id}>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="font-bold text-lg w-24">{event.time}</div>
                            <div className="flex-grow">
                                <p className="font-semibold">{event.title}</p>
                                <p className="text-sm text-muted-foreground">{event.description}</p>
                            </div>
                            {event.speaker && (
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={event.speaker.avatarUrl} data-ai-hint="speaker portrait" />
                                        <AvatarFallback>{event.speaker.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{event.speaker.name}</p>
                                        <p className="text-xs text-muted-foreground">{event.speaker.title}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
