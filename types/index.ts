import { UserRole, BuildingType, PaymentStatus, ProjectStatus, ComplaintStatus } from '@prisma/client'

export type {
  UserRole,
  BuildingType,
  PaymentStatus,
  ProjectStatus,
  ComplaintStatus
}

export interface User {
  id: string
  name: string
  phone: string
  email: string
  password: string
  role: UserRole
  buildingId?: string | null
  unitId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Building {
  id: string
  name: string
  type: BuildingType
  totalBlocks: number
  address: string
  createdAt: Date
  updatedAt: Date
}

export interface Unit {
  id: string
  buildingId: string
  blockName: string
  doorNo: string
  floor: string
  ownerName: string
  residentPhone: string
  createdAt: Date
  updatedAt: Date
}

export interface Dues {
  id: string
  unitId: string
  amount: number
  month: number
  year: number
  status: PaymentStatus
  dueDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface SpecialProject {
  id: string
  buildingId: string
  title: string
  totalAmount: number
  perUnitAmount: number
  description?: string | null
  status: ProjectStatus
  createdAt: Date
  updatedAt: Date
}

export interface ProjectPayment {
  id: string
  projectId: string
  unitId: string
  status: PaymentStatus
  createdAt: Date
  updatedAt: Date
}

export interface Complaint {
  id: string
  buildingId: string
  userId?: string | null
  subject: string
  description: string
  status: ComplaintStatus
  createdAt: Date
  updatedAt: Date
}

export interface CreateComplaintInput {
  buildingId: string
  subject: string
  description: string
}

export interface CreateDuesInput {
  unitId: string
  amount: number
  month: number
  year: number
  dueDate: Date
}

export interface CreateProjectInput {
  buildingId: string
  title: string
  totalAmount: number
  description?: string
}

export interface AuthSession {
  user: {
    id: string
    name: string
    email: string
    role: UserRole
    buildingId?: string | null
    unitId?: string | null
  }
  expires: string
}
