'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

import { fetchHackathonRegistrationById } from '@/lib/hackathons';

function formatSegmentLabel(segment: string) {
  const text = segment.replace(/-/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const Breadcrumb = () => {
  const pathname = usePathname();
  const [teamLabel, setTeamLabel] = useState<string | null>(null);

  const pathSegments = useMemo(() => pathname.split('/').filter(Boolean), [pathname]);
  const isTeamDetailRoute =
    pathSegments[0] === 'hackathons' &&
    pathSegments[2] === 'manage' &&
    pathSegments.length >= 4;
  const slug = isTeamDetailRoute ? pathSegments[1] : null;
  const registrationId = isTeamDetailRoute ? pathSegments[3] : null;

  useEffect(() => {
    let cancelled = false;

    if (!slug || !registrationId) {
      setTeamLabel(null);
      return;
    }

    const loadTeamLabel = async () => {
      try {
        const registration = await fetchHackathonRegistrationById(slug, registrationId);
        if (cancelled) {
          return;
        }

        const title = registration.teamName?.trim() || registration.participantName.trim();
        setTeamLabel(title ? `Team · ${title}` : 'Team');
      } catch {
        if (!cancelled) {
          setTeamLabel('Team');
        }
      }
    };

    void loadTeamLabel();

    return () => {
      cancelled = true;
    };
  }, [registrationId, slug]);

  if (pathname === '/dashboard' || pathname === '/signup' || pathname === '/') {
    return null;
  }

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const isLast = index === pathSegments.length - 1;
    let text = formatSegmentLabel(segment);

    if (href === '/feed') text = 'All Posts';
    if (href === '/ideation') text = 'Ideation Portal';
    if (href === '/hackathons') text = 'Hackathons';
    if (segment === 'c') text = 'Communities';
    if (segment === 'manage') text = 'Manage';

    const prevSegment = pathSegments[index - 1];
    if (
      prevSegment === 'posts' ||
      prevSegment === 'ideation' ||
      prevSegment === 'hackathons' ||
      prevSegment === 'prototypes' ||
      prevSegment === 'ideas' ||
      prevSegment === 'c'
    ) {
      text = 'Details';
    }

    if (isTeamDetailRoute && index === pathSegments.length - 1) {
      text = teamLabel ?? 'Team';
    }

    return { href, text, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-1 text-sm text-muted-foreground">
        <li>
          <Link href="/dashboard" className="flex items-center gap-1 hover:text-foreground">
            <>
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </>
          </Link>
        </li>
        {breadcrumbs.map(({ href, text, isLast }) => (
          <Fragment key={href}>
            <li className="flex items-center">
              <ChevronRight className="h-4 w-4" />
              <Link
                href={href}
                className={`ml-1 ${isLast ? 'text-foreground' : 'hover:text-foreground'}`}
                aria-current={isLast ? 'page' : undefined}
              >
                {text}
              </Link>
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
