'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Attendance page is temporarily removed. Redirect to Engineer Dashboard.
export default function EngineerAttendanceRemoved() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/engineer/dashboard');
  }, [router]);
  return null;
}
