
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page is obsolete and has been replaced by /ideation/new.
// We redirect to the new page.
export default function ObsoleteSubmitIdeaPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/ideation/new');
    }, [router]);

    return null;
}
