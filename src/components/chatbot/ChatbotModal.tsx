'use client';

import { useState, useEffect, useRef, useContext } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Input,
  Card,
  Portal,
  Grid,
} from '@chakra-ui/react';
import {
  LuX,
  LuBot,
  LuCopy,
  LuCalendar,
  LuClock,
  LuActivity,
  LuFileText,
  LuTrendingUp,
  LuCalendarDays,
  LuCalendarCheck,
} from 'react-icons/lu';

import chatbotService from '@/shared/service/chatbotService';
import { toaster } from '@/components/ui/toaster';
import { AuthContext } from '@/context/AuthContext';
import { attendanceService } from '@/shared/service/attendanceService';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'action-buttons';
  content: string;
  timestamp: Date;
  reaction?: string;
}

interface QuestionButton {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  questionId: string;
  category: string;
  requiresParams: boolean;
}

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProjectAssignment {
  id: string;
  project: {
    id: string;
    projectName: string;
  };
}

interface ProjectInfo {
  id: string;
  projectName: string;
}

export const ChatbotModal: React.FC<ChatbotModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState<Message[]>([]);
  //   const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(true);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);
  const [loadingButtonId, setLoadingButtonId] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<
    'loading' | 'success' | null
  >(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Parameter modal state
  const [isParamModalOpen, setIsParamModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] =
    useState<QuestionButton | null>(null);
  const [parameters, setParameters] = useState<Record<string, string>>({});

  // User's projects
  const [userProjects, setUserProjects] = useState<
    Array<{ id: string; projectName: string }>
  >([]);

  // Generate month options (last 12 months + current + next 2 months)
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();

    for (let i = -12; i <= 2; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + i,
        1
      );
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const monthName = date.toLocaleString('default', { month: 'long' });

      options.push({
        value: `${year}-${month}`,
        label: `${monthName} ${year}`,
      });
    }

    return options;
  };

  const monthOptions = generateMonthOptions();

  // Fetch user's assigned projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user?.id || !isOpen) return;

      try {
        // Use the existing attendance service to fetch ALL projects
        const response = await attendanceService.getAllProjects();

        if (response.success && response.data) {
          const assignments = response.data as ProjectAssignment[];
          const projects = assignments
            .filter((assignment: ProjectAssignment) => assignment.project)
            .map(
              (assignment: ProjectAssignment): ProjectInfo => ({
                id: assignment.project.id,
                projectName: assignment.project.projectName,
              })
            );

          // Remove duplicates
          const uniqueProjects = projects.filter(
            (project: ProjectInfo, index: number, self: ProjectInfo[]) =>
              index === self.findIndex((p: ProjectInfo) => p.id === project.id)
          );

          setUserProjects(uniqueProjects);
        }
      } catch (error) {
        console.warn(
          'Could not fetch projects for chatbot:',
          error instanceof Error ? error.message : 'Unknown error'
        );
        setUserProjects([]); // Empty array as fallback
      }
    };

    fetchProjects();
  }, [user, isOpen]);

  // Question templates with action buttons
  const questionButtons: QuestionButton[] = [
    {
      id: '1',
      label: 'Monthly Attendance Summary',
      icon: LuActivity,
      description: 'View your attendance for a specific month',
      questionId: 'attendance_summary_month',
      category: 'attendance',
      requiresParams: true,
    },
    {
      id: '2',
      label: 'Overtime Analysis',
      icon: LuClock,
      description: 'Check overtime hours for a month',
      questionId: 'overtime_analysis_month',
      category: 'overtime',
      requiresParams: true,
    },
    {
      id: '3',
      label: 'Leave Balance',
      icon: LuCalendarCheck,
      description: 'Check your remaining paid leave days',
      questionId: 'leave_balance',
      category: 'leave',
      requiresParams: false,
    },
    {
      id: '4',
      label: 'Project Hours',
      icon: LuFileText,
      description: 'View hours worked on a specific project',
      questionId: 'project_hours_month',
      category: 'project',
      requiresParams: true,
    },
    {
      id: '5',
      label: 'Compare Months',
      icon: LuTrendingUp,
      description: 'Compare attendance between two months',
      questionId: 'monthly_comparison',
      category: 'comparison',
      requiresParams: true,
    },
    {
      id: '6',
      label: 'Specific Date Attendance',
      icon: LuCalendar,
      description: 'Check attendance for a specific date',
      questionId: 'attendance_on_date',
      category: 'date',
      requiresParams: true,
    },
    {
      id: '7',
      label: 'Last Day Off',
      icon: LuCalendarDays,
      description: 'Find your most recent day off',
      questionId: 'last_day_off',
      category: 'leave',
      requiresParams: false,
    },
  ];

  // Initialize chatbot with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: '1',
          type: 'bot',
          content: `👋 Hello ${user?.fullName || 'there'}! I'm your AI attendance assistant. How can I help you today?`,
          timestamp: new Date(),
        },
        {
          id: '2',
          type: 'action-buttons',
          content: '',
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length, user]);

  // Auto-scroll to bottom when new messages arrive with smooth animation
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      });
    };

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Initialize parameters with default values
  const initializeParameters = (questionId: string) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .slice(0, 7);

    switch (questionId) {
      case 'attendance_summary_month':
      case 'overtime_analysis_month':
        setParameters({ month: currentMonth });
        break;
      case 'project_hours_month':
        setParameters({
          project: userProjects[0]?.projectName || '',
          month: currentMonth,
        });
        break;
      case 'monthly_comparison':
        setParameters({
          month1: lastMonth,
          month2: currentMonth,
        });
        break;
      case 'attendance_on_date':
        setParameters({
          date: new Date().toISOString().split('T')[0],
        });
        break;
      default:
        setParameters({});
    }
  };

  // Handle action button click
  const handleActionButtonClick = (button: QuestionButton) => {
    if (button.requiresParams) {
      // Open parameter selection modal
      setSelectedQuestion(button);
      initializeParameters(button.questionId);
      setIsParamModalOpen(true);
    } else {
      // Send query directly without parameters
      setLoadingButtonId(button.id);
      sendQuery(button.questionId, {});
    }
  };

  // Handle parameter modal submission
  const handleParamModalSubmit = () => {
    if (!selectedQuestion) return;

    // Validate parameters
    if (
      selectedQuestion.questionId === 'project_hours_month' &&
      !parameters.project
    ) {
      toaster.create({
        title: 'Missing Information',
        description: 'Please select a project',
        type: 'warning',
      });
      return;
    }

    setIsParamModalOpen(false);
    sendQuery(selectedQuestion.questionId, parameters);
    setSelectedQuestion(null);
  };

  // Copy message to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toaster.create({
        title: 'Copied!',
        description: 'Message copied to clipboard',
        type: 'success',
        duration: 2000,
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Add reaction to message
  const addReaction = (messageId: string, reaction: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              reaction: msg.reaction === reaction ? undefined : reaction,
            }
          : msg
      )
    );
  };

  // Generate follow-up suggestions based on query type
  const generateFollowUps = (questionId: string): string[] => {
    const followUps: Record<string, string[]> = {
      attendance_summary_month: [
        'Show me overtime for this month',
        'Compare with last month',
        "What's my leave balance?",
      ],
      overtime_analysis_month: [
        'Show monthly attendance summary',
        'Check project hours',
        'When was my last day off?',
      ],
      leave_balance: [
        'Show attendance summary',
        'When was my last day off?',
        'Check overtime hours',
      ],
      project_hours_month: [
        'Show total monthly hours',
        'Compare with other projects',
        'Check overtime analysis',
      ],
      monthly_comparison: [
        'Show current month details',
        'Check leave balance',
        'Analyze overtime trends',
      ],
      attendance_on_date: [
        'Show weekly summary',
        'Check nearby dates',
        'View monthly overview',
      ],
      last_day_off: [
        'Check leave balance',
        'Show recent attendance',
        'Plan next time off',
      ],
    };

    return (
      followUps[questionId] || [
        'Show monthly summary',
        'Check leave balance',
        'View overtime analysis',
      ]
    );
  };

  // Send query to chatbot
  const sendQuery = async (
    questionId: string,
    params: Record<string, string>
  ) => {
    setShowActionButtons(false);
    setIsLoading(true);
    setLoadingState('loading');

    try {
      // Build user query
      const userQuery = chatbotService.buildUserQuery(questionId, params);

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: userQuery,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Format parameters correctly
      const formattedParams = chatbotService.formatParameters(
        questionId,
        params
      );

      // Send query to backend
      const response = await chatbotService.sendQuery({
        questionId,
        userQuery,
        ...(Object.keys(formattedParams).length > 0
          ? { parameters: formattedParams }
          : {}),
      });

      if (response.success && response.data) {
        // Add bot response
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: response.data.response,
          timestamp: new Date(),
        };
        // Show success state briefly before adding message
        setLoadingState('success');

        setTimeout(() => {
          setMessages((prev) => [...prev, botMessage]);
          setFollowUpSuggestions(generateFollowUps(questionId));
          setLoadingState(null);
        }, 1000);
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `❌ Sorry, I encountered an error: ${
          error instanceof Error ? error.message : 'Please try again.'
        }`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toaster.create({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to process query',
        type: 'error',
        duration: 4000,
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setLoadingButtonId(null);
        setShowActionButtons(true);
      }, 1000);
    }
  };

  // Render parameter input fields based on question type
  const renderParameterInputs = () => {
    if (!selectedQuestion) return null;

    const selectStyle = {
      width: '100%',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #e2e8f0',
      fontSize: '14px',
      backgroundColor: 'white',
      cursor: 'pointer',
    };

    switch (selectedQuestion.questionId) {
      case 'attendance_summary_month':
      case 'overtime_analysis_month':
        return (
          <VStack align="stretch" gap={2}>
            <Text fontSize="sm" fontWeight="medium">
              Select Month
            </Text>
            <select
              value={parameters.month || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setParameters({ ...parameters, month: e.target.value })
              }
              style={selectStyle}
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </VStack>
        );

      case 'project_hours_month':
        return (
          <>
            <VStack align="stretch" gap={2}>
              <Text fontSize="sm" fontWeight="medium">
                Select Project
              </Text>
              <select
                value={parameters.project || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setParameters({ ...parameters, project: e.target.value })
                }
                style={selectStyle}
              >
                <option value="">-- Select Project --</option>
                {userProjects.map((project) => (
                  <option key={project.id} value={project.projectName}>
                    {project.projectName}
                  </option>
                ))}
              </select>
            </VStack>
            <VStack align="stretch" gap={2}>
              <Text fontSize="sm" fontWeight="medium">
                Select Month
              </Text>
              <select
                value={parameters.month || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setParameters({ ...parameters, month: e.target.value })
                }
                style={selectStyle}
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </VStack>
          </>
        );

      case 'monthly_comparison':
        return (
          <>
            <VStack align="stretch" gap={2}>
              <Text fontSize="sm" fontWeight="medium">
                First Month
              </Text>
              <select
                value={parameters.month1 || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setParameters({ ...parameters, month1: e.target.value })
                }
                style={selectStyle}
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </VStack>
            <VStack align="stretch" gap={2}>
              <Text fontSize="sm" fontWeight="medium">
                Second Month
              </Text>
              <select
                value={parameters.month2 || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setParameters({ ...parameters, month2: e.target.value })
                }
                style={selectStyle}
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </VStack>
          </>
        );

      case 'attendance_on_date':
        return (
          <VStack align="stretch" gap={2}>
            <Text fontSize="sm" fontWeight="medium">
              Select Date
            </Text>
            <Input
              type="date"
              value={parameters.date || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setParameters({ ...parameters, date: e.target.value })
              }
              max={new Date().toISOString().split('T')[0]}
              size="md"
            />
          </VStack>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Success Animation Keyframes */}
      <style jsx>{`
        @keyframes successBounce {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.3);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
      <Portal>
        {/* Backdrop */}
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          zIndex="1400"
          onClick={onClose}
        />

        {/* Modal Content */}
        <Box
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          width={{ base: '95%', md: '600px' }}
          maxHeight="80vh"
          bg="white"
          borderRadius="xl"
          boxShadow="2xl"
          border="1px solid"
          borderColor="blue.100"
          zIndex="1500"
          display="flex"
          flexDirection="column"
          _before={{
            content: '""',
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            right: '-2px',
            bottom: '-2px',
            borderRadius: 'xl',
            background:
              'linear-gradient(135deg, rgba(66,153,225,0.3), rgba(66,153,225,0.1), rgba(66,153,225,0.3))',
            zIndex: -1,
          }}
        >
          {/* Header */}
          <HStack
            justify="space-between"
            p={5}
            borderBottom="1px solid"
            borderColor="rgba(255,255,255,0.2)"
            bg="blue.600"
            color="white"
            borderTopRadius="xl"
            position="relative"
          >
            <VStack align="start" gap={1} position="relative" zIndex={1}>
              <HStack gap={3} align="center">
                <Box
                  bg="rgba(255,255,255,0.15)"
                  borderRadius="full"
                  p={2}
                  border="1px solid rgba(255,255,255,0.3)"
                  boxShadow="0 4px 12px rgba(0,0,0,0.2)"
                >
                  <LuBot size={20} />
                </Box>
                <VStack align="start" gap={0}>
                  <Text
                    fontSize="lg"
                    fontWeight="bold"
                    letterSpacing="tight"
                    textShadow="0 1px 2px rgba(0,0,0,0.1)"
                  >
                    AI Attendance Assistant
                  </Text>
                  <HStack gap={2} align="center">
                    <Box
                      w="8px"
                      h="8px"
                      bg="green.400"
                      borderRadius="full"
                      boxShadow="0 0 8px rgba(72, 187, 120, 0.6)"
                    />
                    <Text
                      fontSize="xs"
                      opacity={0.95}
                      fontWeight="medium"
                      textShadow="0 1px 1px rgba(0,0,0,0.1)"
                    >
                      Online • Ready to help
                    </Text>
                  </HStack>
                </VStack>
              </HStack>
              <Text
                fontSize="sm"
                opacity={0.9}
                fontStyle="italic"
                textShadow="0 1px 1px rgba(0,0,0,0.1)"
              >
                💡 Ask me anything about your attendance data
              </Text>
            </VStack>
            <Button
              onClick={onClose}
              variant="ghost"
              color="white"
              _hover={{
                bg: 'rgba(255,255,255,0.2)',
                transform: 'scale(1.1)',
              }}
              _active={{
                transform: 'scale(0.95)',
              }}
              size="sm"
              borderRadius="full"
              transition="all 0.2s"
              position="relative"
              zIndex={1}
            >
              <LuX size={18} />
            </Button>
          </HStack>

          {/* Messages Area */}
          <VStack
            flex={1}
            overflowY="auto"
            p={4}
            gap={3}
            align="stretch"
            bg="gray.50"
            maxHeight="500px"
          >
            {messages.map((message) => {
              if (message.type === 'action-buttons') {
                if (showActionButtons) {
                  return (
                    <VStack key={message.id} gap={2} align="stretch" my={2}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.600">
                        📋 Quick Actions:
                      </Text>
                      <Grid
                        templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                        gap={2}
                      >
                        {questionButtons.map((button) => {
                          const IconComponent = button.icon;
                          return (
                            <Button
                              key={button.id}
                              size="sm"
                              variant="outline"
                              justifyContent="start"
                              onClick={() => handleActionButtonClick(button)}
                              loading={loadingButtonId === button.id}
                              _hover={{
                                bg: 'blue.50',
                                transform:
                                  loadingButtonId === button.id
                                    ? 'none'
                                    : 'translateY(-3px) scale(1.02)',
                                boxShadow: 'lg',
                                borderColor: 'blue.300',
                              }}
                              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                              borderWidth="1px"
                              borderColor="gray.200"
                              height="auto"
                              py={3}
                              _active={{
                                transform:
                                  loadingButtonId === button.id
                                    ? 'none'
                                    : 'translateY(-1px) scale(0.98)',
                              }}
                              disabled={loadingButtonId !== null}
                            >
                              <VStack align="start" gap={0} flex={1}>
                                <HStack gap={2}>
                                  <Box color="blue.500">
                                    <IconComponent size={16} />
                                  </Box>
                                  <Text fontSize="xs" fontWeight="semibold">
                                    {loadingButtonId === button.id
                                      ? 'Processing...'
                                      : button.label}
                                  </Text>
                                </HStack>
                                <Text
                                  fontSize="2xs"
                                  color="gray.600"
                                  textAlign="left"
                                >
                                  {loadingButtonId === button.id
                                    ? 'Please wait...'
                                    : button.description}
                                </Text>
                              </VStack>
                            </Button>
                          );
                        })}
                      </Grid>
                    </VStack>
                  );
                } else {
                  // Don't render anything when action buttons are hidden
                  return null;
                }
              }

              return (
                <Box
                  key={message.id}
                  alignSelf={
                    message.type === 'user' ? 'flex-end' : 'flex-start'
                  }
                  maxW="80%"
                >
                  <Card.Root
                    bg={message.type === 'user' ? 'blue.500' : 'white'}
                    color={message.type === 'user' ? 'white' : 'gray.800'}
                    borderRadius="2xl"
                    boxShadow="md"
                    border="1px solid"
                    borderColor={
                      message.type === 'user' ? 'blue.400' : 'gray.100'
                    }
                    _hover={{
                      '& .copy-button': {
                        opacity: message.type === 'bot' ? 1 : 0,
                      },
                    }}
                  >
                    <Card.Body
                      p={3}
                      position="relative"
                      className="message-card"
                    >
                      <VStack align="start" gap={1}>
                        {message.type === 'bot' && (
                          <HStack gap={2} justify="space-between" w="full">
                            <HStack gap={2}>
                              <Box
                                bg="blue.100"
                                borderRadius="full"
                                p={1}
                                color="blue.600"
                              >
                                <LuBot size={14} />
                              </Box>
                              <Text
                                fontSize="xs"
                                fontWeight="semibold"
                                color="blue.600"
                              >
                                AI Assistant
                              </Text>
                            </HStack>
                            <Button
                              size="xs"
                              variant="ghost"
                              colorScheme="gray"
                              onClick={() => copyToClipboard(message.content)}
                              opacity={0}
                              className="copy-button"
                              _hover={{ opacity: 1 }}
                              transition="opacity 0.2s"
                              minW="auto"
                              h="auto"
                              p={1}
                            >
                              <LuCopy size={12} />
                            </Button>
                          </HStack>
                        )}
                        <Text fontSize="sm" whiteSpace="pre-wrap">
                          {message.content}
                        </Text>

                        {/* Reaction Buttons for Bot Messages */}
                        {message.type === 'bot' && (
                          <HStack gap={1} mt={2}>
                            {['👍', '👎', '😊', '📊'].map((emoji) => (
                              <Button
                                key={emoji}
                                size="xs"
                                variant="ghost"
                                onClick={() => addReaction(message.id, emoji)}
                                bg={
                                  message.reaction === emoji
                                    ? 'blue.50'
                                    : 'transparent'
                                }
                                color={
                                  message.reaction === emoji
                                    ? 'blue.600'
                                    : 'gray.500'
                                }
                                borderRadius="full"
                                minW="auto"
                                h="auto"
                                p={1}
                                _hover={{
                                  bg: 'blue.50',
                                  color: 'blue.600',
                                  transform: 'scale(1.2)',
                                }}
                                transition="all 0.2s"
                              >
                                {emoji}
                              </Button>
                            ))}
                          </HStack>
                        )}

                        <Text fontSize="2xs" opacity={0.7}>
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                </Box>
              );
            })}

            {isLoading && (
              <Box alignSelf="flex-start">
                <Card.Root
                  bg="white"
                  borderRadius="2xl"
                  boxShadow="md"
                  border="1px solid"
                  borderColor={
                    loadingState === 'success' ? 'green.200' : 'gray.100'
                  }
                  transition="all 0.3s"
                >
                  <Card.Body p={3}>
                    <HStack gap={3}>
                      <Box
                        bg={
                          loadingState === 'success' ? 'green.100' : 'blue.100'
                        }
                        borderRadius="full"
                        p={1}
                        color={
                          loadingState === 'success' ? 'green.600' : 'blue.600'
                        }
                        transition="all 0.3s"
                      >
                        {loadingState === 'success' ? (
                          <Text fontSize="sm">✓</Text>
                        ) : (
                          <LuBot size={14} />
                        )}
                      </Box>
                      <VStack align="start" gap={1}>
                        <Text
                          fontSize="xs"
                          fontWeight="semibold"
                          color={
                            loadingState === 'success'
                              ? 'green.600'
                              : 'blue.600'
                          }
                        >
                          AI Assistant
                        </Text>
                        <HStack gap={2} align="center">
                          <Text
                            fontSize="sm"
                            color={
                              loadingState === 'success'
                                ? 'green.600'
                                : 'gray.600'
                            }
                          >
                            {loadingState === 'success'
                              ? 'Request completed successfully!'
                              : 'Analyzing your request'}
                          </Text>
                          {loadingState === 'loading' && (
                            <HStack gap={1}>
                              <Box
                                w="6px"
                                h="6px"
                                bg="blue.400"
                                borderRadius="full"
                                animation="pulse 1.4s ease-in-out infinite"
                              />
                              <Box
                                w="6px"
                                h="6px"
                                bg="blue.400"
                                borderRadius="full"
                                animation="pulse 1.4s ease-in-out 0.2s infinite"
                              />
                              <Box
                                w="6px"
                                h="6px"
                                bg="blue.400"
                                borderRadius="full"
                                animation="pulse 1.4s ease-in-out 0.4s infinite"
                              />
                            </HStack>
                          )}
                          {loadingState === 'success' && (
                            <Box
                              color="green.500"
                              animation="successBounce 0.6s ease-out"
                            >
                              🎉
                            </Box>
                          )}
                        </HStack>
                      </VStack>
                    </HStack>
                  </Card.Body>
                </Card.Root>
              </Box>
            )}

            {/* Follow-up Suggestions */}
            {followUpSuggestions.length > 0 && !isLoading && (
              <VStack align="stretch" gap={2} mt={3}>
                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                  💡 You might also want to ask:
                </Text>
                <HStack gap={2} flexWrap="wrap">
                  {followUpSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                      fontSize="xs"
                      px={3}
                      py={1}
                      h="auto"
                      borderRadius="full"
                      onClick={() => {
                        // Find matching question button and trigger it
                        const matchingButton = questionButtons.find(
                          (btn) =>
                            suggestion
                              .toLowerCase()
                              .includes(
                                btn.label.toLowerCase().split(' ')[0]
                              ) ||
                            suggestion.toLowerCase().includes(btn.category)
                        );
                        if (matchingButton) {
                          handleActionButtonClick(matchingButton);
                          setFollowUpSuggestions([]);
                        }
                      }}
                      _hover={{
                        transform: 'translateY(-1px)',
                        boxShadow: 'md',
                      }}
                      transition="all 0.2s"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </HStack>
              </VStack>
            )}

            <div ref={messagesEndRef} />
          </VStack>

          {/* Input Area */}
          <Box
            p={4}
            borderTop="1px solid"
            borderColor="gray.200"
            bg="white"
            borderBottomRadius="lg"
          >
            <Text fontSize="2xs" color="gray.500" textAlign="center">
              💡 Use the quick action buttons above for best results
            </Text>
          </Box>
        </Box>
      </Portal>

      {/* Parameter Selection Modal */}
      {isParamModalOpen && (
        <Portal>
          <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="blackAlpha.600"
            zIndex="1600"
            onClick={() => setIsParamModalOpen(false)}
          />
          <Box
            position="fixed"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            width={{ base: '90%', md: '500px' }}
            bg="white"
            borderRadius="lg"
            boxShadow="2xl"
            zIndex="1700"
          >
            {/* Header */}
            <HStack
              justify="space-between"
              p={4}
              borderBottom="1px solid"
              borderColor="gray.200"
            >
              <Text fontSize="lg" fontWeight="bold">
                {selectedQuestion?.label}
              </Text>
              <Button
                onClick={() => setIsParamModalOpen(false)}
                variant="ghost"
                size="sm"
              >
                <LuX size={20} />
              </Button>
            </HStack>

            {/* Body */}
            <VStack p={4} gap={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                {selectedQuestion?.description}
              </Text>
              {renderParameterInputs()}
            </VStack>

            {/* Footer */}
            <HStack
              p={4}
              borderTop="1px solid"
              borderColor="gray.200"
              justify="flex-end"
              gap={2}
            >
              <Button
                variant="outline"
                onClick={() => setIsParamModalOpen(false)}
                size="md"
              >
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleParamModalSubmit}
                size="md"
              >
                Submit Query
              </Button>
            </HStack>
          </Box>
        </Portal>
      )}
    </>
  );
};
