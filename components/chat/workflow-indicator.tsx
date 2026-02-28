'use client';

/**
 * WorkflowIndicator
 * Shows a horizontal step-tracker when an agent workflow is active.
 */

import { WorkflowType, WorkflowStep } from '@/lib/agent-types';

interface Props {
  workflowType: WorkflowType | null;
  currentStep: WorkflowStep | null;
}

const WORKFLOW_STEPS: Record<WorkflowType, { key: WorkflowStep; label: string }[]> = {
  INFORMATION_RETRIEVAL: [
    { key: 'FETCH_INFO', label: 'Fetch Data' },
    { key: 'DONE', label: 'Complete' },
  ],
  CARD_ACTION: [
    { key: 'VERIFY_CARD', label: 'Verify Card' },
    { key: 'GENERATE_OTP', label: 'Send OTP' },
    { key: 'AWAIT_OTP', label: 'Enter OTP' },
    { key: 'VERIFY_OTP', label: 'Verify OTP' },
    { key: 'EXECUTE_ACTION', label: 'Apply Action' },
    { key: 'DONE', label: 'Done' },
  ],
  COMPLAINT_LIFECYCLE: [
    { key: 'GATHER_DETAILS', label: 'Details' },
    { key: 'VERIFY_COMPLAINT', label: 'Verify' },
    { key: 'CREATE_CASE', label: 'Create Case' },
    { key: 'AWAIT_SATISFACTION', label: 'Review' },
    { key: 'DONE', label: 'Done' },
  ],
};

const WORKFLOW_LABELS: Record<WorkflowType, string> = {
  INFORMATION_RETRIEVAL: 'Information Retrieval',
  CARD_ACTION: 'Card Action (OTP Required)',
  COMPLAINT_LIFECYCLE: 'Complaint Lifecycle',
};

const WORKFLOW_COLORS: Record<WorkflowType, string> = {
  INFORMATION_RETRIEVAL: 'bg-blue-500',
  CARD_ACTION: 'bg-yellow-500',
  COMPLAINT_LIFECYCLE: 'bg-red-500',
};

export function WorkflowIndicator({ workflowType, currentStep }: Props) {
  if (!workflowType || !currentStep || currentStep === 'DONE') return null;

  const steps = WORKFLOW_STEPS[workflowType] ?? [];
  const currentIdx = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="border-b border-border bg-muted/40 px-3 py-2">
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className={`h-1.5 w-1.5 rounded-full ${WORKFLOW_COLORS[workflowType]} animate-pulse`} />
        <span className="text-xs font-medium text-muted-foreground">
          {WORKFLOW_LABELS[workflowType]}
        </span>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = step.key === currentStep;
          return (
            <div key={step.key} className="flex items-center gap-1 flex-shrink-0">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold transition-colors ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : isCurrent
                    ? `${WORKFLOW_COLORS[workflowType]} text-white`
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span
                className={`text-[10px] ${
                  isCurrent
                    ? 'font-semibold text-foreground'
                    : isCompleted
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
              {idx < steps.length - 1 && (
                <div
                  className={`h-px w-3 ${isCompleted ? 'bg-primary' : 'bg-border'}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
