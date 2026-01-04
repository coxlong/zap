import { ComponentPropsWithoutRef } from 'react';

interface AIChatCandidateProps extends ComponentPropsWithoutRef<'div'> {
  model: string;
  isDefault?: boolean;
}

export function AIChatCandidate({
  model,
  isDefault,
  ...props
}: AIChatCandidateProps) {
  return (
    <div {...props} className="flex items-center justify-between w-full">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="font-medium text-base text-gray-900 leading-tight truncate">
            AI 对话
          </div>
          {isDefault && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
              默认
            </span>
          )}
        </div>

        <div className="text-xs text-gray-500 mt-0.5 truncate">
          <span className="font-mono">{model}</span>
        </div>
      </div>

      <div className="text-xs text-gray-400">点击或 Enter 打开</div>
    </div>
  );
}
