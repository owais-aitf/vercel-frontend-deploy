import { Box, Input, VStack, Text, HStack, Badge } from '@chakra-ui/react';
import { LuSearch } from 'react-icons/lu';
import { Engineer } from '@/shared/service/engineerService';
import { useRef, useEffect } from 'react';

interface EngineerSidebarProps {
  engineers: Engineer[];
  selectedEngineer: Engineer | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelectEngineer: (engineer: Engineer) => void;
  loading: boolean;
  width: number;
  stats: {
    totalWorkDays: number;
    totalLeave: number;
    totalAbsent: number;
  };
  projectCounts: Map<string, number>;
}

export function EngineerSidebar({
  engineers,
  selectedEngineer,
  searchTerm,
  onSearchChange,
  onSelectEngineer,
  loading,
  width,
  stats,
  projectCounts,
}: EngineerSidebarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);

  // Save scroll position before updates
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const handleScroll = () => {
        scrollPositionRef.current = container.scrollTop;
      };
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Restore scroll position after updates
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && scrollPositionRef.current > 0) {
      container.scrollTop = scrollPositionRef.current;
    }
  });

  const filteredEngineers = engineers.filter(
    (engineer) =>
      engineer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engineer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      w={`${width}px`}
      flexShrink={0}
      overflow="hidden"
      display="flex"
      flexDirection="column"
      h="full"
    >
      {/* Search */}
      <Box p={4} borderBottom="1px solid" borderColor="gray.200">
        <Box position="relative">
          <Box
            position="absolute"
            left="12px"
            top="50%"
            transform="translateY(-50%)"
            color="gray.400"
            zIndex={1}
          >
            <LuSearch size={18} />
          </Box>
          <Input
            placeholder="Search engineers..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            pl="40px"
            bg="gray.50"
            border="1px solid"
            borderColor="gray.200"
            _focus={{
              bg: 'white',
              borderColor: 'blue.500',
            }}
          />
        </Box>
      </Box>

      {/* Engineer List */}
      <VStack
        ref={scrollContainerRef}
        align="stretch"
        gap={0}
        flex={1}
        overflowY="auto"
        css={{
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#CBD5E0',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#A0AEC0',
          },
        }}
      >
        {loading ? (
          <Box p={4}>
            <Text color="gray.500" textAlign="center" fontSize="sm">
              Loading engineers...
            </Text>
          </Box>
        ) : filteredEngineers.length === 0 ? (
          <Box p={4}>
            <Text color="gray.500" textAlign="center" fontSize="sm">
              No engineers found
            </Text>
          </Box>
        ) : (
          filteredEngineers.map((engineer) => {
            const isSelected = selectedEngineer?.id === engineer.id;
            return (
              <Box
                key={engineer.id}
                p={3}
                cursor="pointer"
                bg={isSelected ? 'blue.50' : 'white'}
                border="1px solid"
                borderColor={isSelected ? 'blue.300' : 'gray.200'}
                borderLeft="3px solid"
                borderLeftColor={isSelected ? 'blue.500' : 'gray.300'}
                borderRadius="md"
                mx={2}
                mb={2}
                _hover={{
                  bg: isSelected ? 'blue.100' : 'gray.50',
                  borderColor: isSelected ? 'blue.400' : 'gray.300',
                  shadow: 'sm',
                }}
                _active={{
                  transform: 'scale(0.98)',
                }}
                transition="all 0.15s ease-out"
                onClick={() => onSelectEngineer(engineer)}
              >
                <VStack align="start" gap={0.5}>
                  <HStack justify="space-between" w="full">
                    <Text
                      fontWeight="semibold"
                      fontSize="sm"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {engineer.fullName}
                    </Text>
                    {projectCounts.get(engineer.id) !== undefined &&
                      projectCounts.get(engineer.id)! > 0 && (
                        <Badge
                          colorScheme="purple"
                          fontSize="2xs"
                          variant="subtle"
                          flexShrink={0}
                        >
                          {projectCounts.get(engineer.id)}
                        </Badge>
                      )}
                  </HStack>
                  <Text
                    fontSize="2xs"
                    color="gray.500"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                  >
                    {engineer.email}
                  </Text>
                  {isSelected && (
                    <HStack gap={1.5} mt={1.5} flexWrap="wrap">
                      <Badge
                        colorScheme="green"
                        fontSize="2xs"
                        px={1.5}
                        py={0.5}
                      >
                        {stats.totalWorkDays}d
                      </Badge>
                      <Badge
                        colorScheme="blue"
                        fontSize="2xs"
                        px={1.5}
                        py={0.5}
                      >
                        {stats.totalLeave}l
                      </Badge>
                      <Badge colorScheme="red" fontSize="2xs" px={1.5} py={0.5}>
                        {stats.totalAbsent}a
                      </Badge>
                    </HStack>
                  )}
                </VStack>
              </Box>
            );
          })
        )}
      </VStack>
    </Box>
  );
}
