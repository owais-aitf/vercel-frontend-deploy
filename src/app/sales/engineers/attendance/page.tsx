'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import { Box, Flex, Text, VStack, Card, HStack } from '@chakra-ui/react';
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
  projectAssignmentId?: string;
  projectAssignment?: {
    project: {
      projectName: string;
      client: {
        name: string;
      };
    };
  };
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
  const [selectedProject, setSelectedProject] = useState<string>(''); // Project filter

  // Project data
  interface ProjectAssignment {
    id: string;
    project: {
      projectName: string;
      client: {
        name: string;
      };
    };
  }
  const [engineerProjects, setEngineerProjects] = useState<ProjectAssignment[]>(
    []
  );
  const [engineerProjectCounts, setEngineerProjectCounts] = useState<
    Map<string, number>
  >(new Map());

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

  const fetchEngineerProjects = useCallback(
    async (engineerId: string) => {
      try {
        console.log('=== FETCHING PROJECTS FOR ENGINEER ===');
        console.log('Engineer ID:', engineerId);
        console.log('Engineer object:', selectedEngineer);

        // Try to get projects using the getAllProjects endpoint with engineer query
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/attendance/projects?engineerId=${engineerId}`;
        console.log('API URL:', apiUrl);

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
          console.error('Response not ok, status:', response.status);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Raw API response data:', data);

        const engineerProjectsData = data.data || [];
        console.log('Final engineer projects data:', engineerProjectsData);
        setEngineerProjects(engineerProjectsData);

        // Update project count for this engineer
        setEngineerProjectCounts((prev) => {
          const newCounts = new Map(prev);
          newCounts.set(engineerId, engineerProjectsData.length);
          return newCounts;
        });

        // Auto-select first project immediately if available
        if (engineerProjectsData.length > 0) {
          console.log('Auto-selecting project:', engineerProjectsData[0].id);
          setSelectedProject(engineerProjectsData[0].id);
        } else {
          console.log('No projects found for this engineer');
        }
      } catch (error) {
        console.error('Error fetching engineer projects:', error);
        setEngineerProjects([]);
        setEngineerProjectCounts((prev) => {
          const newCounts = new Map(prev);
          newCounts.set(engineerId, 0);
          return newCounts;
        });
      }
    },
    [selectedEngineer]
  );

  // Fetch engineer projects when engineer changes
  useEffect(() => {
    if (selectedEngineer) {
      setSelectedProject(''); // Clear current project first
      fetchEngineerProjects(selectedEngineer.id);
    }
  }, [selectedEngineer, fetchEngineerProjects]);

  // Auto-select first project when projects are loaded
  useEffect(() => {
    console.log('Auto-selection effect triggered:', {
      projectsCount: engineerProjects.length,
      currentSelectedProject: selectedProject,
      projects: engineerProjects,
    });

    if (engineerProjects.length > 0 && !selectedProject) {
      console.log('Auto-selecting first project:', engineerProjects[0].id);
      setSelectedProject(engineerProjects[0].id);
    } else if (engineerProjects.length === 0) {
      console.log('No projects found, clearing selection');
      setSelectedProject('');
    }
  }, [engineerProjects, selectedProject]);

  // Fetch attendance when engineer, month, or project changes
  useEffect(() => {
    if (selectedEngineer && selectedMonth && selectedYear && selectedProject) {
      console.log('Fetching attendance with:', {
        engineer: selectedEngineer.id,
        month: selectedMonth,
        year: selectedYear,
        project: selectedProject,
      });
      fetchAttendance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEngineer, selectedMonth, selectedYear, selectedProject]);

  const fetchAttendance = async () => {
    if (!selectedEngineer) return;

    try {
      setLoadingAttendance(true);

      // Create month string in YYYY-MM format
      const monthString = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;

      interface AttendanceFilters {
        engineerId: string;
        month: string;
        projectAssignmentId: string;
      }

      const filters: AttendanceFilters = {
        engineerId: selectedEngineer.id,
        month: monthString,
        projectAssignmentId: selectedProject, // Always include project filter
      };

      const response = await attendanceService.getAttendance(filters);

      console.log('Attendance API filters sent:', filters);
      console.log('Attendance API response:', response);
      console.log('Attendance records received:', response.data);

      // Frontend fallback filtering by projectAssignmentId if backend doesn't filter properly
      let filteredRecords = response.data || [];
      if (selectedProject && filteredRecords.length > 0) {
        filteredRecords = filteredRecords.filter(
          (record: AttendanceRecord) =>
            record.projectAssignmentId === selectedProject
        );
        console.log('Frontend filtered records:', filteredRecords);
      }

      setAttendanceRecords(filteredRecords);
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

    // Validation
    if (!editFormData.attendanceType) {
      toaster.create({
        title: 'Validation Error',
        description: 'Attendance type is required',
        type: 'error',
      });
      return;
    }

    try {
      setSaving(true);

      // Prepare update data following the same pattern as engineer attendance
      interface UpdateData {
        projectAssignmentId?: string;
        workDate: string;
        attendanceType: string;
        workDescription: string | null;
        workLocation?: string;
        startTime?: string;
        endTime?: string;
        breakHours?: number;
      }

      const updateData: UpdateData = {
        projectAssignmentId: editingRecord.projectAssignmentId,
        workDate: editingRecord.workDate,
        attendanceType: editFormData.attendanceType,
        workDescription: editFormData.workDescription || null,
      };

      // Only add PRESENT-specific fields when attendance type is PRESENT
      if (editFormData.attendanceType === 'PRESENT') {
        updateData.workLocation = editFormData.workLocation;
        updateData.startTime = editFormData.startTime;
        updateData.endTime = editFormData.endTime;
        updateData.breakHours =
          parseFloat(editFormData.breakHours.toString()) || 0;
      }

      // Debug logging
      console.log('Updating attendance record:', {
        id: editingRecord.id,
        updateData,
        originalRecord: editingRecord,
      });

      await attendanceService.updateAttendance(
        editingRecord.id,
        updateData,
        selectedEngineer?.id
      );

      toaster.create({
        title: 'Success',
        description: 'Attendance record updated successfully',
        type: 'success',
      });

      handleCloseEditPanel();
      fetchAttendance();
    } catch (error) {
      console.error('Error updating attendance:', error);

      let errorMessage = 'Failed to update attendance record';

      if (error instanceof Error && 'response' in error) {
        const response = (
          error as {
            response?: {
              status?: number;
              statusText?: string;
              data?: { error?: string; message?: string };
            };
          }
        ).response;
        console.log('Error response:', response);

        if (response?.data?.error) {
          errorMessage = response.data.error;
        } else if (response?.data?.message) {
          errorMessage = response.data.message;
        } else if (response?.statusText) {
          errorMessage = `${response.status}: ${response.statusText}`;
        }
      }

      toaster.create({
        title: 'Error',
        description: errorMessage,
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
      await attendanceService.deleteAttendance(
        editingRecord.id,
        selectedEngineer?.id
      );
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

  // Group by date and calculate stats based on unique days
  const dayStats = new Map<
    string,
    { hasWork: boolean; hasLeave: boolean; hasAbsent: boolean }
  >();

  filteredRecords.forEach((record) => {
    const dateKey = record.workDate;
    if (!dayStats.has(dateKey)) {
      dayStats.set(dateKey, {
        hasWork: false,
        hasLeave: false,
        hasAbsent: false,
      });
    }
    const dayStat = dayStats.get(dateKey)!;

    if (record.attendanceType === 'PRESENT') dayStat.hasWork = true;
    if (record.attendanceType === 'PAID_LEAVE') dayStat.hasLeave = true;
    if (record.attendanceType === 'ABSENT') dayStat.hasAbsent = true;
  });

  const stats = {
    totalWorkDays: Array.from(dayStats.values()).filter((day) => day.hasWork)
      .length,
    totalLeave: Array.from(dayStats.values()).filter(
      (day) => day.hasLeave && !day.hasWork
    ).length,
    totalAbsent: Array.from(dayStats.values()).filter(
      (day) => day.hasAbsent && !day.hasWork && !day.hasLeave
    ).length,
  };

  // Debug logging for stats
  if (process.env.NODE_ENV === 'development') {
    console.log('Total attendance records:', attendanceRecords.length);
    console.log('Filtered records:', filteredRecords.length);
    console.log('Unique days:', dayStats.size);
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
            width={320}
            stats={stats}
            projectCounts={engineerProjectCounts}
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

                {/* Project Selection */}
                <Box px={3} pb={2}>
                  {engineerProjects.length > 0 ? (
                    <HStack gap={4} align="center">
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color="gray.700"
                        minW="100px"
                      >
                        Project:
                      </Text>
                      <select
                        value={selectedProject}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setSelectedProject(e.target.value)
                        }
                        style={{
                          width: '350px',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #E2E8F0',
                          fontSize: '14px',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                        }}
                      >
                        {engineerProjects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.project?.projectName || 'Unknown Project'}{' '}
                            -{' '}
                            {project.project?.client?.name || 'Unknown Client'}
                          </option>
                        ))}
                      </select>
                      {engineerProjects.length > 1 && (
                        <Text fontSize="xs" color="gray.500">
                          {engineerProjects.length} projects available
                        </Text>
                      )}
                    </HStack>
                  ) : (
                    <HStack gap={4} align="center">
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        No projects assigned to this engineer
                      </Text>
                    </HStack>
                  )}
                </Box>

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
