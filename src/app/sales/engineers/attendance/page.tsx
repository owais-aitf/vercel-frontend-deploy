'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import { Box, Flex, Text, VStack, Card } from '@chakra-ui/react';
import { LuUsers } from 'react-icons/lu';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { salesNavigation } from '@/shared/config/navigation';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { AuthContext } from '@/context/AuthContext';
import { engineerService, Engineer } from '@/shared/service/engineerService';
import { attendanceService } from '@/shared/service/attendanceService';
import { toaster } from '@/components/ui/toaster';
import { engineerTabs } from '@/shared/config/engineerTabs';
import { EngineerSidebar } from './components/EngineerSidebar';
import { CalendarHeader } from './components/CalendarHeader';
import { CalendarView } from './components/CalendarView';
import { EditSlideOver } from './components/EditSlideOver';

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

interface EditFormData {
  attendanceType: string;
  workLocation: string;
  startTime: string;
  endTime: string;
  breakHours: number;
  workDescription: string;
}

export default function ManageAttendancePage() {
  const { user } = useContext(AuthContext);

  // Core state
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(
    null
  );
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(0);

  // Edit panel state
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(
    null
  );
  const [editFormData, setEditFormData] = useState<EditFormData>({
    attendanceType: '',
    workLocation: '',
    startTime: '',
    endTime: '',
    breakHours: 0,
    workDescription: '',
  });
  const [saving, setSaving] = useState(false);

  // Initialize month/year
  useEffect(() => {
    const now = new Date();
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
  }, []);

  const fetchEngineers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await engineerService.getAllEngineers();

      const activeEngineers = (response.data || []).filter(
        (e: Engineer) => e.isActive
      );
      setEngineers(activeEngineers);

      // Auto-select first engineer
      if (activeEngineers.length > 0 && !selectedEngineer) {
        setSelectedEngineer(activeEngineers[0]);
      }
    } catch (error) {
      console.error('Error fetching engineers:', error);
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toaster.create({
        title: 'Error',
        description: errorMessage || 'Failed to fetch engineers',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedEngineer]);

  // Fetch engineers on mount
  useEffect(() => {
    fetchEngineers();
  }, [fetchEngineers]);

  // Fetch attendance when engineer or month changes
  useEffect(() => {
    if (selectedEngineer && selectedMonth && selectedYear) {
      fetchAttendance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEngineer, selectedMonth, selectedYear]);

  const fetchAttendance = async () => {
    if (!selectedEngineer || !selectedMonth || !selectedYear) return;

    try {
      setLoadingAttendance(true);

      // Create month string in YYYY-MM format
      const monthString = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;

      const response = await attendanceService.getAttendance({
        engineerId: selectedEngineer.id,
        month: monthString,
      });

      setAttendanceRecords(response.data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);

      // Check if it's a 404 (no data) vs actual error
      const isNotFound =
        error instanceof Error &&
        'response' in error &&
        (error as { response?: { status?: number } }).response?.status === 404;

      if (!isNotFound) {
        const errorMessage =
          error instanceof Error && 'response' in error
            ? (error as { response?: { data?: { error?: string } } }).response
                ?.data?.error
            : undefined;
        toaster.create({
          title: 'Error',
          description: errorMessage || 'Failed to fetch attendance records',
          type: 'error',
        });
      }

      // Always set empty array on error
      setAttendanceRecords([]);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleSelectEngineer = (engineer: Engineer) => {
    setSelectedEngineer(engineer);
  };

  const handleNavigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  const handleDayClick = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setEditFormData({
      attendanceType: record.attendanceType,
      workLocation: record.workLocation || '',
      startTime: formatTimeForInput(record.startTime),
      endTime: formatTimeForInput(record.endTime),
      breakHours: record.breakHours || 0,
      workDescription: record.workDescription || '',
    });
    setIsEditPanelOpen(true);
  };

  const handleCloseEditPanel = () => {
    setIsEditPanelOpen(false);
    setEditingRecord(null);
  };

  const handleFormChange = (data: Partial<EditFormData>) => {
    setEditFormData((prev) => ({ ...prev, ...data }));
  };

  const handleSaveAttendance = async () => {
    if (!editingRecord) return;

    try {
      setSaving(true);
      await attendanceService.updateAttendance(editingRecord.id, {
        attendanceType: editFormData.attendanceType,
        workLocation: editFormData.workLocation || undefined,
        startTime: editFormData.startTime || undefined,
        endTime: editFormData.endTime || undefined,
        breakHours: editFormData.breakHours,
        workDescription: editFormData.workDescription || undefined,
      });

      toaster.create({
        title: 'Success',
        description: 'Attendance record updated successfully',
        type: 'success',
      });

      handleCloseEditPanel();
      fetchAttendance();
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toaster.create({
        title: 'Error',
        description: errorMessage || 'Failed to update attendance record',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAttendance = async () => {
    if (!editingRecord) return;

    if (!confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }

    try {
      await attendanceService.deleteAttendance(editingRecord.id);
      toaster.create({
        title: 'Success',
        description: 'Attendance record deleted successfully',
        type: 'success',
      });
      handleCloseEditPanel();
      fetchAttendance();
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toaster.create({
        title: 'Error',
        description: errorMessage || 'Failed to delete attendance record',
        type: 'error',
      });
    }
  };

  const formatTimeForInput = (timeString: string | null | undefined) => {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      return date.toTimeString().slice(0, 5);
    } catch {
      return timeString;
    }
  };

  // Calculate stats - filter by selected month/year to ensure accuracy
  const filteredRecords = attendanceRecords.filter((record) => {
    const recordDate = new Date(record.workDate);
    const recordMonth = recordDate.getMonth() + 1;
    const recordYear = recordDate.getFullYear();

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log(
        'Record date:',
        record.workDate,
        'Parsed:',
        recordDate,
        'Month:',
        recordMonth,
        'Year:',
        recordYear
      );
      console.log(
        'Selected month:',
        selectedMonth,
        'Selected year:',
        selectedYear
      );
    }

    return recordMonth === selectedMonth && recordYear === selectedYear;
  });

  // Remove duplicates based on workDate to prevent double counting
  const uniqueRecords = filteredRecords.filter(
    (record, index, self) =>
      index === self.findIndex((r) => r.workDate === record.workDate)
  );

  const stats = {
    totalWorkDays: uniqueRecords.filter((r) => r.attendanceType === 'PRESENT')
      .length,
    totalLeave: uniqueRecords.filter((r) => r.attendanceType === 'PAID_LEAVE')
      .length,
    totalAbsent: uniqueRecords.filter((r) => r.attendanceType === 'ABSENT')
      .length,
  };

  // Debug logging for stats
  if (process.env.NODE_ENV === 'development') {
    console.log('Total attendance records:', attendanceRecords.length);
    console.log('Filtered records:', filteredRecords.length);
    console.log('Unique records:', uniqueRecords.length);
    console.log('Stats:', stats);
  }

  return (
    <FeatureErrorBoundary featureName="Manage Attendance">
      <DashboardLayout
        navigation={salesNavigation}
        pageTitle="Engineer Management"
        pageSubtitle="Manage engineers and their attendance records"
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
        {/* Tab Navigation */}
        <TabNavigation tabs={engineerTabs} />

        {/* Modern Split-View Layout */}
        <Flex h="calc(100vh - 250px)" overflow="hidden">
          {/* Left Sidebar - Engineer List */}
          <EngineerSidebar
            engineers={engineers}
            selectedEngineer={selectedEngineer}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSelectEngineer={handleSelectEngineer}
            loading={loading}
            width={350}
            stats={stats}
          />

          {/* Right Panel - Calendar View */}
          <Box flex={1} overflow="hidden" display="flex" flexDirection="column">
            {!selectedEngineer ? (
              <Box
                flex={1}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <VStack gap={3}>
                  <LuUsers size={48} color="#A0AEC0" />
                  <Text color="gray.500" fontSize="lg">
                    Select an engineer to view attendance
                  </Text>
                </VStack>
              </Box>
            ) : (
              <>
                {/* Calendar Header */}
                <CalendarHeader
                  engineer={selectedEngineer}
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  onNavigateMonth={handleNavigateMonth}
                  stats={stats}
                />

                {/* Calendar Grid */}
                <Card.Root flex={1} p={4} overflow="auto">
                  <CalendarView
                    attendanceRecords={attendanceRecords}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    loading={loadingAttendance}
                    onDayClick={handleDayClick}
                  />
                </Card.Root>
              </>
            )}
          </Box>
        </Flex>

        {/* Slide-Over Edit Panel */}
        <EditSlideOver
          isOpen={isEditPanelOpen}
          record={editingRecord}
          formData={editFormData}
          onClose={handleCloseEditPanel}
          onFormChange={handleFormChange}
          onSave={handleSaveAttendance}
          onDelete={handleDeleteAttendance}
          saving={saving}
        />
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
