import { notFound } from 'next/navigation';
import { hackathons } from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewTab from './_components/OverviewTab';
import PrizesTab from './_components/PrizesTab';
import SpeakersAndJudgesTab from './_components/SpeakersAndJudgesTab';
import ScheduleTab from './_components/ScheduleTab';
import ProjectsTab from './_components/ProjectsTab';

export default async function HackathonPage({ params }: { params: { slug: string } }) {
  const hackathon = hackathons.find((h) => h.slug === params.slug);

  if (!hackathon) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="schedule" className="w-full">
        <div className="flex justify-center border-b">
            <TabsList className="bg-transparent p-0 rounded-none">
              <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Overview</TabsTrigger>
              <TabsTrigger value="prizes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Prizes</TabsTrigger>
              <TabsTrigger value="speakers" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Speakers & Judges</TabsTrigger>
              <TabsTrigger value="schedule" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Schedule</TabsTrigger>
              <TabsTrigger value="projects" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Projects</TabsTrigger>
            </TabsList>
        </div>
        <div className="py-6">
            <TabsContent value="overview">
              <OverviewTab hackathon={hackathon} />
            </TabsContent>
            <TabsContent value="prizes">
              <PrizesTab hackathon={hackathon} />
            </TabsContent>
            <TabsContent value="speakers">
                <SpeakersAndJudgesTab hackathon={hackathon} />
            </TabsContent>
            <TabsContent value="schedule">
              <ScheduleTab hackathon={hackathon} />
            </TabsContent>
            <TabsContent value="projects">
              <ProjectsTab hackathon={hackathon} />
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
