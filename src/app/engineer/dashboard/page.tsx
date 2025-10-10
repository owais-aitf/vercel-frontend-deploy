'use client';

import { Box, Grid, Text, VStack, HStack, Card, Progress } from '@chakra-ui/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { engineerNavigation } from '@/shared/config/navigation';

export default function EngineerDashboard() {
  return (
    <DashboardLayout
      navigation={engineerNavigation}
      pageTitle="Dashboard"
      pageSubtitle="Welcome back, John"
      userName="John Doe"
      userInitials="JD"
      notificationCount={3}
    >
      {/* Stats Cards */}
      <Grid templateColumns="repeat(3, 1fr)" gap={6} mb={6}>
        {/* Hours This Month */}
        <Card.Root p={6}>
          <VStack align="start" gap={4}>
            <HStack justify="space-between" w="full">
              <Text fontSize="sm" color="gray.600">
                Hours This Month
              </Text>
              <Text fontSize="24px">🕐</Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="bold">
              152/160 hours
            </Text>
            {/* FIXED Progress Bar */}
            <Box w="full" bg="gray.200" borderRadius="full" h="8px">
              <Box
                bg="blue.500"
                h="8px"
                borderRadius="full"
                w="95%"
                transition="width 0.3s"
              />
            </Box>
          </VStack>
        </Card.Root>

        {/* Attendance Rate */}
        <Card.Root p={6}>
          <VStack align="start" gap={4}>
            <HStack justify="space-between" w="full">
              <Text fontSize="sm" color="gray.600">
                Attendance Rate
              </Text>
              <Text fontSize="24px">📋</Text>
            </HStack>
            <HStack gap={2}>
              <Text fontSize="2xl" fontWeight="bold">
                98%
              </Text>
              <Text fontSize="sm" color="gray.500">
                This month
              </Text>
            </HStack>
            {/* FIXED Progress Bar */}
            <Box w="full" bg="gray.200" borderRadius="full" h="8px">
              <Box
                bg="blue.500"
                h="8px"
                borderRadius="full"
                w="98%"
                transition="width 0.3s"
              />
            </Box>
          </VStack>
        </Card.Root>

        {/* Active Projects */}
        <Card.Root p={6}>
          <VStack align="start" gap={4}>
            <HStack justify="space-between" w="full">
              <Text fontSize="sm" color="gray.600">
                Active Projects
              </Text>
              <Text fontSize="24px">💼</Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="bold">
              3 Projects
            </Text>
            {/* FIXED Progress Bar */}
            <Box w="full" bg="gray.200" borderRadius="full" h="8px">
              <Box
                bg="blue.500"
                h="8px"
                borderRadius="full"
                w="100%"
                transition="width 0.3s"
              />
            </Box>
          </VStack>
        </Card.Root>
      </Grid>

      {/* Recent Activities & Upcoming Tasks */}
      <Grid templateColumns="1.5fr 1fr" gap={6}>
        {/* Recent Activities */}
        <Card.Root p={6}>
          <VStack align="start" gap={4}>
            <Text fontSize="lg" fontWeight="bold">
              Recent Activities
            </Text>
            <Text fontSize="sm" color="gray.500">
              Your latest attendance entries
            </Text>

            <VStack gap={3} w="full" mt={2}>
              {[
                {
                  project: 'Web Portal Development',
                  date: 'Oct 8, 2025',
                  hours: '8h',
                  location: 'Client Site',
                  status: 'approved',
                },
                {
                  project: 'Web Portal Development',
                  date: 'Oct 7, 2025',
                  hours: '8h',
                  location: 'Remote',
                  status: 'approved',
                },
                {
                  project: 'Mobile App Project',
                  date: 'Oct 6, 2025',
                  hours: '6h',
                  location: 'Client Site',
                  status: 'pending',
                },
              ].map((activity, index) => (
                <Box
                  key={index}
                  w="full"
                  p={4}
                  borderRadius="md"
                  bg="gray.50"
                  _hover={{ bg: 'gray.100' }}
                  transition="all 0.2s"
                >
                  <HStack justify="space-between">
                    <VStack align="start" gap={1}>
                      <Text fontWeight="medium" fontSize="sm">
                        {activity.project}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {activity.date}
                      </Text>
                    </VStack>
                    <VStack align="end" gap={1}>
                      <Text fontSize="sm" fontWeight="medium">
                        {activity.hours}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {activity.location}
                      </Text>
                    </VStack>
                    <Box
                      px={3}
                      py={1}
                      borderRadius="full"
                      bg={activity.status === 'approved' ? 'blue.500' : 'yellow.500'}
                      color="white"
                      fontSize="xs"
                    >
                      {activity.status}
                    </Box>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </VStack>
        </Card.Root>

        {/* Upcoming Tasks */}
        <Card.Root p={6}>
          <VStack align="start" gap={4}>
            <Text fontSize="lg" fontWeight="bold">
              Upcoming Tasks
            </Text>
            <Text fontSize="sm" color="gray.500">
              Important deadlines
            </Text>

            <VStack gap={3} w="full" mt={2}>
              {[
                {
                  task: 'Submit weekly attendance report',
                  due: 'Oct 11',
                  color: 'red',
                },
                {
                  task: 'Complete project status update',
                  due: 'Oct 12',
                  color: 'blue',
                },
                {
                  task: 'Review code changes',
                  due: 'Oct 31',
                  color: 'purple',
                },
              ].map((task, index) => (
                <HStack key={index} gap={3} w="full">
                  <Box
                    w="12px"
                    h="12px"
                    borderRadius="full"
                    bg={`${task.color}.500`}
                  />
                  <VStack align="start" gap={0} flex={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      {task.task}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Due: {task.due}
                    </Text>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </Card.Root>
      </Grid>
    </DashboardLayout>
  );
}
