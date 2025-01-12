import { memo } from 'react';
import { IconType } from 'react-icons';

interface NodeHeaderProps {
  title: string;
  Icon: IconType;
  iconBgColor?: string;
}

export const NodeHeader = memo(({ title, Icon, iconBgColor = '#17B26A' }: NodeHeaderProps) => {
  return (
    <div className="flex-shrink-0 mb-3">
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded shadow-[0px_2px_4px_-2px_rgba(16,24,60,0.06),0px_4px_8px_-2px_rgba(16,24,60,0.1)] flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium leading-normal text-[rgba(0,0,0,0.8)] truncate">{title}</span>
      </div>
    </div>
  );
});