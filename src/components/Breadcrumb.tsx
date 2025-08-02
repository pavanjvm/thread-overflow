
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';

const Breadcrumb = () => {
  const pathname = usePathname();
  if (pathname === '/dashboard' || pathname === '/login' || pathname === '/signup' || pathname === '/') {
    return null;
  }

  const pathSegments = pathname.split('/').filter(segment => segment);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const isLast = index === pathSegments.length - 1;
    
    // Capitalize and replace hyphens for display
    let text = segment.replace(/-/g, ' ');
    text = text.charAt(0).toUpperCase() + text.slice(1);

    // Custom labels for specific routes
    if (href === '/feed') text = 'All Posts';
    if (href === '/ideation') text = 'Ideation Portal';
    if (href === '/hackathons') text = 'Hackathons';
    if (segment === 'c') text = 'Communities';

    // For dynamic routes, we can't get the name easily on the client.
    // We could show the ID, or a generic name. Let's show a generic name for now.
    const prevSegment = pathSegments[index-1];
    if (prevSegment === 'posts' || prevSegment === 'ideation' || prevSegment === 'hackathons' || prevSegment === 'prototypes' || prevSegment === 'ideas' || prevSegment === 'c') {
      text = 'Details';
    }


    return { href, text, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-1 text-sm text-muted-foreground">
        <li>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 hover:text-foreground">
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
                aria-current={isLast ? 'page' : undefined}>
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
