import { notFound } from 'next/navigation';
import { hackathons } from '@/lib/mock-data';
import Image from 'next/image';
import ApplyDialog from './_components/ApplyDialog';

export default function HackathonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const hackathon = hackathons.find((h) => h.slug === params.slug);

  if (!hackathon) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="relative h-64 w-full overflow-hidden rounded-lg bg-card">
        <Image
          src={hackathon.coverImageUrl}
          alt={`${hackathon.title} cover image`}
          fill
          className="object-cover"
          data-ai-hint="hackathon cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-4xl font-bold">{hackathon.title}</h1>
          <p className="text-lg mt-1">{hackathon.subtitle}</p>
        </div>
        <div className="absolute top-6 right-6">
          <ApplyDialog />
        </div>
      </div>
      {children}
    </div>
  );
}
