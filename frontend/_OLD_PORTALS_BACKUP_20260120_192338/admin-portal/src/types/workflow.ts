export type WorkflowState =
  | 'DRAFT'
  | 'REVIEW'
  | 'APPROVED'
  | 'REJECTED'

export interface WorkflowItem {
  id: string            
  entityId: string     
  entityType: string
  state: WorkflowState
  createdAt?: string
}