// src/components/slack/SlackConnectionModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Portal,
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogCloseTrigger,
  Progress,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

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
  autoRedirect = true,
}) => {
  const { t } = useTranslation('engineer');
  const router = useRouter();
  const [countdown, setCountdown] = useState(8);
  const totalTime = status === 'linking_required' ? 10 : 8;

  useEffect(() => {
    if (!isOpen || !status) return;

    setCountdown(totalTime);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (autoRedirect) {
            router.push('/engineer/dashboard');
            onClose();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, status, autoRedirect, totalTime, router, onClose]);

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: '✅',
          title: t('slack.success_title'),
          description: t('slack.success_description'),
          color: 'green.500',
          bgColor: 'green.50',
          progressColor: 'green',
        };
      case 'linking_required':
        return {
          icon: '✅',
          title: t('slack.linking_required_title', {
            teamName: teamName || 'Your workspace',
          }),
          description: t('slack.linking_required_description'),
          color: 'blue.500',
          bgColor: 'blue.50',
          progressColor: 'blue',
        };
      case 'error':
        return {
          icon: '❌',
          title: t('slack.error_title'),
          description: message || t('slack.error_description'),
          color: 'red.500',
          bgColor: 'red.50',
          progressColor: 'red',
        };
      default:
        return {
          icon: 'ℹ️',
          title: '',
          description: '',
          color: 'gray.500',
          bgColor: 'gray.50',
          progressColor: 'gray',
        };
    }
  };

  const config = getStatusConfig();
  const progressPercentage = ((totalTime - countdown) / totalTime) * 100;

  return (
    <Portal>
      <DialogRoot
        open={isOpen}
        onOpenChange={(details: { open: boolean }) => {
          if (!details.open) {
            onClose();
          }
        }}
        closeOnInteractOutside={false}
        size="lg"
      >
        <DialogBackdrop />
        <DialogContent
          maxW={{ base: '90%', md: '540px' }}
          borderRadius="2xl"
          p={{ base: 6, md: 8 }}
          bg="white"
          boxShadow="2xl"
        >
          <DialogCloseTrigger />
          <VStack gap={6} align="stretch">
            {/* Icon and Title */}
            <VStack gap={4} align="center" textAlign="center">
              <Box
                fontSize={{ base: '56px', md: '72px' }}
                lineHeight="1"
                animation="bounce 0.6s ease-in-out"
              >
                {config.icon}
              </Box>

              <VStack gap={2}>
                <Text
                  fontSize={{ base: 'xl', md: '2xl' }}
                  fontWeight="bold"
                  color={config.color}
                >
                  {config.title}
                </Text>
                <Box
                  bg={config.bgColor}
                  px={4}
                  py={3}
                  borderRadius="lg"
                  w="full"
                >
                  <Text
                    fontSize={{ base: 'sm', md: 'md' }}
                    color="gray.700"
                    lineHeight="1.6"
                  >
                    {config.description}
                  </Text>
                </Box>
              </VStack>
            </VStack>

            {/* Countdown Timer */}
            <VStack gap={2}>
              <HStack justify="space-between" w="full" px={1}>
                <Text fontSize="sm" color="gray.600">
                  {t('slack.auto_redirect_message')}
                </Text>
                <Text fontSize="sm" fontWeight="bold" color={config.color}>
                  {countdown}s
                </Text>
              </HStack>

              {/* Simple Progress Bar */}
              <Box
                w="full"
                h="8px"
                bg="gray.200"
                borderRadius="full"
                overflow="hidden"
              >
                <Box
                  h="full"
                  bg={config.color}
                  w={`${progressPercentage}%`}
                  transition="width 0.5s linear"
                  borderRadius="full"
                />
              </Box>
            </VStack>

            {/* Action Buttons */}
            <HStack gap={2} w="full">
              <Button
                onClick={() => {
                  router.push('/engineer/dashboard');
                  onClose();
                }}
                colorScheme="blue"
                size="lg"
                flex={1}
                borderRadius="lg"
              >
                {t('slack.go_to_dashboard')}
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                size="lg"
                flex={1}
                borderRadius="lg"
              >
                {t('slack.stay_here')}
              </Button>
            </HStack>
          </VStack>
        </DialogContent>
      </DialogRoot>

      {/* Animation Keyframes */}
      <style jsx global>{`
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
    </Portal>
  );
};
