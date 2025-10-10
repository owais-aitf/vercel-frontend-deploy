'use client';

import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  SimpleGrid,
  Heading,
  VStack,
  Text,
  Button,
} from '@chakra-ui/react';
import api from '@/shared/lib/api-client';
import { AuthContext } from '@/context/AuthContext';
import { format } from 'date-fns';
import { ProtectedRoute, RoleGuard } from '@/shared/lib/auth-guard';
import { useRouter } from 'next/navigation';

type Assignment = {
  id: string;
  project?: { projectName?: string };
};

type AttendanceRecord = {
  id: string;
  workDate: string;
  attendanceType: string;
  startTime?: string | null;
  endTime?: string | null;
  breakHours?: number | string;
  projectAssignment?: { project?: { projectName?: string } };
};

export default function EngineerDashboardPage() {
  const router = useRouter();
  const { user, token, logout } = useContext(AuthContext);
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [hoursThisMonth, setHoursThisMonth] = useState<number>(0);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const today = new Date();
      const month = format(today, 'yyyy-MM');

      const [projectsRes, attendanceRes] = await Promise.all([
        api.get('/attendance/projects'),
        api.get(`/attendance?month=${month}`),
      ]);

      const projects: Assignment[] = projectsRes.data?.data || [];
      const attendance: AttendanceRecord[] = attendanceRes.data?.data || [];

      setProjectsCount(projects.length);
      setAttendanceRecords(attendance);

      // calculate hours this month
      let total = 0;
      for (const r of attendance) {
        const start = r.startTime ? new Date(r.startTime) : null;
        const end = r.endTime ? new Date(r.endTime) : null;
        let hours = 0;
        if (start && end) {
          const mins = (end.getTime() - start.getTime()) / (1000 * 60);
          hours = mins / 60 - (Number(r.breakHours) || 0);
        }
        total += hours;
      }
      setHoursThisMonth(Math.round(total * 100) / 100);
    } catch (err) {
      console.error('Dashboard fetch error', err);
    }
  };

  return (
    <ProtectedRoute>
      <RoleGuard allowed={['ENGINEER']}>
        <Box p={8}>
          <VStack align="start" gap={6} mb={6}>
            <Heading size="lg">Engineer Dashboard</Heading>
            <Text>Welcome back, {user?.fullName || user?.email}</Text>
            <Button
              size="sm"
              colorScheme="red"
              onClick={() => {
                logout();
                router.push('/login');
              }}
            >
              Logout
            </Button>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={6}>
            <Box borderWidth="1px" borderRadius="md" p={4}>
              <Text fontSize="sm">Hours This Month</Text>
              <Text fontWeight="bold">{hoursThisMonth} hours</Text>
            </Box>

            <Box borderWidth="1px" borderRadius="md" p={4}>
              <Text fontSize="sm">Attendance Records</Text>
              <Text fontWeight="bold">{attendanceRecords.length}</Text>
            </Box>

            <Box borderWidth="1px" borderRadius="md" p={4}>
              <Text fontSize="sm">Active Projects</Text>
              <Text fontWeight="bold">{projectsCount}</Text>
            </Box>
          </SimpleGrid>

          <Box>
            <Heading size="md" mb={4}>
              Recent Activities
            </Heading>
            <VStack gap={4} alignItems="stretch">
              {attendanceRecords.slice(0, 5).map((r) => (
                <Box
                  key={r.id}
                  borderWidth="1px"
                  borderRadius="md"
                  p={3}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Text fontWeight="semibold">
                      {r.projectAssignment?.project?.projectName || 'Project'}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {new Date(r.workDate).toLocaleDateString()}
                    </Text>
                  </Box>
                  <Box textAlign="right">
                    <Text>
                      {(() => {
                        try {
                          const s = r.startTime ? new Date(r.startTime) : null;
                          const e = r.endTime ? new Date(r.endTime) : null;
                          if (s && e)
                            return `${Math.round(((e.getTime() - s.getTime()) / 3600000 - Number(r.breakHours || 0)) * 100) / 100} h`;
                          return '0 h';
                        } catch {
                          return '0 h';
                        }
                      })()}
                    </Text>
                  </Box>
                </Box>
              ))}
            </VStack>
          </Box>
        </Box>
      </RoleGuard>
    </ProtectedRoute>
  );
}
