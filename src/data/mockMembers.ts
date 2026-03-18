export interface Member {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  boardId: string;
  boardName: string;
  memberNumber: string;
  status: 'active' | 'pending' | 'expired' | 'inactive';
  duesStatus: 'paid' | 'unpaid' | 'partial';
  trainingCompletion: number;
  joinDate: string;
  certifications: string[];
  registrationSource: 'iaabou' | 'refsec' | 'manual';
  progressionStage: 'new' | 'rules-test' | 'mechanics-course' | 'board-assigned' | 'active';
  holdingBoard: boolean;
  rulesTestCompletedDate?: string;
  mechanicsCompletedDate?: string;
  boardAssignmentDate?: string;
  // New fields for workflow
  statusCode1: 'IUR' | 'AO';
  statusCode2: 'NEW' | 'M' | 'N';
  primaryBoardId: string;
  primaryBoardName: string;
  secondaryBoardId?: string;
  secondaryBoardName?: string;
  isAssociateMember: boolean;
  paymentStatus: 'not-required' | 'pending' | 'marked-paid' | 'approved';
  paymentMarkedDate?: string;
  pendingActivation: boolean;
  currentCourse?: string;
  courseProgress: number;
  nextCourse?: string;
  // LearnDash integration
  learndashUserId?: number;
}

const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Andrew', 'Paul', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Carol', 'Amanda', 'Dorothy', 'Melissa'];

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

const boards = [
  { id: 'board-1', name: 'Brooklyn Basketball Officials' },
  { id: 'board-2', name: 'Bronx Officials Association' },
  { id: 'board-3', name: 'Northeast Regional Board' },
  { id: 'board-4', name: 'Queens Basketball Officials' },
  { id: 'board-5', name: 'Midwest Officials Board' },
  { id: 'board-900', name: 'Holding Board 900' }
];

const statuses: Array<'active' | 'pending' | 'expired' | 'inactive'> = ['active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'pending', 'expired', 'inactive'];

const duesStatuses: Array<'paid' | 'unpaid' | 'partial'> = ['paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'unpaid', 'unpaid'];

const certifications = [
  'NFHS Rules Certified',
  'Three-Person Mechanics',
  'Shot Clock Procedures',
  'Advanced Officiating',
  'Crew Chief Certification'
];

const registrationSources: Array<'iaabou' | 'refsec' | 'manual'> = ['iaabou', 'iaabou', 'iaabou', 'refsec', 'manual'];

const progressionStages: Array<'new' | 'rules-test' | 'mechanics-course' | 'board-assigned' | 'active'> = [
  'active', 'active', 'active', 'active', 'active', 'board-assigned', 'mechanics-course', 'rules-test', 'new'
];

function generateMember(index: number): Member {
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
  const status = statuses[index % statuses.length];
  const duesStatus = duesStatuses[index % duesStatuses.length];
  const source = registrationSources[index % registrationSources.length];
  const stage = progressionStages[index % progressionStages.length];
  
  // Determine status codes based on progression stage
  let statusCode1: 'IUR' | 'AO';
  let statusCode2: 'NEW' | 'M' | 'N';
  let currentCourse: string | undefined;
  let nextCourse: string | undefined;
  let courseProgress: number;
  let paymentStatus: 'not-required' | 'pending' | 'marked-paid' | 'approved';
  
  if (stage === 'new' || stage === 'rules-test') {
    statusCode1 = 'IUR';
    statusCode2 = 'NEW';
    currentCourse = 'IAABO University Rules Test';
    nextCourse = 'Mechanics Course';
    courseProgress = stage === 'new' ? Math.floor(20 + Math.random() * 30) : Math.floor(60 + Math.random() * 40);
    paymentStatus = 'not-required';
  } else if (stage === 'mechanics-course') {
    statusCode1 = 'AO';
    statusCode2 = 'M';
    currentCourse = 'Mechanics Course';
    nextCourse = undefined;
    courseProgress = Math.floor(30 + Math.random() * 50);
    paymentStatus = 'not-required';
  } else if (stage === 'board-assigned') {
    statusCode1 = 'AO';
    statusCode2 = 'M';
    currentCourse = undefined;
    nextCourse = undefined;
    courseProgress = 100;
    paymentStatus = Math.random() > 0.5 ? 'pending' : 'marked-paid';
  } else {
    statusCode1 = 'AO';
    statusCode2 = 'N';
    currentCourse = undefined;
    nextCourse = undefined;
    courseProgress = 100;
    paymentStatus = 'approved';
  }
  
  // Determine if member is in holding board
  const isHoldingBoard = stage === 'new' || stage === 'rules-test' || stage === 'mechanics-course';
  const primaryBoard = isHoldingBoard ? boards[5] : boards[index % 5];
  const secondaryBoard = isHoldingBoard ? boards[index % 5] : undefined;
  
  // Generate dates based on progression stage
  const joinDate = new Date(2024, 8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 28) + 1);
  const rulesDate = stage !== 'new' ? new Date(joinDate.getTime() + 7 * 24 * 60 * 60 * 1000) : undefined;
  const mechanicsDate = stage === 'mechanics-course' || stage === 'board-assigned' || stage === 'active' 
    ? new Date((rulesDate || joinDate).getTime() + 14 * 24 * 60 * 60 * 1000) 
    : undefined;
  const assignmentDate = stage === 'board-assigned' || stage === 'active'
    ? new Date((mechanicsDate || joinDate).getTime() + 7 * 24 * 60 * 60 * 1000)
    : undefined;
  const paymentDate = paymentStatus === 'marked-paid' || paymentStatus === 'approved'
    ? new Date((mechanicsDate || joinDate).getTime() + 3 * 24 * 60 * 60 * 1000)
    : undefined;
  
  return {
    id: `member-${index + 1}`,
    userId: `user-${index + 1}`,
    fullName: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    phone: `(555) ${String(Math.floor(100 + Math.random() * 900))}-${String(Math.floor(1000 + Math.random() * 9000))}`,
    boardId: primaryBoard.id,
    boardName: primaryBoard.name,
    memberNumber: `M${String(index + 1).padStart(5, '0')}`,
    status,
    duesStatus,
    trainingCompletion: Math.floor(60 + Math.random() * 40),
    joinDate: joinDate.toISOString(),
    certifications: certifications.slice(0, Math.floor(Math.random() * 3) + 1),
    registrationSource: source,
    progressionStage: stage,
    holdingBoard: isHoldingBoard,
    rulesTestCompletedDate: rulesDate?.toISOString(),
    mechanicsCompletedDate: mechanicsDate?.toISOString(),
    boardAssignmentDate: assignmentDate?.toISOString(),
    statusCode1,
    statusCode2,
    primaryBoardId: primaryBoard.id,
    primaryBoardName: primaryBoard.name,
    secondaryBoardId: secondaryBoard?.id,
    secondaryBoardName: secondaryBoard?.name,
    isAssociateMember: isHoldingBoard,
    paymentStatus,
    paymentMarkedDate: paymentDate?.toISOString(),
    pendingActivation: paymentStatus === 'marked-paid',
    currentCourse,
    courseProgress,
    nextCourse
  };
}

export const mockMembers: Member[] = Array.from({ length: 500 }, (_, i) => generateMember(i));

// Current logged-in user for testing
export const mockCurrentUser: Member = {
  ...generateMember(7), // rules-test stage
  fullName: 'John Smith',
  email: 'john.smith@email.com',
  memberNumber: 'M12345',
  learndashUserId: 1 // Maps to LearnDash user ID
};
