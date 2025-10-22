import { Box, Input, VStack, Text, HStack, Badge } from '@chakra-ui/react';
import { LuSearch } from 'react-icons/lu';
import { Engineer } from '@/shared/service/engineerService';

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
}: EngineerSidebarProps) {
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
        align="stretch"
        gap={0}
        flex={1}
        overflowY="auto"
        css={{
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#CBD5E0',
            borderRadius: '4px',
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
                p={4}
                cursor="pointer"
                bg={isSelected ? 'blue.50' : 'transparent'}
                borderLeft="3px solid"
                borderColor={isSelected ? 'blue.500' : 'transparent'}
                _hover={{
                  bg: isSelected ? 'blue.100' : 'gray.50',
                }}
                transition="all 0.2s"
                onClick={() => onSelectEngineer(engineer)}
              >
                <VStack align="start" gap={1}>
                  <Text fontWeight="semibold" fontSize="sm">
                    {engineer.fullName}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {engineer.email}
                  </Text>
                  {isSelected && (
                    <HStack gap={2} mt={2} flexWrap="wrap">
                      <Badge colorScheme="green" fontSize="2xs">
                        {stats.totalWorkDays} days
                      </Badge>
                      <Badge colorScheme="blue" fontSize="2xs">
                        {stats.totalLeave} leave
                      </Badge>
                      {stats.totalAbsent > 0 && (
                        <Badge colorScheme="red" fontSize="2xs">
                          {stats.totalAbsent} absent
                        </Badge>
                      )}
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
