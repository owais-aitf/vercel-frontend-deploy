import { Box, Grid, Text, VStack, HStack, Badge } from '@chakra-ui/react';
import {
  LuCheck,
  LuPlane,
  LuX,
  LuCalendar,
  LuClock,
  LuMapPin,
  LuCalendarDays,
} from 'react-icons/lu';

interface AttendanceRecord {
  id: string;
  workDate: string;
  attendanceType: string;
  workLocation?: string;
  startTime?: string;
  endTime?: string;
  breakHours: number;
  workDescription?: string;
}

interface CalendarViewProps {
  attendanceRecords: AttendanceRecord[];
  selectedMonth: number;
  selectedYear: number;
  loading: boolean;
  onDayClick: (record: AttendanceRecord) => void;
}

export function CalendarView({
  attendanceRecords,
  selectedMonth,
  selectedYear,
  loading,
  onDayClick,
}: CalendarViewProps) {
  const getAttendanceTypeColor = (type: string) => {
    switch (type) {
      case 'PRESENT':
        return 'green';
      case 'PAID_LEAVE':
        return 'blue';
      case 'ABSENT':
        return 'red';
      case 'LEGAL_HOLIDAY':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const getAttendanceTypeLabel = (type: string) => {
    switch (type) {
      case 'PRESENT':
        return 'Present';
      case 'PAID_LEAVE':
        return 'Paid Leave';
      case 'ABSENT':
        return 'Absent';
      case 'LEGAL_HOLIDAY':
        return 'Holiday';
      default:
        return type;
    }
  };

  const getAttendanceTypeIcon = (type: string) => {
    switch (type) {
      case 'PRESENT':
        return <LuCheck size={16} />;
      case 'PAID_LEAVE':
        return <LuPlane size={16} />;
      case 'ABSENT':
        return <LuX size={16} />;
      case 'LEGAL_HOLIDAY':
        return <LuCalendarDays size={16} />;
      default:
        return null;
    }
  };

  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return timeString;
    }
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="full">
        <Text color="gray.500">Loading attendance...</Text>
      </Box>
    );
  }

  // Check if we have no attendance records
  const hasNoRecords = attendanceRecords.length === 0;

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const attendanceMap = new Map(
    attendanceRecords.map((record) => [
      new Date(record.workDate).getDate(),
      record,
    ])
  );

  const today = new Date();
  const isCurrentMonth =
    selectedMonth === today.getMonth() + 1 &&
    selectedYear === today.getFullYear();

  return (
    <Box>
      {/* Week Headers */}
      <Grid templateColumns="repeat(7, 1fr)" gap={2} mb={2}>
        {weekDays.map((day) => (
          <Box key={day} textAlign="center" p={2}>
            <Text fontSize="xs" fontWeight="bold" color="gray.600">
              {day}
            </Text>
          </Box>
        ))}
      </Grid>

      {/* Calendar Days */}
      <Grid templateColumns="repeat(7, 1fr)" gap={2}>
        {/* Empty cells */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <Box key={`empty-${i}`} />
        ))}

        {/* Days */}
        {days.map((day) => {
          const record = attendanceMap.get(day);
          const isToday = isCurrentMonth && day === today.getDate();

          return (
            <Box
              key={day}
              p={3}
              borderRadius="lg"
              border="2px solid"
              borderColor={
                isToday
                  ? 'purple.400'
                  : record
                    ? getAttendanceTypeColor(record.attendanceType) + '.300'
                    : 'gray.200'
              }
              bg={
                record
                  ? getAttendanceTypeColor(record.attendanceType) + '.50'
                  : 'white'
              }
              cursor={record ? 'pointer' : 'default'}
              _hover={
                record
                  ? {
                      shadow: 'lg',
                      transform: 'translateY(-2px)',
                      borderColor:
                        getAttendanceTypeColor(record.attendanceType) + '.500',
                    }
                  : {}
              }
              transition="all 0.2s"
              onClick={() => record && onDayClick(record)}
              minH="100px"
            >
              <VStack align="stretch" gap={1}>
                <HStack justify="space-between">
                  <Text
                    fontSize="sm"
                    fontWeight={isToday ? 'bold' : 'semibold'}
                    color={isToday ? 'purple.700' : 'gray.700'}
                  >
                    {day}
                  </Text>
                  {isToday && (
                    <Badge colorScheme="purple" fontSize="2xs">
                      Today
                    </Badge>
                  )}
                </HStack>

                {record && (
                  <VStack align="start" gap={1}>
                    <HStack>
                      <Box
                        color={`${getAttendanceTypeColor(record.attendanceType)}.600`}
                      >
                        {getAttendanceTypeIcon(record.attendanceType)}
                      </Box>
                      <Badge
                        colorScheme={getAttendanceTypeColor(
                          record.attendanceType
                        )}
                        fontSize="2xs"
                      >
                        {getAttendanceTypeLabel(record.attendanceType)}
                      </Badge>
                    </HStack>

                    {record.startTime && record.endTime && (
                      <HStack gap={1}>
                        <LuClock size={12} color="#718096" />
                        <Text fontSize="2xs" color="gray.600">
                          {formatTime(record.startTime)} -{' '}
                          {formatTime(record.endTime)}
                        </Text>
                      </HStack>
                    )}

                    {record.workLocation && (
                      <HStack gap={1}>
                        <LuMapPin size={12} color="#718096" />
                        <Text
                          fontSize="2xs"
                          color="gray.600"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                        >
                          {record.workLocation}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                )}
              </VStack>
            </Box>
          );
        })}
      </Grid>

      {/* Empty State */}
      {hasNoRecords && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          textAlign="center"
          color="gray.500"
        >
          <VStack gap={3}>
            <LuCalendar size={48} color="#A0AEC0" />
            <Text fontSize="lg" fontWeight="medium">
              No attendance records
            </Text>
            <Text fontSize="sm">No attendance data found for this month</Text>
          </VStack>
        </Box>
      )}
    </Box>
  );
}
