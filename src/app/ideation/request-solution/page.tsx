
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page is obsolete and has been replaced by /ideation/ideas/new.
// We redirect to the new page.
export default function ObsoleteRequestSolutionPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/ideation/ideas/new');
    }, [router]);

    return null;
}
