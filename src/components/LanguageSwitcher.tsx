'use client';

import { useState, useEffect } from 'react';
import { Button, HStack, Box } from '@chakra-ui/react';
import { LuGlobe } from 'react-icons/lu';

export const LanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // This runs only on the client after hydration
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLanguage(savedLanguage);
    setIsHydrated(true);
  }, []);

  const switchLanguage = (locale: string) => {
    // Store language preference in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredLanguage', locale);
      setCurrentLanguage(locale);
      // Reload page to apply language change
      window.location.reload();
    }
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
        variant={isHydrated && currentLanguage === 'en' ? 'solid' : 'ghost'}
        size="sm"
        onClick={() => switchLanguage('en')}
        bg={isHydrated && currentLanguage === 'en' ? 'blue.600' : 'transparent'}
        color={isHydrated && currentLanguage === 'en' ? 'white' : 'gray.700'}
        _hover={{
          bg: isHydrated && currentLanguage === 'en' ? 'blue.700' : 'gray.100',
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
        variant={isHydrated && currentLanguage === 'ja' ? 'solid' : 'ghost'}
        size="sm"
        onClick={() => switchLanguage('ja')}
        bg={isHydrated && currentLanguage === 'ja' ? 'blue.600' : 'transparent'}
        color={isHydrated && currentLanguage === 'ja' ? 'white' : 'gray.700'}
        _hover={{
          bg: isHydrated && currentLanguage === 'ja' ? 'blue.700' : 'gray.100',
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
