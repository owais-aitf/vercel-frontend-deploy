// src/components/slack/SlackConnectionCard.tsx

'use client';

import React, { useState, useEffect, useContext, useCallback } from 'react';
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
import { AuthContext } from '@/context/AuthContext';

interface SlackConnectionCardProps {
  onStatusChange?: (status: SlackConnectionStatus) => void;
}

export const SlackConnectionCard: React.FC<SlackConnectionCardProps> = ({
  onStatusChange,
}) => {
  const { t } = useTranslation('engineer');
  const { user } = useContext(AuthContext);
  const [connectionStatus, setConnectionStatus] =
    useState<SlackConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  // Wrap fetchConnectionStatus in useCallback to make it stable
  const fetchConnectionStatus = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const status = await slackService.getConnectionStatus(user.id);
      setConnectionStatus(status);
      if (onStatusChange) {
        onStatusChange(status);
      }
    } catch (error) {
      console.error('Failed to fetch Slack connection status:', error);
      setConnectionStatus({
        success: false,
        connected: false,
        message: 'Unable to check connection status',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, onStatusChange]); // Add dependencies

  useEffect(() => {
    if (user?.id) {
      fetchConnectionStatus();
    }
  }, [user?.id, fetchConnectionStatus]); // Add fetchConnectionStatus

  const handleConnect = () => {
    window.location.href = 'https://attendance-atf.ddns.net/api/slack/auth';
  };

  const handleDisconnect = async () => {
    if (!user?.id) return;

    try {
      setDisconnecting(true);
      await slackService.disconnectSlack(user.id);
      await fetchConnectionStatus();
    } catch (error) {
      console.error('Failed to disconnect Slack:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to disconnect Slack account';
      alert(errorMessage);
    } finally {
      setDisconnecting(false);
    }
  };

  const isConnected = connectionStatus?.connected || false;

  return (
    <Card.Root>
      <Card.Body p={{ base: 4, md: 6 }}>
        <VStack align="start" gap={4}>
          <HStack justify="space-between" w="full">
            <HStack gap={3}>
              <Box color="purple.500">
                <FaSlack size={32} />
              </Box>
              <VStack align="start" gap={0}>
                <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold">
                  {t('slack.card_title')}
                </Text>
                {loading ? (
                  <Text fontSize="sm" color="gray.500">
                    {t('slack.loading_status')}
                  </Text>
                ) : (
                  <HStack gap={2}>
                    <Box
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      bg={isConnected ? 'green.500' : 'gray.400'}
                      animation={isConnected ? 'pulse 2s infinite' : 'none'}
                    />
                    <Text
                      fontSize="sm"
                      color={isConnected ? 'green.600' : 'gray.500'}
                      fontWeight="medium"
                    >
                      {isConnected
                        ? t('slack.connected_status')
                        : t('slack.not_connected_status')}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </HStack>
          </HStack>

          <Text fontSize="sm" color="gray.600">
            {isConnected
              ? t('slack.connected_description')
              : t('slack.not_connected_description')}
          </Text>

          <HStack gap={3} w="full">
            {loading ? (
              <Spinner size="sm" />
            ) : isConnected ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  onClick={handleDisconnect}
                  loading={disconnecting}
                  disabled={disconnecting}
                >
                  {t('slack.disconnect_button')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={fetchConnectionStatus}
                  disabled={loading}
                >
                  {t('slack.refresh_button')}
                </Button>
              </>
            ) : (
              <Button size="sm" colorScheme="purple" onClick={handleConnect}>
                <HStack gap={2}>
                  <FaSlack />
                  <Text>{t('slack.connect_button')}</Text>
                </HStack>
              </Button>
            )}
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
