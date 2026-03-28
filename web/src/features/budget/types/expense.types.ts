import type { Currency } from './budget.types';

export type ExpenseStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'paid'
  | 'cancelled';
export type ExpenseType = 'invoice' | 'receipt' | 'contract' | 'other';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'other';

export interface ExpenseAttachment {
  id: string;
  expenseId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Expense {
  id: string;
  budgetId: string;
  categoryId: string;
  organizationId: string;
  title: string;
  description: string;
  type: ExpenseType;
  status: ExpenseStatus;
  amount: number;
  currency: Currency;
  amountRUB: number;
  expenseDate: string;
  dueDate: string | null;
  paidDate: string | null;
  createdAt: string;
  updatedAt: string;
  paymentMethod: PaymentMethod;
  invoiceNumber: string | null;
  contractNumber: string | null;
  createdBy: string;
  createdByName: string;
  vendor: string;
  vendorINN: string | null;
  requiresApproval: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected' | null;
  approvedBy: string | null;
  approvedByName: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  attachments: ExpenseAttachment[];
  attachmentCount: number;
  categoryName: string;
  categoryPath: string;
  onecId: string | null;
  onecSynced: boolean;
  lastSyncAt: string | null;
  tags: string[];
  notes: string;
}

export interface ExpenseFilters {
  search: string;
  categoryIds: string[];
  statuses: ExpenseStatus[];
  types: ExpenseType[];
  dateFrom: string;
  dateTo: string;
  amountMin: number;
  amountMax: number;
  vendors: string[];
  createdBy: string[];
}
