import { useState } from "react";
import { mockRegistrations } from "@/data/mockRegistrations";
import { mockBoards } from "@/data/mockBoards";
import { mockMembers } from "@/data/mockMembers";
import { createMemberFromRegistration, assignBoardToMember } from "@/utils/memberManagement";
import { findLearnDashUserByEmail, linkMemberToLearnDash } from "@/services/learndashUserMapping";
import { enrollInRequiredCourses } from "@/services/courseEnrollment";
import { logAIActivity } from "@/services/aiActivityLog";

export const useAIOnboarding = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processRegistration = async (
    registrationId: string,
    onStepUpdate?: (step: string, status: 'pending' | 'processing' | 'complete' | 'error', message?: string) => void
  ) => {
    setIsProcessing(true);
    
    try {
      const stored = localStorage.getItem('registrations');
      const storedRegs = stored ? JSON.parse(stored) : [];
      const allRegs = [...storedRegs, ...mockRegistrations];
      const registration = allRegs.find(r => r.id === registrationId);
      
      if (!registration) {
        throw new Error('Registration not found');
      }

      // Step 1: Duplicate Detection
      onStepUpdate?.('Duplicate Detection', 'processing');
      
      // For now, simulate AI duplicate check
      const duplicateCheck = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          action: 'detect-duplicate',
          data: {
            newMember: {
              email: registration.email,
              firstName: registration.firstName,
              lastName: registration.lastName,
              phone: registration.phone
            },
            existingMembers: mockMembers.map(m => ({
              id: m.id,
              email: m.email,
              fullName: m.fullName,
              phone: m.phone
            }))
          }
        })
      });

      const duplicateData = await duplicateCheck.json();

      if (duplicateData?.isDuplicate) {
        onStepUpdate?.('Duplicate Detection', 'error', `Duplicate found (${Math.round(duplicateData.probability * 100)}% match)`);
        logAIActivity({
          agentType: 'onboarding',
          action: 'Duplicate Detection',
          targetId: registrationId,
          targetName: `${registration.firstName} ${registration.lastName}`,
          status: 'error',
          details: duplicateData,
          aiReasoning: `Found duplicate with ${Math.round(duplicateData.probability * 100)}% confidence`
        });
        return { status: 'duplicate', matches: duplicateData.matches };
      }
      
      onStepUpdate?.('Duplicate Detection', 'complete', 'No duplicates found');

      // Step 2: Board Matching
      onStepUpdate?.('Board Matching', 'processing');
      
      const boardMatchResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          action: 'match-board',
          data: {
            address: `${registration.firstName} ${registration.lastName}'s location`,
            boards: mockBoards.filter(b => b.id !== 'board-900').map(b => ({
              id: b.id,
              name: b.name,
              region: b.region,
              memberCount: b.memberCount
            }))
          }
        })
      });

      const boardMatch = await boardMatchResponse.json();

      const matchedBoard = mockBoards.find(b => b.id === boardMatch?.boardId) || mockBoards.find(b => b.id === 'board-900');
      
      onStepUpdate?.('Board Matching', 'complete', `Matched to ${matchedBoard?.name} (${Math.round((boardMatch?.confidence || 0.8) * 100)}% confidence)`);

      // Step 3: Create Member Profile
      onStepUpdate?.('Profile Creation', 'processing');
      
      const member = await createMemberFromRegistration(registration);
      
      onStepUpdate?.('Profile Creation', 'complete', `Profile created: ${member.memberNumber}`);

      // Step 4: Assign Board
      const assignedMember = assignBoardToMember(member, matchedBoard!.id, matchedBoard!.name);

      // Step 5: Link to LearnDash
      onStepUpdate?.('LearnDash Linking', 'processing');
      
      try {
        const learndashId = await findLearnDashUserByEmail(registration.email);
        if (learndashId) {
          linkMemberToLearnDash(member.id, learndashId, registration.email);
          onStepUpdate?.('LearnDash Linking', 'complete', 'Successfully linked');
          
          // Step 6: Enroll in Course
          onStepUpdate?.('Course Enrollment', 'processing');
          await enrollInRequiredCourses(learndashId, 'new');
          onStepUpdate?.('Course Enrollment', 'complete', 'Enrolled in required courses');
        } else {
          onStepUpdate?.('LearnDash Linking', 'error', 'No LearnDash account found');
          onStepUpdate?.('Course Enrollment', 'error', 'Cannot enroll without LearnDash account');
        }
      } catch (_error) {
        onStepUpdate?.('LearnDash Linking', 'error', 'Failed to link');
        onStepUpdate?.('Course Enrollment', 'error', 'Skipped');
      }

      // Step 7: Generate Welcome Email
      onStepUpdate?.('Welcome Email Generation', 'processing');
      
      const welcomeEmailResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          action: 'generate-welcome-email',
          data: {
            name: `${registration.firstName} ${registration.lastName}`,
            boardName: matchedBoard?.name,
            stage: 'new'
          }
        })
      });

      const welcomeEmail = await welcomeEmailResponse.json();

      onStepUpdate?.('Welcome Email Generation', 'complete', 'Email generated');

      // Log successful processing
      logAIActivity({
        agentType: 'onboarding',
        action: 'Full Registration Processing',
        targetId: registrationId,
        targetName: `${registration.firstName} ${registration.lastName}`,
        status: 'success',
        details: {
          member,
          boardMatch,
          welcomeEmail
        },
        aiReasoning: `Matched to ${matchedBoard?.name} with ${Math.round((boardMatch?.confidence || 0.8) * 100)}% confidence`
      });

      setIsProcessing(false);
      
      return {
        status: 'success',
        member: assignedMember,
        boardMatch,
        welcomeEmail
      };

    } catch (error) {
      console.error('AI Processing Error:', error);
      setIsProcessing(false);
      
      logAIActivity({
        agentType: 'onboarding',
        action: 'Processing Failed',
        targetId: registrationId,
        targetName: 'Unknown',
        status: 'error',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      throw error;
    }
  };

  return {
    processRegistration,
    isProcessing
  };
};
