'use client';

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Text, VStack, HStack, Card } from '@chakra-ui/react';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
} from 'react-icons/fa';

interface SlackConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'success' | 'linking_required' | 'error' | null;
  message?: string;
  teamName?: string;
  autoRedirect?: boolean;
}

export const SlackConnectionModal: React.FC<SlackConnectionModalProps> = ({
  isOpen,
  onClose,
  status,
  message,
  teamName,
  autoRedirect = false,
}) => {
  const { t } = useTranslation('engineer');

  // Handle auto-redirect for success case
  useEffect(() => {
    if (isOpen && autoRedirect && status === 'success') {
      const timer = setTimeout(() => {
        onClose();
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoRedirect, status, onClose]);

  // Don't render if not open or no status
  if (!isOpen || !status) return null;

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <FaCheckCircle size={48} color="#48BB78" />;
      case 'error':
        return <FaExclamationTriangle size={48} color="#F56565" />;
      case 'linking_required':
        return <FaInfoCircle size={48} color="#4299E1" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'success':
        return t(
          'slack.connection_success_title',
          'Slack Connected Successfully!'
        );
      case 'error':
        return t('slack.connection_error_title', 'Slack Connection Failed');
      case 'linking_required':
        return t('slack.linking_required_title', 'Slack Integration Pending');
    }
  };

  const getDescription = () => {
    switch (status) {
      case 'success':
        return t(
          'slack.connection_success_message',
          "You'll now receive attendance reminders in Slack."
        );
      case 'error':
        return (
          message ||
          t(
            'slack.connection_error_message',
            'Unable to connect to Slack. Please try again.'
          )
        );
      case 'linking_required':
        return t(
          'slack.linking_required_message',
          `Your Slack workspace "${teamName || 'Your workspace'}" is connected, but user linking is required.`
        );
    }
  };

  const getColorScheme = () => {
    switch (status) {
      case 'success':
        return 'green';
      case 'error':
        return 'red';
      case 'linking_required':
        return 'blue';
    }
  };

  const getEmoji = () => {
    switch (status) {
      case 'success':
        return '🎉';
      case 'error':
        return '❌';
      case 'linking_required':
        return 'ℹ️';
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'success':
        return 'green.500';
      case 'error':
        return 'red.500';
      case 'linking_required':
        return 'blue.500';
    }
  };

  return (
    <Box
      position="fixed"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      zIndex={9999}
      animation="slideIn 0.3s ease-out"
    >
      <Card.Root
        maxW="450px"
        w="90vw"
        bg="white"
        borderRadius="xl"
        boxShadow="2xl"
        border="3px solid"
        borderColor={getBorderColor()}
      >
        <Card.Body p={6}>
          <VStack gap={5} align="stretch">
            {/* Close Button */}
            <HStack justify="space-between" align="start">
              <Box flex={1} />
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                p={1}
                minW="auto"
                h="auto"
              >
                <FaTimes size={16} />
              </Button>
            </HStack>

            {/* Icon */}
            <VStack gap={4}>
              <Box
                animation={
                  status === 'success' ? 'bounce 1s ease-in-out' : 'none'
                }
              >
                {getIcon()}
              </Box>

              {/* Title with Emoji */}
              <Text
                fontSize="2xl"
                fontWeight="bold"
                textAlign="center"
                color="gray.800"
              >
                {getEmoji()} {getTitle()}
              </Text>

              {/* Description */}
              <Text
                textAlign="center"
                color="gray.600"
                fontSize="md"
                lineHeight="1.6"
              >
                {getDescription()}
              </Text>

              {/* Auto-refresh indicator */}
              {status === 'success' && autoRedirect && (
                <Box
                  px={4}
                  py={2}
                  bg="blue.50"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="blue.200"
                  w="full"
                >
                  <Text fontSize="sm" color="blue.700" textAlign="center">
                    ⏳ {t('slack.auto_refresh', 'Refreshing in a moment...')}
                  </Text>
                </Box>
              )}

              {/* Action Button */}
              <Button
                colorScheme={getColorScheme()}
                onClick={onClose}
                w="full"
                size="lg"
                borderRadius="lg"
                fontWeight="semibold"
                mt={2}
              >
                {t('common.ok', 'Got it!')}
              </Button>
            </VStack>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -60%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </Box>
  );
};
