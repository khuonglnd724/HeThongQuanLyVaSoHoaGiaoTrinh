export type WorkflowAction =
  | 'SUBMIT'
  | 'APPROVE'
  | 'REJECT'
  | 'REQUIRE_EDIT'

export interface WorkflowHistory {
  actor: string
  role: string
  action: WorkflowAction
  timestamp: string
  comment?: string
}
