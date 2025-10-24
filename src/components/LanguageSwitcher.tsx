'use client';

import { useState } from 'react';
import { Button, HStack, Box } from '@chakra-ui/react';
import { LuGlobe } from 'react-icons/lu';

export const LanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('preferredLanguage') || 'en';
    }
    return 'en';
  });

  const switchLanguage = (locale: string) => {
    // Store language preference in localStorage
    localStorage.setItem('preferredLanguage', locale);
    setCurrentLanguage(locale);

    // Reload page to apply language change
    window.location.reload();
  };

  return (
    <HStack
      gap={2}
      bg="rgba(255, 255, 255, 0.9)"
      borderRadius="lg"
      p={1}
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.3)"
      shadow="sm"
    >
      <Box color="blue.600" display="flex" alignItems="center">
        <LuGlobe size={18} />
      </Box>
      <Button
        variant={currentLanguage === 'en' ? 'solid' : 'ghost'}
        size="sm"
        onClick={() => switchLanguage('en')}
        bg={currentLanguage === 'en' ? 'blue.600' : 'transparent'}
        color={currentLanguage === 'en' ? 'white' : 'gray.700'}
        _hover={{
          bg: currentLanguage === 'en' ? 'blue.700' : 'gray.100',
        }}
        fontSize="xs"
        px={3}
        py={1}
        h="auto"
        borderRadius="md"
      >
        EN
      </Button>
      <Button
        variant={currentLanguage === 'ja' ? 'solid' : 'ghost'}
        size="sm"
        onClick={() => switchLanguage('ja')}
        bg={currentLanguage === 'ja' ? 'blue.600' : 'transparent'}
        color={currentLanguage === 'ja' ? 'white' : 'gray.700'}
        _hover={{
          bg: currentLanguage === 'ja' ? 'blue.700' : 'gray.100',
        }}
        fontSize="xs"
        px={3}
        py={1}
        h="auto"
        borderRadius="md"
      >
        JA
      </Button>
    </HStack>
  );
};
