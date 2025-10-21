'use client';

import { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Text,
  Card,
  Button,
  Badge,
  Spinner,
  Table,
  Box,
  IconButton,
  Stack,
} from '@chakra-ui/react';
import {
  LuFileText,
  LuDownload,
  LuEye,
  LuRefreshCw,
  LuFilter,
  LuFileSpreadsheet,
  LuTrash2,
} from 'react-icons/lu';
import { toaster } from '@/components/ui/toaster';
import { salesService } from '@/shared/service/salesService';
import { MonthlyReport } from '@/shared/types/report.types';
import apiClient from '@/shared/lib/api-client';

interface Engineer {
  id: string;
  fullName: string;
}

interface Project {
  id: string;
  projectName: string;
}

export function ViewAllReports() {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingReport, setDeletingReport] = useState(false);

  // Filters
  const [filterEngineer, setFilterEngineer] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEngineer, filterProject, filterStatus, filterYear, filterMonth]);

  const fetchInitialData = async () => {
    try {
      const [engineersRes, projectsRes] = await Promise.all([
        apiClient.get('/users?role=ENGINEER'),
        apiClient.get('/projects'),
      ]);

      if (engineersRes.data?.success) {
        setEngineers(engineersRes.data.data || []);
      }
      if (projectsRes.data?.success) {
        setProjects(projectsRes.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const filters: {
        engineerId?: string;
        projectId?: string;
        status?: string;
        year?: number;
        month?: number;
      } = {};
      if (filterEngineer) filters.engineerId = filterEngineer;
      if (filterProject) filters.projectId = filterProject;
      if (filterStatus) filters.status = filterStatus;
      if (filterYear) filters.year = parseInt(filterYear);
      if (filterMonth) filters.month = parseInt(filterMonth);

      const response = await salesService.getAllReports(filters);
      if (response.success) {
        setReports(response.data || []);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toaster.create({
        title: 'Error',
        description: errorMessage || 'Failed to fetch reports',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (report: MonthlyReport) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = (report: MonthlyReport) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setIsStatusModalOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedReport || !newStatus) return;

    try {
      setUpdatingStatus(true);
      const response = await salesService.updateReportStatus(
        selectedReport.id,
        newStatus
      );

      if (response.success) {
        toaster.create({
          title: 'Success',
          description: 'Report status updated successfully',
          type: 'success',
        });
        setIsStatusModalOpen(false);
        fetchReports();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toaster.create({
        title: 'Error',
        description: errorMessage || 'Failed to update status',
        type: 'error',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDownload = async (reportId: string, format: 'excel' | 'pdf') => {
    try {
      const blob =
        format === 'excel'
          ? await salesService.downloadReportExcel(reportId)
          : await salesService.downloadReportPDF(reportId);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toaster.create({
        title: 'Success',
        description: `Report downloaded successfully`,
        type: 'success',
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toaster.create({
        title: 'Error',
        description: errorMessage || 'Failed to download report',
        type: 'error',
      });
    }
  };

  const handleDeleteReport = async () => {
    if (!selectedReport) return;

    if (
      !confirm(
        'Are you sure you want to delete this report? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setDeletingReport(true);
      await salesService.deleteReport(selectedReport.id);

      toaster.create({
        title: 'Success',
        description: 'Report deleted successfully',
        type: 'success',
      });

      setIsDetailModalOpen(false);
      setSelectedReport(null);
      fetchReports(); // Refresh the list
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toaster.create({
        title: 'Error',
        description: errorMessage || 'Failed to delete report',
        type: 'error',
      });
    } finally {
      setDeletingReport(false);
    }
  };

  const clearFilters = () => {
    setFilterEngineer('');
    setFilterProject('');
    setFilterStatus('');
    setFilterYear('');
    setFilterMonth('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'gray';
      case 'SUBMITTED':
        return 'blue';
      case 'APPROVED':
        return 'green';
      default:
        return 'gray';
    }
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(typeof value === 'string' ? parseFloat(value) : value);
  };

  const formatMonth = (month: number) => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months[month - 1];
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <VStack align="stretch" gap={6}>
      {/* Filters */}
      <Card.Root>
        <Card.Body p={6}>
          <VStack align="stretch" gap={4}>
            <HStack justify="space-between">
              <HStack gap={2}>
                <LuFilter size={20} />
                <Text fontSize="lg" fontWeight="bold">
                  Filters
                </Text>
              </HStack>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearFilters}
                leftIcon={<LuRefreshCw size={14} />}
              >
                Clear All
              </Button>
            </HStack>

            <Stack
              direction={{ base: 'column', md: 'row' }}
              gap={4}
              align="start"
            >
              <Box flex={1}>
                <Text fontSize="sm" mb={2} fontWeight="medium">
                  Engineer
                </Text>
                <select
                  value={filterEngineer}
                  onChange={(e) => setFilterEngineer(e.target.value)}
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">All Engineers</option>
                  {engineers.map((eng) => (
                    <option key={eng.id} value={eng.id}>
                      {eng.fullName}
                    </option>
                  ))}
                </select>
              </Box>

              <Box flex={1}>
                <Text fontSize="sm" mb={2} fontWeight="medium">
                  Project
                </Text>
                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">All Projects</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.projectName}
                    </option>
                  ))}
                </select>
              </Box>

              <Box flex={1}>
                <Text fontSize="sm" mb={2} fontWeight="medium">
                  Status
                </Text>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="APPROVED">Approved</option>
                </select>
              </Box>

              <Box flex={1}>
                <Text fontSize="sm" mb={2} fontWeight="medium">
                  Year
                </Text>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">All Years</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </Box>

              <Box flex={1}>
                <Text fontSize="sm" mb={2} fontWeight="medium">
                  Month
                </Text>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">All Months</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </Box>
            </Stack>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Reports Table */}
      <Card.Root>
        <Card.Body p={0}>
          {loading ? (
            <HStack justify="center" p={8}>
              <Spinner size="lg" />
              <Text>Loading reports...</Text>
            </HStack>
          ) : reports.length === 0 ? (
            <VStack p={8} gap={2}>
              <Text fontSize="lg" color="gray.500">
                No reports found
              </Text>
              <Text fontSize="sm" color="gray.400">
                Try adjusting your filters or generate a new report
              </Text>
            </VStack>
          ) : (
            <>
              {/* Desktop Table */}
              <Box display={{ base: 'none', lg: 'block' }} overflowX="auto">
                <Table.Root size="sm">
                  <Table.Header>
                    <Table.Row bg="gray.50">
                      <Table.ColumnHeader>Period</Table.ColumnHeader>
                      <Table.ColumnHeader>Engineer</Table.ColumnHeader>
                      <Table.ColumnHeader>Project</Table.ColumnHeader>
                      <Table.ColumnHeader>Client</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="right">
                        Hours
                      </Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="right">
                        Amount
                      </Table.ColumnHeader>
                      <Table.ColumnHeader>Status</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="center">
                        Actions
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {reports.map((report) => (
                      <Table.Row key={report.id}>
                        <Table.Cell>
                          <Text fontWeight="medium">
                            {formatMonth(report.reportMonth)}{' '}
                            {report.reportYear}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <VStack align="start" gap={0}>
                            <Text fontSize="sm" fontWeight="medium">
                              {report.projectAssignment?.engineer.fullName}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {report.projectAssignment?.engineer.email}
                            </Text>
                          </VStack>
                        </Table.Cell>
                        <Table.Cell>
                          {report.projectAssignment?.project.projectName}
                        </Table.Cell>
                        <Table.Cell>
                          {report.projectAssignment?.project.client.name}
                        </Table.Cell>
                        <Table.Cell textAlign="right">
                          {parseFloat(report.totalWorkHours).toFixed(1)}h
                        </Table.Cell>
                        <Table.Cell textAlign="right" fontWeight="bold">
                          {formatCurrency(report.finalBillingAmount)}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge colorPalette={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <HStack justify="center" gap={1}>
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => handleViewDetails(report)}
                            >
                              View
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => handleUpdateStatus(report)}
                              disabled={report.status === 'APPROVED'}
                            >
                              Status
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => handleDownload(report.id, 'excel')}
                            >
                              Excel
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => handleDownload(report.id, 'pdf')}
                            >
                              PDF
                            </Button>
                          </HStack>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>

              {/* Mobile Cards */}
              <VStack
                display={{ base: 'flex', lg: 'none' }}
                gap={3}
                p={4}
                align="stretch"
              >
                {reports.map((report) => (
                  <Card.Root key={report.id} size="sm">
                    <Card.Body p={4}>
                      <VStack align="stretch" gap={3}>
                        <HStack justify="space-between">
                          <Text fontWeight="bold">
                            {formatMonth(report.reportMonth)}{' '}
                            {report.reportYear}
                          </Text>
                          <Badge colorPalette={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                        </HStack>

                        <VStack align="start" gap={1} fontSize="sm">
                          <HStack>
                            <Text color="gray.600" minW="80px">
                              Engineer:
                            </Text>
                            <Text fontWeight="medium">
                              {report.projectAssignment?.engineer.fullName}
                            </Text>
                          </HStack>
                          <HStack>
                            <Text color="gray.600" minW="80px">
                              Project:
                            </Text>
                            <Text>
                              {report.projectAssignment?.project.projectName}
                            </Text>
                          </HStack>
                          <HStack>
                            <Text color="gray.600" minW="80px">
                              Hours:
                            </Text>
                            <Text>
                              {parseFloat(report.totalWorkHours).toFixed(1)}h
                            </Text>
                          </HStack>
                          <HStack>
                            <Text color="gray.600" minW="80px">
                              Amount:
                            </Text>
                            <Text fontWeight="bold">
                              {formatCurrency(report.finalBillingAmount)}
                            </Text>
                          </HStack>
                        </VStack>

                        <HStack gap={2} flexWrap="wrap">
                          <Button
                            size="xs"
                            flex={1}
                            onClick={() => handleViewDetails(report)}
                            leftIcon={<LuEye size={14} />}
                          >
                            View
                          </Button>
                          <Button
                            size="xs"
                            flex={1}
                            onClick={() => handleUpdateStatus(report)}
                            disabled={report.status === 'APPROVED'}
                            leftIcon={<LuFileText size={14} />}
                          >
                            Status
                          </Button>
                          <IconButton
                            size="xs"
                            onClick={() => handleDownload(report.id, 'excel')}
                            aria-label="Download Excel"
                          >
                            <LuFileSpreadsheet size={14} />
                          </IconButton>
                          <IconButton
                            size="xs"
                            onClick={() => handleDownload(report.id, 'pdf')}
                            aria-label="Download PDF"
                          >
                            <LuDownload size={14} />
                          </IconButton>
                        </HStack>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                ))}
              </VStack>
            </>
          )}
        </Card.Body>
      </Card.Root>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedReport && (
        <>
          {/* Backdrop */}
          <Box
            position="fixed"
            inset={0}
            bg="blackAlpha.600"
            zIndex={999}
            onClick={() => setIsDetailModalOpen(false)}
          />

          {/* Modal */}
          <Box
            position="fixed"
            top={{ base: '20px', md: '50%' }}
            left={{ base: '20px', md: '50%' }}
            right={{ base: '20px', md: 'auto' }}
            transform={{ base: 'none', md: 'translate(-50%, -50%)' }}
            bg="white"
            borderRadius="lg"
            shadow="2xl"
            zIndex={1000}
            w={{ base: 'auto', md: '600px' }}
            maxH={{ base: 'calc(100vh - 40px)', md: '80vh' }}
            overflowY="auto"
            p={{ base: 5, md: 6 }}
          >
            <VStack align="stretch" gap={4}>
              {/* Header */}
              <HStack
                justify="space-between"
                pb={3}
                borderBottom="1px solid"
                borderColor="gray.200"
              >
                <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold">
                  Report Details
                </Text>
                <Box
                  as="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  cursor="pointer"
                  fontSize="24px"
                  color="gray.500"
                  _hover={{ color: 'gray.700' }}
                >
                  ✕
                </Box>
              </HStack>

              {/* Content */}
              <VStack align="stretch" gap={4}>
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="bold">
                    {formatMonth(selectedReport.reportMonth)}{' '}
                    {selectedReport.reportYear}
                  </Text>
                  <Badge
                    colorPalette={getStatusColor(selectedReport.status)}
                    size="lg"
                  >
                    {selectedReport.status}
                  </Badge>
                </HStack>

                <VStack align="stretch" gap={3} fontSize="sm">
                  <HStack>
                    <Text color="gray.600" minW="150px">
                      Engineer:
                    </Text>
                    <Text fontWeight="medium">
                      {selectedReport.projectAssignment?.engineer.fullName}
                    </Text>
                  </HStack>
                  <HStack>
                    <Text color="gray.600" minW="150px">
                      Project:
                    </Text>
                    <Text>
                      {selectedReport.projectAssignment?.project.projectName}
                    </Text>
                  </HStack>
                  <HStack>
                    <Text color="gray.600" minW="150px">
                      Client:
                    </Text>
                    <Text>
                      {selectedReport.projectAssignment?.project.client.name}
                    </Text>
                  </HStack>
                  <HStack>
                    <Text color="gray.600" minW="150px">
                      Total Work Days:
                    </Text>
                    <Text fontWeight="medium">
                      {selectedReport.totalWorkDays}
                    </Text>
                  </HStack>
                  <HStack>
                    <Text color="gray.600" minW="150px">
                      Total Work Hours:
                    </Text>
                    <Text fontWeight="medium">
                      {parseFloat(selectedReport.totalWorkHours).toFixed(2)}h
                    </Text>
                  </HStack>
                  <HStack>
                    <Text color="gray.600" minW="150px">
                      Excess Hours:
                    </Text>
                    <Text color="green.600">
                      {parseFloat(selectedReport.excessHours).toFixed(2)}h
                    </Text>
                  </HStack>
                  <HStack>
                    <Text color="gray.600" minW="150px">
                      Shortage Hours:
                    </Text>
                    <Text color="red.600">
                      {parseFloat(selectedReport.shortageHours).toFixed(2)}h
                    </Text>
                  </HStack>
                  <HStack>
                    <Text color="gray.600" minW="150px">
                      Total Amount:
                    </Text>
                    <Text>{formatCurrency(selectedReport.totalAmount)}</Text>
                  </HStack>
                  <HStack>
                    <Text color="gray.600" minW="150px">
                      Settlement Adjustment:
                    </Text>
                    <Text>
                      {formatCurrency(selectedReport.settlementAdjustment)}
                    </Text>
                  </HStack>
                  <HStack>
                    <Text color="gray.600" minW="150px">
                      Final Billing Amount:
                    </Text>
                    <VStack align="start" gap={0}>
                      <Text fontWeight="bold" fontSize="md">
                        {formatCurrency(selectedReport.finalBillingAmount)}
                      </Text>
                      {parseFloat(selectedReport.finalBillingAmount) === 0 &&
                        parseFloat(selectedReport.settlementAdjustment) < 0 && (
                          <Text fontSize="xs" color="orange.600">
                            (Capped at ¥0 - shortage exceeded base amount)
                          </Text>
                        )}
                    </VStack>
                  </HStack>
                </VStack>
              </VStack>

              {/* Info Box */}
              <Box
                bg={selectedReport.status === 'DRAFT' ? 'blue.50' : 'gray.50'}
                borderLeft="4px solid"
                borderColor={
                  selectedReport.status === 'DRAFT' ? 'blue.500' : 'gray.400'
                }
                p={3}
                borderRadius="md"
              >
                <Text fontSize="sm" color="gray.700">
                  {selectedReport.status === 'DRAFT' ? (
                    <>
                      <strong>Note:</strong> This report is in DRAFT status and
                      can be deleted. Once submitted or approved, deletion will
                      no longer be available.
                    </>
                  ) : (
                    <>
                      <strong>Info:</strong> This report has been{' '}
                      {selectedReport.status.toLowerCase()} and cannot be
                      deleted. Only DRAFT reports can be removed.
                    </>
                  )}
                </Text>
              </Box>

              {/* Footer */}
              <HStack justify="space-between" pt={3}>
                {selectedReport.status === 'DRAFT' && (
                  <Button
                    colorPalette="red"
                    variant="outline"
                    onClick={handleDeleteReport}
                    loading={deletingReport}
                  >
                    <LuTrash2 />
                    Delete Report
                  </Button>
                )}
                <Box flex={1} />
                <Button
                  variant="outline"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Close
                </Button>
              </HStack>
            </VStack>
          </Box>
        </>
      )}

      {/* Status Update Modal */}
      {isStatusModalOpen && selectedReport && (
        <>
          {/* Backdrop */}
          <Box
            position="fixed"
            inset={0}
            bg="blackAlpha.600"
            zIndex={999}
            onClick={() => setIsStatusModalOpen(false)}
          />

          {/* Modal */}
          <Box
            position="fixed"
            top={{ base: '20px', md: '50%' }}
            left={{ base: '20px', md: '50%' }}
            right={{ base: '20px', md: 'auto' }}
            transform={{ base: 'none', md: 'translate(-50%, -50%)' }}
            bg="white"
            borderRadius="lg"
            shadow="2xl"
            zIndex={1000}
            w={{ base: 'auto', md: '500px' }}
            maxH={{ base: 'calc(100vh - 40px)', md: '80vh' }}
            overflowY="auto"
            p={{ base: 5, md: 6 }}
          >
            <VStack align="stretch" gap={4}>
              {/* Header */}
              <HStack
                justify="space-between"
                pb={3}
                borderBottom="1px solid"
                borderColor="gray.200"
              >
                <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold">
                  Update Report Status
                </Text>
                <Box
                  as="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  cursor="pointer"
                  fontSize="24px"
                  color="gray.500"
                  _hover={{ color: 'gray.700' }}
                >
                  ✕
                </Box>
              </HStack>

              {/* Content */}
              <VStack align="stretch" gap={4}>
                <Text fontSize="sm" color="gray.600">
                  Current Status:{' '}
                  <Badge colorPalette={getStatusColor(selectedReport.status)}>
                    {selectedReport.status}
                  </Badge>
                </Text>

                <Box>
                  <Text fontSize="sm" mb={2} fontWeight="medium">
                    New Status{' '}
                    <Text as="span" color="red.500">
                      *
                    </Text>
                  </Text>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    disabled={updatingStatus}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: 'white',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">Select status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="APPROVED">Approved</option>
                  </select>
                </Box>

                <Card.Root bg="yellow.50" borderColor="yellow.200">
                  <Card.Body p={3}>
                    <Text fontSize="xs" color="yellow.900">
                      ⚠️ Note: Status transitions must follow: DRAFT → SUBMITTED
                      → APPROVED. Cannot revert once approved.
                    </Text>
                  </Card.Body>
                </Card.Root>
              </VStack>

              {/* Footer */}
              <HStack justify="flex-end" gap={3} pt={3}>
                <Button
                  variant="outline"
                  onClick={() => setIsStatusModalOpen(false)}
                  disabled={updatingStatus}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={confirmStatusUpdate}
                  loading={updatingStatus}
                  disabled={!newStatus || updatingStatus}
                >
                  Update Status
                </Button>
              </HStack>
            </VStack>
          </Box>
        </>
      )}
    </VStack>
  );
}
