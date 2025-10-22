import { useState, useCallback, useRef, useEffect } from 'react';
import { Box, VStack } from '@chakra-ui/react';

interface ResizableSplitterProps {
  onResize: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
}

export function ResizableSplitter({
  onResize,
  minWidth = 250,
  maxWidth = 600,
  defaultWidth = 350,
}: ResizableSplitterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(defaultWidth);
  const startXRef = useRef(0);
  const startWidthRef = useRef(defaultWidth);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startXRef.current = e.clientX;
      startWidthRef.current = currentWidth;

      // Add cursor style to body during drag
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [currentWidth]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startXRef.current;

      // Get the container width to calculate calendar minimum width
      const containerWidth = window.innerWidth - 100; // Account for margins/padding
      const calendarMinWidth = 600; // Minimum calendar width
      const effectiveMaxWidth = Math.min(
        maxWidth,
        containerWidth - calendarMinWidth
      );

      const newWidth = Math.max(
        minWidth,
        Math.min(effectiveMaxWidth, startWidthRef.current + deltaX)
      );

      setCurrentWidth(newWidth);
      onResize(newWidth);
    },
    [isDragging, minWidth, maxWidth, onResize]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);

    // Remove cursor style from body
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <Box
      w="6px"
      h="full"
      bg={isDragging ? 'blue.400' : 'transparent'}
      cursor="col-resize"
      position="relative"
      onMouseDown={handleMouseDown}
      _hover={{
        bg: 'blue.100',
        '& .resize-indicator': {
          opacity: 1,
        },
      }}
      transition="all 0.2s"
      flexShrink={0}
      borderRight="1px solid"
      borderColor={isDragging ? 'blue.400' : 'gray.200'}
      userSelect="none"
      title="Drag to resize sidebar"
    >
      {/* Invisible wider hit area for easier grabbing */}
      <Box
        position="absolute"
        left="-6px"
        right="-6px"
        top="0"
        bottom="0"
        cursor="col-resize"
      />

      {/* Visual indicator - vertical dots */}
      <VStack
        className="resize-indicator"
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        gap={1}
        opacity={isDragging ? 1 : 0.4}
        transition="all 0.2s"
      >
        <Box
          w="2px"
          h="2px"
          bg={isDragging ? 'blue.600' : 'gray.500'}
          borderRadius="full"
        />
        <Box
          w="2px"
          h="2px"
          bg={isDragging ? 'blue.600' : 'gray.500'}
          borderRadius="full"
        />
        <Box
          w="2px"
          h="2px"
          bg={isDragging ? 'blue.600' : 'gray.500'}
          borderRadius="full"
        />
        <Box
          w="2px"
          h="2px"
          bg={isDragging ? 'blue.600' : 'gray.500'}
          borderRadius="full"
        />
        <Box
          w="2px"
          h="2px"
          bg={isDragging ? 'blue.600' : 'gray.500'}
          borderRadius="full"
        />
      </VStack>
    </Box>
  );
}
