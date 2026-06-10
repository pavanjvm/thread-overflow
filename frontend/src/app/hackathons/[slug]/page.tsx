'use client';

import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { hackathons } from '@/lib/mock-data';
import ProgramOverviewTab from './_components/ProgramOverviewTab';
import StagesTab from './_components/StagesTab';
import ParticipantHubTab from './_components/ParticipantHubTab';
import ClientConsoleTab from './_components/ClientConsoleTab';
import ProjectsTab from './_components/ProjectsTab';
import InsightsTab from './_components/InsightsTab';

export default function HackathonPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const hackathon = hackathons.find((item) => item.slug === slug);

  if (!hackathon) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <div className="overflow-x-auto border-b">
          <TabsList className="h-auto min-w-max bg-transparent p-0">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
              Overview
            </TabsTrigger>
            <TabsTrigger value="stages" className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
              Stages
            </TabsTrigger>
            <TabsTrigger value="participant-hub" className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
              Participant Hub
            </TabsTrigger>
            <TabsTrigger value="client-console" className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
              Client Console
            </TabsTrigger>
            <TabsTrigger value="projects" className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
              Projects
            </TabsTrigger>
            <TabsTrigger value="insights" className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
              Insights
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="py-6">
          <TabsContent value="overview">
            <ProgramOverviewTab hackathon={hackathon} />
          </TabsContent>
          <TabsContent value="stages">
            <StagesTab hackathon={hackathon} />
          </TabsContent>
          <TabsContent value="participant-hub">
            <ParticipantHubTab hackathon={hackathon} />
          </TabsContent>
          <TabsContent value="client-console">
            <ClientConsoleTab hackathon={hackathon} />
          </TabsContent>
          <TabsContent value="projects">
            <ProjectsTab hackathon={hackathon} />
          </TabsContent>
          <TabsContent value="insights">
            <InsightsTab hackathon={hackathon} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
