import {
  Card,
  HStack,
  VStack,
  Text,
  IconButton,
  Badge,
} from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { Engineer } from '@/shared/service/engineerService';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

interface CalendarHeaderProps {
  engineer: Engineer;
  selectedMonth: number;
  selectedYear: number;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  stats: {
    totalWorkDays: number;
    totalLeave: number;
    totalAbsent: number;
  };
}

export function CalendarHeader({
  engineer,
  selectedMonth,
  selectedYear,
  onNavigateMonth,
  stats,
}: CalendarHeaderProps) {
  const { t } = useTranslation('sales');

  const monthNames = [
    t('attendance.calendar.months.january'),
    t('attendance.calendar.months.february'),
    t('attendance.calendar.months.march'),
    t('attendance.calendar.months.april'),
    t('attendance.calendar.months.may'),
    t('attendance.calendar.months.june'),
    t('attendance.calendar.months.july'),
    t('attendance.calendar.months.august'),
    t('attendance.calendar.months.september'),
    t('attendance.calendar.months.october'),
    t('attendance.calendar.months.november'),
    t('attendance.calendar.months.december'),
  ];

  const isCurrentMonth = () => {
    const now = new Date();
    return (
      selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear()
    );
  };

  return (
    <Card.Root p={2} mb={2}>
      <HStack justify="space-between" flexWrap="wrap" gap={2} w="full">
        {/* Engineer Info */}
        <VStack align="start" gap={1}>
          <Text fontSize="2xl" fontWeight="bold">
            {engineer.fullName}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {engineer.email}
          </Text>
        </VStack>

        {/* Month Navigation */}
        <HStack gap={4}>
          <IconButton
            aria-label={t('attendance.calendar.previous_month')}
            onClick={() => onNavigateMonth('prev')}
            variant="outline"
            size="sm"
          >
            <LuChevronLeft />
          </IconButton>

          <VStack gap={0}>
            <Text fontSize="lg" fontWeight="bold">
              {monthNames[selectedMonth - 1]} {selectedYear}
            </Text>
            {isCurrentMonth() && (
              <Badge colorScheme="blue" fontSize="2xs">
                {t('attendance.calendar.current_month')}
              </Badge>
            )}
          </VStack>

          <IconButton
            aria-label={t('attendance.calendar.next_month')}
            onClick={() => onNavigateMonth('next')}
            variant="outline"
            size="sm"
          >
            <LuChevronRight />
          </IconButton>
        </HStack>

        {/* Stats */}
        <HStack gap={4} flexShrink={0}>
          <VStack gap={0} minW="60px">
            <Text fontSize="2xl" fontWeight="bold" color="green.600">
              {stats.totalWorkDays}
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">
              {t('attendance.stats.work_days')}
            </Text>
          </VStack>
          <VStack gap={0} minW="50px">
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              {stats.totalLeave}
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">
              {t('attendance.stats.leave_days')}
            </Text>
          </VStack>
          <VStack gap={0} minW="50px">
            <Text fontSize="2xl" fontWeight="bold" color="red.600">
              {stats.totalAbsent}
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">
              {t('attendance.stats.absent_days')}
            </Text>
          </VStack>
        </HStack>
      </HStack>
    </Card.Root>
  );
}
