import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Grid,
  Button,
  IconButton,
} from '@chakra-ui/react';
import {
  LuX,
  LuCalendar,
  LuClock,
  LuMapPin,
  LuFileText,
  LuCheck,
  LuPlane,
  LuCalendarDays,
  LuSave,
  LuTrash2,
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

interface EditFormData {
  attendanceType: string;
  workLocation: string;
  startTime: string;
  endTime: string;
  breakHours: number;
  workDescription: string;
}

interface EditSlideOverProps {
  isOpen: boolean;
  record: AttendanceRecord | null;
  formData: EditFormData;
  onClose: () => void;
  onFormChange: (data: Partial<EditFormData>) => void;
  onSave: () => void;
  onDelete: () => void;
  saving?: boolean;
}

export function EditSlideOver({
  isOpen,
  record,
  formData,
  onClose,
  onFormChange,
  onSave,
  onDelete,
  saving = false,
}: EditSlideOverProps) {
  if (!isOpen || !record) return null;

  const attendanceTypes = [
    {
      value: 'PRESENT',
      label: 'Present',
      icon: <LuCheck size={20} />,
      color: 'green',
    },
    {
      value: 'PAID_LEAVE',
      label: 'Paid Leave',
      icon: <LuPlane size={20} />,
      color: 'blue',
    },
    { value: 'ABSENT', label: 'Absent', icon: <LuX size={20} />, color: 'red' },
    {
      value: 'LEGAL_HOLIDAY',
      label: 'Holiday',
      icon: <LuCalendarDays size={20} />,
      color: 'purple',
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <Box
        position="fixed"
        inset={0}
        bg="blackAlpha.600"
        zIndex={999}
        onClick={onClose}
      />

      {/* Slide-Over Panel */}
      <Box
        position="fixed"
        right={0}
        top={0}
        bottom={0}
        w={{ base: '100%', md: '500px' }}
        bg="white"
        shadow="2xl"
        zIndex={1000}
        overflowY="auto"
        animation="slideIn 0.3s ease-out"
        css={{
          '@keyframes slideIn': {
            from: {
              transform: 'translateX(100%)',
            },
            to: {
              transform: 'translateX(0)',
            },
          },
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#CBD5E0',
            borderRadius: '4px',
          },
        }}
      >
        <VStack align="stretch" gap={0} h="full">
          {/* Header */}
          <Box
            p={6}
            borderBottom="1px solid"
            borderColor="gray.200"
            bg="gray.50"
          >
            <HStack justify="space-between" mb={4}>
              <Text fontSize="xl" fontWeight="bold">
                Edit Attendance
              </Text>
              <IconButton
                aria-label="Close"
                onClick={onClose}
                variant="ghost"
                size="sm"
              >
                <LuX />
              </IconButton>
            </HStack>

            {/* Date Info */}
            <HStack gap={2} p={3} bg="blue.50" borderRadius="md">
              <LuCalendar size={20} color="#3182CE" />
              <Text fontSize="sm" fontWeight="medium" color="blue.900">
                {new Date(record.workDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </HStack>
          </Box>

          {/* Form */}
          <Box flex={1} p={6}>
            <VStack align="stretch" gap={6}>
              {/* Attendance Type */}
              <Box>
                <Text fontSize="sm" mb={3} fontWeight="semibold">
                  Attendance Type *
                </Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                  {attendanceTypes.map((type) => (
                    <Box
                      key={type.value}
                      as="button"
                      p={3}
                      borderRadius="lg"
                      border="2px solid"
                      borderColor={
                        formData.attendanceType === type.value
                          ? `${type.color}.500`
                          : 'gray.200'
                      }
                      bg={
                        formData.attendanceType === type.value
                          ? `${type.color}.50`
                          : 'white'
                      }
                      onClick={() =>
                        onFormChange({ attendanceType: type.value })
                      }
                      _hover={{
                        borderColor: `${type.color}.300`,
                        bg: `${type.color}.50`,
                      }}
                      transition="all 0.2s"
                    >
                      <VStack gap={2}>
                        <Box color={`${type.color}.600`}>{type.icon}</Box>
                        <Text fontSize="xs" fontWeight="medium">
                          {type.label}
                        </Text>
                      </VStack>
                    </Box>
                  ))}
                </Grid>
              </Box>

              {/* Work Location */}
              {formData.attendanceType === 'PRESENT' && (
                <Box>
                  <HStack mb={2}>
                    <LuMapPin size={16} />
                    <Text fontSize="sm" fontWeight="semibold">
                      Work Location
                    </Text>
                  </HStack>
                  <Input
                    value={formData.workLocation}
                    onChange={(e) =>
                      onFormChange({ workLocation: e.target.value })
                    }
                    placeholder="e.g., Office, Remote, Client Site"
                  />
                </Box>
              )}

              {/* Time */}
              {formData.attendanceType === 'PRESENT' && (
                <Box>
                  <HStack mb={2}>
                    <LuClock size={16} />
                    <Text fontSize="sm" fontWeight="semibold">
                      Work Hours
                    </Text>
                  </HStack>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <Box>
                      <Text fontSize="xs" mb={1} color="gray.600">
                        Start Time
                      </Text>
                      <Input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) =>
                          onFormChange({ startTime: e.target.value })
                        }
                      />
                    </Box>
                    <Box>
                      <Text fontSize="xs" mb={1} color="gray.600">
                        End Time
                      </Text>
                      <Input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) =>
                          onFormChange({ endTime: e.target.value })
                        }
                      />
                    </Box>
                  </Grid>
                </Box>
              )}

              {/* Break Hours */}
              {formData.attendanceType === 'PRESENT' && (
                <Box>
                  <Text fontSize="sm" mb={2} fontWeight="semibold">
                    Break Hours
                  </Text>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="8"
                    value={formData.breakHours}
                    onChange={(e) =>
                      onFormChange({
                        breakHours: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </Box>
              )}

              {/* Work Description */}
              <Box>
                <HStack mb={2}>
                  <LuFileText size={16} />
                  <Text fontSize="sm" fontWeight="semibold">
                    Description
                  </Text>
                </HStack>
                <textarea
                  value={formData.workDescription}
                  onChange={(e) =>
                    onFormChange({ workDescription: e.target.value })
                  }
                  placeholder="Describe the work done or reason for leave..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </Box>
            </VStack>
          </Box>

          {/* Footer */}
          <Box p={6} borderTop="1px solid" borderColor="gray.200" bg="gray.50">
            <VStack gap={3}>
              <HStack justify="flex-end" w="full" gap={3}>
                <Button onClick={onClose} variant="outline">
                  Cancel
                </Button>
                <Button onClick={onSave} colorScheme="blue" loading={saving}>
                  <HStack gap={2}>
                    <LuSave size={16} />
                    <Text>Save Changes</Text>
                  </HStack>
                </Button>
              </HStack>
              <Button
                onClick={onDelete}
                colorScheme="red"
                variant="ghost"
                w="full"
                size="sm"
              >
                <HStack gap={2}>
                  <LuTrash2 size={16} />
                  <Text>Delete Record</Text>
                </HStack>
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </>
  );
}
