
export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RESOLVED = 'RESOLVED'
}

export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE'
}

export enum UserRole {
  STUDENT = 'STUDENT',
  WARDEN = 'WARDEN'
}

export enum EntryStatus {
  IN = 'Inside Campus',
  OUT = 'Outside Campus'
}

export enum BiometricType {
  FINGERPRINT = 'FINGERPRINT',
  FACE = 'FACE',
  IRIS = 'IRIS'
}

export interface Student {
  id: string;
  name: string;
  email: string;
  roomNumber: string;
  hostelName: string;
  studentId: string;
  phone: string;
  address: string;
  attendance: number;
}

export interface EntryExitRecord {
  id: string;
  studentName: string;
  studentId: string;
  roomNumber: string;
  time: string;
  status: EntryStatus;
  method: 'QR' | 'MANUAL' | 'BIOMETRIC';
}

export interface Room {
  id: string;
  number: string;
  type: string;
  capacity: number;
  occupied: number;
  status: 'AVAILABLE' | 'FULL' | 'MAINTENANCE';
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
  student?: {
    name: string;
    room: string;
  };
  assignedTo?: string;
}

export interface LeaveRequest {
  id: string;
  reason: string;
  type: string;
  outDate: string;
  inDate: string;
  outTime?: string;
  inTime?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  createdAt: string;
  approvedAt?: string;
  rejectionReason?: string;
  student?: {
    name: string;
    room: string;
  };
  approvedBy?: string;
}

export interface FeeRecord {
  id: string;
  month: string;
  amount: number;
  status: PaymentStatus;
  paymentDate?: string;
}
