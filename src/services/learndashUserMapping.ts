import { fetchUserByEmail } from './learndash';

const MAPPING_KEY = 'learndash_user_mappings';

interface UserMapping {
  memberId: string;
  learndashUserId: number;
  email: string;
  linkedAt: string;
}

// Get all mappings from localStorage
export const getAllMappings = (): UserMapping[] => {
  try {
    const data = localStorage.getItem(MAPPING_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Save mapping to localStorage
const saveMapping = (mapping: UserMapping) => {
  try {
    const mappings = getAllMappings();
    const existingIndex = mappings.findIndex(m => m.memberId === mapping.memberId);
    
    if (existingIndex >= 0) {
      mappings[existingIndex] = mapping;
    } else {
      mappings.push(mapping);
    }
    
    localStorage.setItem(MAPPING_KEY, JSON.stringify(mappings));
  } catch (error) {
    console.error('Failed to save mapping:', error);
  }
};

// Search LearnDash for user by email
export const findLearnDashUserByEmail = async (email: string): Promise<number | null> => {
  try {
    const user = await fetchUserByEmail(email);
    return user ? user.id : null;
  } catch (error) {
    console.error('Error finding LearnDash user:', error);
    return null;
  }
};

// Link member to LearnDash user ID
export const linkMemberToLearnDash = (memberId: string, learndashUserId: number, email: string): void => {
  const mapping: UserMapping = {
    memberId,
    learndashUserId,
    email,
    linkedAt: new Date().toISOString(),
  };
  saveMapping(mapping);
};

// Get member's LearnDash user ID
export const getMemberLearnDashId = (memberId: string): number | null => {
  const mappings = getAllMappings();
  const mapping = mappings.find(m => m.memberId === memberId);
  return mapping ? mapping.learndashUserId : null;
};

// Auto-link members to LearnDash users by email
export const autoLinkMembers = async (members: Array<{ id: string; email: string; fullName: string }>): Promise<{
  linked: number;
  notFound: string[];
  errors: string[];
}> => {
  const results = {
    linked: 0,
    notFound: [] as string[],
    errors: [] as string[],
  };

  for (const member of members) {
    try {
      const learndashUserId = await findLearnDashUserByEmail(member.email);
      
      if (learndashUserId) {
        linkMemberToLearnDash(member.id, learndashUserId, member.email);
        results.linked++;
      } else {
        results.notFound.push(member.fullName);
      }
    } catch (error) {
      results.errors.push(`${member.fullName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return results;
};

// Remove mapping
export const unlinkMember = (memberId: string): void => {
  try {
    const mappings = getAllMappings();
    const filtered = mappings.filter(m => m.memberId !== memberId);
    localStorage.setItem(MAPPING_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to unlink member:', error);
  }
};
