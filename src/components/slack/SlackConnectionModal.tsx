'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogBackdrop,
  Button,
  Text,
  VStack,
  Box,
} from '@chakra-ui/react';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
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
        onClose(); // Close modal first
        setTimeout(() => {
          window.location.reload(); // Then reload to refresh Slack status
        }, 300);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoRedirect, status, onClose]);

  if (!status) return null;

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
        return (
          '🎉 ' +
          t('slack.connection_success_title', 'Slack Connected Successfully!')
        );
      case 'error':
        return (
          '❌ ' + t('slack.connection_error_title', 'Slack Connection Failed')
        );
      case 'linking_required':
        return (
          'ℹ️ ' + t('slack.linking_required_title', 'Slack Integration Pending')
        );
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

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(e) => {
        if (!e.open) {
          onClose();
        }
      }}
    >
      <DialogBackdrop />
      <DialogContent maxW="md">
        <DialogHeader>
          <DialogTitle textAlign="center">{getTitle()}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <VStack gap={4} align="center" py={4}>
            <Box>{getIcon()}</Box>
            <Text textAlign="center" color="gray.700">
              {getDescription()}
            </Text>
            {status === 'success' && autoRedirect && (
              <Text fontSize="sm" color="gray.500">
                {t('slack.auto_refresh', 'Refreshing in 2 seconds...')}
              </Text>
            )}
          </VStack>
        </DialogBody>
        <DialogFooter>
          <Button
            colorScheme={getColorScheme()}
            onClick={onClose}
            w="full"
            size="lg"
          >
            {t('common.ok', 'OK')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};
