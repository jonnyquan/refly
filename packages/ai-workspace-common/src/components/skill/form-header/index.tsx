import React, { useState } from 'react';
import { Typography, Radio, Checkbox, Space, Switch, Select, Tooltip } from '@arco-design/web-react';
import { IconDown, IconUp } from '@arco-design/web-react/icon';
import { useTranslation } from 'react-i18next';

// styles
import './index.scss';

interface Option {
  label: string;
  value: string;
}

interface FormHeaderProps {
  title: string;
  icon?: React.ReactNode;
  options?: Option[];
  enableSelect?: boolean;
  enableCollapse?: boolean;
  enableMultiSelect?: boolean;
  onSelectChange?: (value: string | string[]) => void;
  onCollapseChange?: (collapsed: boolean) => void;
  collapsed?: boolean;
  selectTooltipTitle?: string;
}

export const FormHeader: React.FC<FormHeaderProps> = ({
  title,
  icon,
  options = [],
  enableSelect = false,
  enableCollapse = false,
  enableMultiSelect = false,
  onSelectChange,
  onCollapseChange,
  collapsed = false,
  selectTooltipTitle,
}) => {
  const [isMultiSelect, setIsMultiSelect] = useState(enableMultiSelect);
  const { t } = useTranslation();

  const handleSelectChange = (value: string | string[]) => {
    if (onSelectChange) {
      onSelectChange(value);
    }
  };

  const handleCollapseChange = () => {
    if (onCollapseChange) {
      onCollapseChange(!collapsed);
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setIsMultiSelect(checked);
    // Reset selection when switching between single and multi-select
    if (onSelectChange) {
      onSelectChange(checked ? [] : '');
    }
  };

  return (
    <div className="form-header">
      <div className="form-header-left" onClick={handleCollapseChange}>
        {enableCollapse && (
          <Typography.Text style={{ color: 'rgba(0, 0, 0, .5)' }}>
            {collapsed ? <IconDown /> : <IconUp />}
          </Typography.Text>
        )}
        {icon && <div className="form-header-icon">{icon}</div>}
        <Typography.Title heading={6} style={{ margin: 0, marginLeft: 8 }}>
          {title}
        </Typography.Title>
      </div>
      <div
        className="form-header-right"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        {enableSelect && (
          <>
            {!isMultiSelect && (
              <Tooltip content={selectTooltipTitle}>
                <Select
                  size="mini"
                  className="context-selector"
                  defaultValue={options?.[0]?.value}
                  options={options}
                  onChange={handleSelectChange}
                  autoWidth={{ minWidth: 100, maxWidth: 200 }}
                />
              </Tooltip>
            )}
            {/* <Switch
              type="round"
              size="small"
              checked={isMultiSelect}
              onChange={setIsMultiSelect}
              checkedText="多选"
              uncheckedText="单选"
            /> */}
          </>
        )}
      </div>
    </div>
  );
};