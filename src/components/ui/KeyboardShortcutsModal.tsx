'use client';

import {
  Box,
  Text,
  VStack,
  HStack,
  Portal,
  Card,
  Badge,
} from '@chakra-ui/react';
import { LuX, LuKeyboard } from 'react-icons/lu';
import { EnhancedButton } from './EnhancedButton';

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
}

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: Shortcut[];
}

export const KeyboardShortcutsModal = ({
  isOpen,
  onClose,
  shortcuts,
}: KeyboardShortcutsModalProps) => {
  if (!isOpen) return null;

  const formatShortcut = (shortcut: Shortcut) => {
    const keys = [];

    if (shortcut.ctrlKey || shortcut.metaKey) {
      keys.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
    }
    if (shortcut.altKey) {
      keys.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt');
    }
    if (shortcut.shiftKey) {
      keys.push('⇧');
    }

    keys.push(shortcut.key.toUpperCase());

    return keys;
  };

  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      const category =
        shortcut.description.includes('search') ||
        shortcut.description.includes('find')
          ? 'Search'
          : shortcut.description.includes('theme') ||
              shortcut.description.includes('chatbot')
            ? 'Interface'
            : shortcut.description.includes('save') ||
                shortcut.description.includes('copy')
              ? 'Editing'
              : 'Navigation';

      if (!acc[category]) acc[category] = [];
      acc[category].push(shortcut);
      return acc;
    },
    {} as Record<string, Shortcut[]>
  );

  return (
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

      {/* Modal */}
      <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        width={{ base: '95%', md: '600px' }}
        maxHeight="80vh"
        zIndex="1500"
      >
        <Card.Root
          bg="white"
          borderRadius="xl"
          boxShadow="2xl"
          border="1px solid"
          borderColor="gray.200"
        >
          {/* Header */}
          <HStack
            justify="space-between"
            p={6}
            borderBottom="1px solid"
            borderColor="gray.200"
          >
            <HStack gap={3}>
              <Box bg="blue.100" borderRadius="lg" p={2} color="blue.600">
                <LuKeyboard size={20} />
              </Box>
              <VStack align="start" gap={0}>
                <Text fontSize="lg" fontWeight="bold">
                  Keyboard Shortcuts
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Speed up your workflow with these shortcuts
                </Text>
              </VStack>
            </HStack>
            <EnhancedButton
              variant="ghost"
              onClick={onClose}
              hoverEffect="scale"
              size="sm"
            >
              <LuX size={18} />
            </EnhancedButton>
          </HStack>

          {/* Content */}
          <Box p={6} maxHeight="60vh" overflowY="auto">
            <VStack gap={6} align="stretch">
              {Object.entries(groupedShortcuts).map(
                ([category, categoryShortcuts]) => (
                  <VStack key={category} align="stretch" gap={3}>
                    <Text fontSize="md" fontWeight="semibold" color="gray.700">
                      {category}
                    </Text>
                    <VStack gap={2} align="stretch">
                      {categoryShortcuts.map((shortcut, index) => (
                        <HStack
                          key={index}
                          justify="space-between"
                          p={3}
                          bg="gray.50"
                          borderRadius="md"
                          _hover={{ bg: 'gray.100' }}
                          transition="all 0.2s"
                        >
                          <Text fontSize="sm" color="gray.700">
                            {shortcut.description}
                          </Text>
                          <HStack gap={1}>
                            {formatShortcut(shortcut).map((key, keyIndex) => (
                              <Badge
                                key={keyIndex}
                                variant="outline"
                                colorScheme="gray"
                                fontSize="xs"
                                px={2}
                                py={1}
                                fontFamily="mono"
                              >
                                {key}
                              </Badge>
                            ))}
                          </HStack>
                        </HStack>
                      ))}
                    </VStack>
                  </VStack>
                )
              )}
            </VStack>
          </Box>

          {/* Footer */}
          <Box
            p={4}
            borderTop="1px solid"
            borderColor="gray.200"
            bg="gray.50"
            borderBottomRadius="xl"
          >
            <Text fontSize="xs" color="gray.500" textAlign="center">
              Press{' '}
              <Badge variant="outline" fontSize="xs">
                ?
              </Badge>{' '}
              anytime to view shortcuts
            </Text>
          </Box>
        </Card.Root>
      </Box>
    </Portal>
  );
};
