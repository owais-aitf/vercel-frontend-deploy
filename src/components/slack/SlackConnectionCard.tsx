// src/components/slack/SlackConnectionCard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Card,
  Spinner,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FaSlack } from 'react-icons/fa';
import {
  slackService,
  SlackConnectionStatus,
} from '@/shared/service/slackService';

interface SlackConnectionCardProps {
  onStatusChange?: (status: SlackConnectionStatus) => void;
}

export const SlackConnectionCard: React.FC<SlackConnectionCardProps> = ({
  onStatusChange,
}) => {
  const { t } = useTranslation('engineer');
  const [connectionStatus, setConnectionStatus] =
    useState<SlackConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetchConnectionStatus();
  }, []);

  const fetchConnectionStatus = async () => {
    try {
      setLoading(true);
      const status = await slackService.getConnectionStatus();
      setConnectionStatus(status);
      if (onStatusChange) {
        onStatusChange(status);
      }
    } catch (error) {
      console.error('Failed to fetch Slack connection status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    // Redirect to Slack OAuth URL directly
    window.location.href = 'https://attendance-atf.ddns.net/api/slack/auth';
  };

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);
      await slackService.disconnectSlack();
      await fetchConnectionStatus();
    } catch (error) {
      console.error('Failed to disconnect Slack:', error);
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <Card.Root p={{ base: 4, md: 6 }}>
        <HStack justify="center">
          <Spinner size="md" color="blue.500" />
          <Text fontSize="sm" color="gray.500">
            {t('slack.loading_status')}
          </Text>
        </HStack>
      </Card.Root>
    );
  }

  return (
    <Card.Root p={{ base: 4, md: 6 }} bg="white" boxShadow="md">
      <VStack align="start" gap={4} w="full">
        <HStack justify="space-between" w="full">
          <HStack gap={3}>
            <Box
              p={2}
              borderRadius="lg"
              bg="purple.100"
              color="purple.600"
              fontSize={{ base: '24px', md: '28px' }}
            >
              <FaSlack />
            </Box>
            <VStack align="start" gap={0}>
              <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold">
                {t('slack.card_title')}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {connectionStatus?.connected
                  ? t('slack.connected_status')
                  : t('slack.not_connected_status')}
              </Text>
            </VStack>
          </HStack>

          {connectionStatus?.connected && (
            <Box
              w="12px"
              h="12px"
              borderRadius="full"
              bg="green.500"
              boxShadow="0 0 0 3px rgba(34, 197, 94, 0.2)"
              animation="pulse 2s ease-in-out infinite"
            />
          )}
        </HStack>

        <Text fontSize="sm" color="gray.600" lineHeight="1.6">
          {connectionStatus?.connected
            ? t('slack.connected_description')
            : t('slack.not_connected_description')}
        </Text>

        {connectionStatus?.connected ? (
          <HStack gap={2} w={{ base: 'full', md: 'auto' }} flexWrap="wrap">
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              onClick={handleDisconnect}
              loading={disconnecting}
              disabled={disconnecting}
              flex={{ base: 1, md: 'auto' }}
            >
              {t('slack.disconnect_button')}
            </Button>
            <Button
              size="sm"
              colorScheme="blue"
              variant="ghost"
              onClick={fetchConnectionStatus}
              flex={{ base: 1, md: 'auto' }}
            >
              {t('slack.refresh_button')}
            </Button>
          </HStack>
        ) : (
          <Button
            size="md"
            colorScheme="purple"
            onClick={handleConnect}
            w={{ base: 'full', md: 'auto' }}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
            transition="all 0.2s"
          >
            <HStack gap={2}>
              <FaSlack />
              <Text>{t('slack.connect_button')}</Text>
            </HStack>
          </Button>
        )}
      </VStack>

      {/* Pulse Animation */}
      <style jsx global>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </Card.Root>
  );
};
