import { Member } from "@/data/mockMembers";
import { Registration } from "@/data/mockRegistrations";
import { findLearnDashUserByEmail, linkMemberToLearnDash } from "@/services/learndashUserMapping";

export async function createMemberFromRegistration(registration: Registration): Promise<Member> {
  const memberNumber = `M-${Date.now().toString().slice(-6)}`;
  const userId = `user-${Date.now()}`;
  
  const member: Member = {
    id: userId,
    userId: userId,
    fullName: `${registration.firstName} ${registration.lastName}`,
    email: registration.email,
    phone: registration.phone,
    memberNumber: memberNumber,
    boardId: "board-900",
    boardName: "Holding Board 900",
    primaryBoardId: "board-900",
    primaryBoardName: "Holding Board 900",
    status: "pending",
    duesStatus: "unpaid",
    progressionStage: "new",
    trainingCompletion: 0,
    certifications: [],
    registrationSource: registration.source,
    holdingBoard: true,
    statusCode1: "IUR",
    statusCode2: "NEW",
    joinDate: new Date().toISOString(),
    paymentStatus: "not-required",
    pendingActivation: false,
    currentCourse: registration.courseEnrolled,
    courseProgress: 0,
    isAssociateMember: false
  };

  // Try to link to LearnDash automatically
  try {
    const learndashUserId = await findLearnDashUserByEmail(registration.email);
    if (learndashUserId) {
      linkMemberToLearnDash(userId, learndashUserId, registration.email);
      member.learndashUserId = learndashUserId;
    }
  } catch (error) {
    console.error('Failed to auto-link LearnDash user:', error);
  }

  return member;
}

export function assignBoardToMember(member: Member, boardId: string, boardName: string): Member {
  return {
    ...member,
    boardId,
    boardName,
    primaryBoardId: boardId,
    primaryBoardName: boardName,
    holdingBoard: false,
    progressionStage: "board-assigned",
    boardAssignmentDate: new Date().toISOString()
  };
}

export function activateMember(member: Member): Member {
  return {
    ...member,
    status: "active",
    pendingActivation: false,
    progressionStage: "active",
    statusCode1: "AO",
    statusCode2: "N"
  };
}

export function completeRulesTest(member: Member): Member {
  return {
    ...member,
    progressionStage: "rules-test",
    rulesTestCompletedDate: new Date().toISOString(),
    trainingCompletion: 33,
    statusCode1: "AO",
    statusCode2: "M"
  };
}

export function completeMechanicsCourse(member: Member): Member {
  return {
    ...member,
    progressionStage: "mechanics-course",
    mechanicsCompletedDate: new Date().toISOString(),
    trainingCompletion: 66,
    statusCode2: "N"
  };
}
