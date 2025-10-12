'use client';

import { useState, useEffect, useContext } from 'react';
import {
  Box,
  Text,
  VStack,
  Input,
  Button,
  Textarea,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { engineerNavigation } from '@/shared/config/navigation';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import {
  attendanceService,
  AttendanceData,
} from '@/shared/service/attendanceService';
import { AuthContext } from '@/context/AuthContext';
import { toaster } from '@/components/ui/toaster';

interface Project {
  id: string;
  assignmentId: string;
  projectName: string;
  clientName: string;
}

export default function EngineerAttendance() {
  const { user } = useContext(AuthContext);

  // Form state
  const [workDate, setWorkDate] = useState('');
  const [projectAssignmentId, setProjectAssignmentId] = useState('');
  const [attendanceType, setAttendanceType] = useState('PRESENT');
  const [workLocation, setWorkLocation] = useState('CLIENT_SITE');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [breakHours, setBreakHours] = useState('1.0');
  const [workDescription, setWorkDescription] = useState('');
  const [workHours, setWorkHours] = useState('8.0');

  // Data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setWorkDate(today);
  }, []);

  // Fetch active projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await attendanceService.getActiveProjects();
        if (response.success && response.data) {
          const projectList = response.data.map(
            (p: {
              id: string;
              project: { projectName: string; client: { name: string } };
            }) => ({
              id: p.id,
              assignmentId: p.id,
              projectName: p.project.projectName,
              clientName: p.project.client.name,
            })
          );
          setProjects(projectList);
          if (projectList.length > 0) {
            setProjectAssignmentId(projectList[0].assignmentId);
          }
        }
      } catch (error) {
        const err = error as { response?: { data?: { error?: string } } };
        toaster.create({
          title: 'Error',
          description: err.response?.data?.error || 'Failed to load projects',
          type: 'error',
          duration: 5000,
        });
      }
    };

    fetchProjects();
  }, []);

  // Calculate work hours when times change
  useEffect(() => {
    if (attendanceType === 'PRESENT' && startTime && endTime) {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes > startMinutes) {
        const totalMinutes = endMinutes - startMinutes;
        const totalHours = totalMinutes / 60;
        const breakHoursNum = parseFloat(breakHours) || 0;
        const calculatedHours = Math.max(0, totalHours - breakHoursNum);
        setWorkHours(calculatedHours.toFixed(1));
      } else {
        setWorkHours('0.0');
      }
    } else if (attendanceType === 'PAID_LEAVE') {
      setWorkHours('8.0');
    } else {
      setWorkHours('0.0');
    }
  }, [startTime, endTime, breakHours, attendanceType]);

  // Handle attendance type change
  const handleAttendanceTypeChange = (type: string) => {
    setAttendanceType(type);
    if (type === 'PAID_LEAVE') {
      setStartTime('09:00');
      setEndTime('18:00');
      setBreakHours('0');
      setWorkLocation('');
    } else if (type === 'ABSENT' || type === 'LEGAL_HOLIDAY') {
      setStartTime('00:00');
      setEndTime('00:00');
      setBreakHours('0');
      setWorkLocation('');
    } else if (type === 'PRESENT') {
      setStartTime('09:00');
      setEndTime('18:00');
      setBreakHours('1.0');
      setWorkLocation('CLIENT_SITE');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectAssignmentId) {
      toaster.create({
        title: 'Please select a project',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    const attendanceData: AttendanceData = {
      projectAssignmentId,
      workDate,
      attendanceType,
      workDescription: workDescription || null,
    };

    if (attendanceType === 'PRESENT') {
      if (!workLocation) {
        toaster.create({
          title: 'Work location is required for Present attendance',
          type: 'error',
          duration: 3000,
        });
        return;
      }
      attendanceData.workLocation = workLocation;
      attendanceData.startTime = startTime;
      attendanceData.endTime = endTime;
      attendanceData.breakHours = parseFloat(breakHours);
    }

    try {
      setSubmitting(true);
      const response = await attendanceService.createAttendance(attendanceData);

      if (response.success) {
        toaster.create({
          title: '✅ Attendance submitted successfully!',
          type: 'success',
          duration: 2500,
        });

        // Reset form
        setWorkDescription('');
        const today = new Date().toISOString().split('T')[0];
        setWorkDate(today);
      }
    } catch (error) {
      // Extract clean error message without "Error:" prefix
      const err = error as { response?: { data?: { error?: string } } };
      let errorMessage =
        err.response?.data?.error || 'Failed to submit attendance';

      // Remove "Error:" or "Error" prefix if present
      errorMessage = errorMessage
        .replace(/^Error:\s*/i, '')
        .replace(/^Error\s*/i, '');

      toaster.create({
        title: errorMessage,
        type: 'error',
        duration: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FeatureErrorBoundary featureName="Attendance">
      <DashboardLayout
        navigation={engineerNavigation}
        pageTitle="Attendance"
        pageSubtitle="Manage your daily attendance"
        userName={user?.fullName || 'User'}
        userInitials={
          user?.fullName
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase() || 'U'
        }
        notificationCount={0}
      >
        <Box
          bg="white"
          p={{ base: 4, md: 6, lg: 8 }}
          borderRadius="xl"
          boxShadow="lg"
          border="1px solid"
          borderColor="gray.200"
          maxW="1200px"
          w="full"
        >
          <VStack align="stretch" gap={{ base: 4, md: 6 }}>
            <Box borderBottom="1px solid" borderColor="gray.200" pb={4}>
              <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
                color="gray.800"
              >
                📅 Daily Attendance Entry
              </Text>
              <Text color="gray.600" fontSize={{ base: 'xs', md: 'sm' }} mt={1}>
                Record your work hours and activities for today
              </Text>
            </Box>

            <form onSubmit={handleSubmit}>
              <VStack align="stretch" gap={{ base: 4, md: 6 }}>
                {/* Date and Project Row */}
                <Grid
                  templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                  gap={{ base: 4, md: 6 }}
                >
                  <GridItem>
                    <VStack align="stretch" gap={2}>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                        📆 Date
                      </Text>
                      <Input
                        type="date"
                        value={workDate}
                        onChange={(e) => setWorkDate(e.target.value)}
                        required
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'blue.400' }}
                        _focus={{
                          borderColor: 'blue.500',
                          boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.15)',
                        }}
                      />
                    </VStack>
                  </GridItem>

                  <GridItem>
                    <VStack align="stretch" gap={2}>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                        📁 Project
                      </Text>
                      <Box position="relative">
                        <select
                          value={projectAssignmentId}
                          onChange={(e) => setProjectAssignmentId(e.target.value)}
                          required
                          style={{
                            padding: '12px',
                            paddingRight: '40px',
                            borderRadius: '8px',
                            border: '2px solid #E2E8F0',
                            fontSize: '16px',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            width: '100%',
                            appearance: 'none',
                            outline: 'none',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.borderColor = '#63B3ED')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.borderColor = '#E2E8F0')
                          }
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#3182CE';
                            e.currentTarget.style.boxShadow =
                              '0 0 0 3px rgba(66, 153, 225, 0.15)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#E2E8F0';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <option value="">📂 Select project</option>
                          {projects.map((project) => (
                            <option key={project.id} value={project.assignmentId}>
                              {project.projectName} - {project.clientName}
                            </option>
                          ))}
                        </select>
                        <Box
                          position="absolute"
                          right={3}
                          top="50%"
                          transform="translateY(-50%)"
                          pointerEvents="none"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              fill="#718096"
                            />
                          </svg>
                        </Box>
                      </Box>
                    </VStack>
                  </GridItem>
                </Grid>

                {/* Attendance Type and Work Location Row */}
                <Grid
                  templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                  gap={{ base: 4, md: 6 }}
                >
                  <GridItem>
                    <VStack align="stretch" gap={2}>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                        ✅ Attendance Type
                      </Text>
                      <Box position="relative">
                        <select
                          value={attendanceType}
                          onChange={(e) =>
                            handleAttendanceTypeChange(e.target.value)
                          }
                          required
                          style={{
                            padding: '12px',
                            paddingRight: '40px',
                            borderRadius: '8px',
                            border: '2px solid #E2E8F0',
                            fontSize: '16px',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            width: '100%',
                            appearance: 'none',
                            outline: 'none',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.borderColor = '#63B3ED')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.borderColor = '#E2E8F0')
                          }
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#3182CE';
                            e.currentTarget.style.boxShadow =
                              '0 0 0 3px rgba(66, 153, 225, 0.15)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#E2E8F0';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <option value="PRESENT">✅ Present</option>
                          <option value="PAID_LEAVE">🏖️ Paid Leave</option>
                          <option value="ABSENT">❌ Absent</option>
                          <option value="LEGAL_HOLIDAY">🎉 Legal Holiday</option>
                        </select>
                        <Box
                          position="absolute"
                          right={3}
                          top="50%"
                          transform="translateY(-50%)"
                          pointerEvents="none"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              fill="#718096"
                            />
                          </svg>
                        </Box>
                      </Box>
                    </VStack>
                  </GridItem>

                  <GridItem>
                    <VStack align="stretch" gap={2}>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                        📍 Work Location
                      </Text>
                      <Box position="relative">
                        <select
                          value={workLocation}
                          onChange={(e) => setWorkLocation(e.target.value)}
                          disabled={attendanceType !== 'PRESENT'}
                          style={{
                            padding: '12px',
                            paddingRight: '40px',
                            borderRadius: '8px',
                            border: '2px solid #E2E8F0',
                            fontSize: '16px',
                            backgroundColor:
                              attendanceType !== 'PRESENT' ? '#F7FAFC' : 'white',
                            cursor:
                              attendanceType !== 'PRESENT'
                                ? 'not-allowed'
                                : 'pointer',
                            opacity: attendanceType !== 'PRESENT' ? 0.6 : 1,
                            width: '100%',
                            appearance: 'none',
                            outline: 'none',
                          }}
                          onMouseEnter={(e) => {
                            if (attendanceType === 'PRESENT') {
                              e.currentTarget.style.borderColor = '#63B3ED';
                            }
                          }}
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.borderColor = '#E2E8F0')
                          }
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#3182CE';
                            e.currentTarget.style.boxShadow =
                              '0 0 0 3px rgba(66, 153, 225, 0.15)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#E2E8F0';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <option value="">📍 Select location</option>
                          <option value="CLIENT_SITE">🏢 Client Site</option>
                          <option value="HOME">🏠 Home</option>
                          <option value="OFFICE">🏛️ Office</option>
                        </select>
                        <Box
                          position="absolute"
                          right={3}
                          top="50%"
                          transform="translateY(-50%)"
                          pointerEvents="none"
                          opacity={attendanceType !== 'PRESENT' ? 0.6 : 1}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              fill="#718096"
                            />
                          </svg>
                        </Box>
                      </Box>
                    </VStack>
                  </GridItem>
                </Grid>

                {/* Start Time and End Time Row */}
                <Grid
                  templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                  gap={{ base: 4, md: 6 }}
                >
                  <GridItem>
                    <VStack align="stretch" gap={2}>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                        🕐 Start Time
                      </Text>
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        disabled={attendanceType !== 'PRESENT'}
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        bg={attendanceType !== 'PRESENT' ? 'gray.100' : 'white'}
                        opacity={attendanceType !== 'PRESENT' ? 0.6 : 1}
                        _hover={{
                          borderColor:
                            attendanceType === 'PRESENT'
                              ? 'blue.400'
                              : 'gray.300',
                        }}
                        _focus={{
                          borderColor: 'blue.500',
                          boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.15)',
                        }}
                      />
                    </VStack>
                  </GridItem>

                  <GridItem>
                    <VStack align="stretch" gap={2}>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                        🕐 End Time
                      </Text>
                      <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        disabled={attendanceType !== 'PRESENT'}
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        bg={attendanceType !== 'PRESENT' ? 'gray.100' : 'white'}
                        opacity={attendanceType !== 'PRESENT' ? 0.6 : 1}
                        _hover={{
                          borderColor:
                            attendanceType === 'PRESENT'
                              ? 'blue.400'
                              : 'gray.300',
                        }}
                        _focus={{
                          borderColor: 'blue.500',
                          boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.15)',
                        }}
                      />
                    </VStack>
                  </GridItem>
                </Grid>

                {/* Break Hours and Work Hours Row */}
                <Grid
                  templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                  gap={{ base: 4, md: 6 }}
                >
                  <GridItem>
                    <VStack align="stretch" gap={2}>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                        ☕ Break Hours
                      </Text>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        value={breakHours}
                        onChange={(e) => setBreakHours(e.target.value)}
                        disabled={attendanceType !== 'PRESENT'}
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        bg={attendanceType !== 'PRESENT' ? 'gray.100' : 'white'}
                        opacity={attendanceType !== 'PRESENT' ? 0.6 : 1}
                        _hover={{
                          borderColor:
                            attendanceType === 'PRESENT'
                              ? 'blue.400'
                              : 'gray.300',
                        }}
                        _focus={{
                          borderColor: 'blue.500',
                          boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.15)',
                        }}
                      />
                    </VStack>
                  </GridItem>

                  <GridItem>
                    <VStack align="stretch" gap={2}>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                        ⏱️ Work Hours (Calculated)
                      </Text>
                      <Box
                        p={3}
                        borderRadius="lg"
                        bg="blue.50"
                        border="2px solid"
                        borderColor="blue.200"
                        fontSize="lg"
                        fontWeight="bold"
                        color="blue.700"
                        display="flex"
                        alignItems="center"
                        h="48px"
                      >
                        {workHours} hours
                      </Box>
                    </VStack>
                  </GridItem>
                </Grid>

                {/* Work Description */}
                <VStack align="stretch" gap={2}>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    📝 Work Description
                  </Text>
                  <Textarea
                    value={workDescription}
                    onChange={(e) => setWorkDescription(e.target.value)}
                    placeholder="Describe your work activities for the day..."
                    rows={4}
                    resize="vertical"
                    borderRadius="lg"
                    borderColor="gray.300"
                    _hover={{ borderColor: 'blue.400' }}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.15)',
                    }}
                  />
                </VStack>

                {/* Submit Button */}
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  loading={submitting}
                  loadingText="Submitting attendance..."
                  w={{ base: 'full', md: 'fit-content' }}
                  px={8}
                  py={6}
                  fontSize="md"
                  fontWeight="bold"
                  borderRadius="xl"
                  boxShadow="md"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                  _active={{
                    transform: 'translateY(0)',
                    boxShadow: 'md',
                  }}
                  transition="all 0.2s"
                  disabled={submitting}
                >
                  {submitting ? '⏳ Submitting...' : '✅ Submit Attendance'}
                </Button>
              </VStack>
            </form>
          </VStack>
        </Box>
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
