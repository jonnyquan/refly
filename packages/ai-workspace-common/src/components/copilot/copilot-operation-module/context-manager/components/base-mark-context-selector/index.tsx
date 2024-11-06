import React from 'react';
import './index.scss';
import { BaseSearchAndSelector } from '../base-search-and-selector';
import classNames from 'classnames';
import { Mark } from '@refly/common-types';
import { MessageIntentSource } from '@refly-packages/ai-workspace-common/types/copilot';

interface CustomProps {
  showList?: boolean;
  onClickOutside?: () => void;
  onSearchValueChange?: (value: string) => void;
  onSelect?: (item: Mark) => void;
  selectedItems: Mark[];
  onClose?: () => void;
  source: MessageIntentSource;
}

export interface BaseMarkContextSelectorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'>,
    CustomProps {}

export const BaseMarkContextSelector = (props: BaseMarkContextSelectorProps) => {
  const { onClickOutside, onSearchValueChange, onClose, onSelect, selectedItems, source, ...divProps } = props;

  return (
    <div {...divProps} className={classNames('refly-base-context-selector', divProps?.className)}>
      <BaseSearchAndSelector
        onSelect={(item) => {
          onSelect?.(item);
        }}
        onClose={onClose}
        showList={true}
        selectedItems={selectedItems}
        source={source}
      />
    </div>
  );
};