export type ParticipantRole = 'exhibitor' | 'visitor' | 'staff';

export type ParticipantType = {
  id: string;
  name: string;
  role: ParticipantRole;
};
