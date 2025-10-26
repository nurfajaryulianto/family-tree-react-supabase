export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  isLiving: boolean;
  gender: 'male' | 'female' | 'other';
  avatar?: string;
  biography?: string;
  photos?: string[];
  documents?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Relationship {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  type: 'parent' | 'child' | 'spouse' | 'sibling';
  startDate?: string;
  endDate?: string;
}

export interface TreeNode {
  member: FamilyMember;
  x: number;
  y: number;
  children: TreeNode[];
  spouse?: FamilyMember;
  parents: TreeNode[];
}

export interface RadialMenuAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'warning';
}

export interface RadialMenuPosition {
  x: number;
  y: number;
}