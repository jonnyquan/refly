import { useEffect, useState } from 'react';
// 自定义样式
import './index.scss';

import { Button, Checkbox, Radio, InputNumber, Input, Form, FormInstance } from '@arco-design/web-react';
import { IconFile, IconRefresh } from '@arco-design/web-react/icon';
import { GrDocumentConfig } from 'react-icons/gr';
import { PiEyeSlash } from 'react-icons/pi';

import {
  DynamicConfigItem,
  DynamicConfigValue,
  SkillTemplateConfig,
  SkillTemplateConfigSchema,
} from '@refly/openapi-schema';
import { useTranslation } from 'react-i18next';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

const getFormField = (fieldPrefix: string, key: string) => {
  return `${fieldPrefix ? fieldPrefix + '.' : ''}${key}`;
};

const getDictValue = (dict: { [key: string]: string }, locale: string) => {
  return dict?.[locale] || dict?.en;
};

const ConfigItem = (props: {
  item: DynamicConfigItem;
  form: FormInstance;
  field: string;
  locale: string;
  configValue?: DynamicConfigValue;
}): React.ReactNode => {
  const { item, form, field, locale, configValue } = props;

  useEffect(() => {
    const formValue = form.getFieldValue(field);
    if (item?.defaultValue && !formValue) {
      form.setFieldValue(field, {
        value: item.defaultValue,
        label: getDictValue(item.labelDict, locale),
        displayValue: String(item.defaultValue),
      });
    }
  }, [item?.defaultValue]);

  if (!item) {
    return null;
  }

  const label = getDictValue(item.labelDict, locale);
  const placeholder = getDictValue(item.descriptionDict, locale);

  const onValueChange = (val: any, displayValue: string) => {
    form.setFieldValue(field, {
      value: val,
      label,
      displayValue,
    } as DynamicConfigValue);
  };

  if (item.inputMode === 'input') {
    return (
      <Input
        placeholder={placeholder}
        defaultValue={String(configValue?.value || '')}
        onChange={(val) => {
          onValueChange(val, String(val));
        }}
      />
    );
  }

  if (item.inputMode === 'inputTextArea') {
    console.log(`item.defaultValue`, item.defaultValue, configValue?.value);
    return (
      <TextArea
        placeholder={placeholder}
        defaultValue={String(configValue?.value || '')}
        rows={4}
        autoSize={{
          minRows: 4,
          maxRows: 10,
        }}
        onChange={(val) => onValueChange(val, String(val))}
      />
    );
  }

  if (item.inputMode === 'inputNumber') {
    return (
      <InputNumber
        mode="button"
        defaultValue={Number(configValue?.value)}
        onChange={(val) => onValueChange(val, val || val === 0 ? String(val) : '')}
      />
    );
  }

  if (item.inputMode === 'select' || item.inputMode === 'multiSelect') {
    const optionValToDisplay = new Map(
      item.options.map((option) => [option.value, getDictValue(option.labelDict, locale)]),
    );

    if (item.inputMode === 'multiSelect') {
      return (
        <Checkbox.Group
          options={item.options.map((option) => ({
            label: getDictValue(option.labelDict, locale),
            value: option.value,
          }))}
          style={{ fontSize: '10px' }}
          defaultValue={configValue?.value as string[]}
          onChange={(val) => {
            console.log('val', val);
            onValueChange(
              val,
              Array.isArray(val) ? val.map((v) => optionValToDisplay.get(v)).join(',') : optionValToDisplay.get(val),
            );
          }}
        />
      );
    }

    return (
      <Radio.Group
        defaultValue={configValue?.value}
        onChange={(checkedValue) => {
          console.log('checkedValue', checkedValue, optionValToDisplay.get(checkedValue));
          onValueChange(checkedValue, optionValToDisplay.get(checkedValue));
        }}
      >
        {item.options.map((option) => (
          <Radio key={option.value} value={option.value}>
            {getDictValue(option.labelDict, locale)}
          </Radio>
        ))}
      </Radio.Group>
    );
  }

  return null;
};

interface ConfigManagerProps {
  schema: SkillTemplateConfigSchema;
  form: FormInstance;
  tplConfig?: SkillTemplateConfig;
  fieldPrefix?: string;
  headerTitle?: string;
  headerIcon?: React.ReactNode;
  configScope?: 'runtime' | 'template';
  formErrors: Record<string, string>;
  resetConfig?: () => void;
  setFormErrors: (errors: any) => void;
}

export const ConfigManager = (props: ConfigManagerProps) => {
  const { i18n, t } = useTranslation();
  const locale = i18n.languages?.[0] || 'en';

  const { schema, fieldPrefix, form, tplConfig, configScope, formErrors, setFormErrors } = props;
  const [activeConfig, setActiveConfig] = useState<DynamicConfigItem>();
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [resetCounter, setResetCounter] = useState<number>(0);

  const isConfigItemRequired = (schemaItem: DynamicConfigItem) => {
    return schemaItem?.required?.value && schemaItem?.required?.configScope.includes(configScope);
  };

  const validateField = (field: string, value: any) => {
    const schemaItem = schema.items.find((item) => getFormField(fieldPrefix, item.key) === field);
    if (isConfigItemRequired(schemaItem)) {
      const value_ = value?.value;
      if ((!value_ && value_ !== 0) || (Array.isArray(value_) && !value_.length)) {
        setFormErrors((prev) => ({ ...prev, [field]: t('common.emptyInput') }));
      } else {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  const validateTplConfig = (tplConfig: SkillTemplateConfig) => {
    const errors = {};
    Object.keys(tplConfig).forEach((key) => {
      const schemaItem = (schema.items || []).find((item) => item.key === key);
      if (isConfigItemRequired(schemaItem)) {
        const value_ = tplConfig[key].value;
        if ((!value_ && value_ !== 0) || (Array.isArray(value_) && !value_.length)) {
          errors[getFormField(fieldPrefix, key)] = t('common.emptyInput');
        }
      }
    });
    return errors;
  };

  const getItemError = (key: string) => {
    const field = getFormField(fieldPrefix, key);
    return formErrors[field];
  };

  useEffect(() => {
    if (tplConfig) {
      form.setFieldValue(fieldPrefix, tplConfig);
    } else {
      form.setFieldValue(fieldPrefix, {});
    }

    setResetCounter((prev) => prev + 1);
    setShowConfig(false);
    setActiveConfig(undefined);
    const errors = validateTplConfig(tplConfig);
    setFormErrors(errors);
  }, [tplConfig]);

  const handleConfigItemClick = (item: DynamicConfigItem) => {
    if (activeConfig?.key === item.key) {
      setActiveConfig(undefined);
      setShowConfig(false);
    } else {
      setActiveConfig(item);
      setShowConfig(true);
    }
  };

  const handleReset = (key: string) => {
    const resetValue = tplConfig?.[key];
    form.setFieldValue(getFormField(fieldPrefix, key), resetValue);
    setResetCounter((prev) => prev + 1);
  };

  return (
    <div className="config-manager">
      <div className="config-manager__items">
        <div className="config-manager__item">
          <GrDocumentConfig className="config-manager__item-icon" />
          {t('copilot.configManager.title')}
        </div>
        {(schema.items || []).map((item, index) => (
          <div
            key={item.key + index}
            className={`config-manager__item config-item ${activeConfig?.key === item.key ? 'active' : ''} ${getItemError(item.key) ? 'error' : ''}`}
            onClick={() => {
              handleConfigItemClick(item);
            }}
          >
            <IconFile className="config-manager__item-icon" />

            {form.getFieldValue(getFormField(fieldPrefix, item.key))?.displayValue && (
              <div className="content">{form.getFieldValue(getFormField(fieldPrefix, item.key))?.displayValue}</div>
            )}

            <div
              className="item-key"
              style={{ color: getItemError(item.key) && !(activeConfig?.key === item.key) ? '#f00' : '#000' }}
            >
              {getDictValue(item.labelDict, locale)}
            </div>
          </div>
        ))}
      </div>

      {showConfig && activeConfig && (
        <div className={`config-manager__input ${getItemError(activeConfig.key) ? 'error' : ''}`}>
          <div className="config-manager__input-top">
            <div>
              {activeConfig.required?.value && activeConfig?.required?.configScope.includes(configScope) && (
                <span style={{ color: 'red' }}>* </span>
              )}
              {getDictValue(activeConfig.labelDict, locale)}
            </div>
            <div>
              <Button icon={<IconRefresh />} onClick={() => handleReset(activeConfig.key)}>
                {t('common.reset')}
              </Button>
              <Button
                icon={<PiEyeSlash />}
                onClick={() => {
                  setShowConfig(false);
                  setActiveConfig(undefined);
                }}
              >
                {t('common.collapse')}
              </Button>
            </div>
          </div>
          <Form
            form={form}
            onValuesChange={(changedValues, allValues) => {
              Object.keys(changedValues).forEach((field) => {
                validateField(field, changedValues[field]);
              });
            }}
          >
            {(() => {
              const field = getFormField(fieldPrefix, activeConfig.key);
              return (
                <div key={activeConfig.key}>
                  <div className="config-manager__input-content">
                    <Form.Item
                      layout="vertical"
                      field={field}
                      required={
                        activeConfig.required?.value && activeConfig?.required?.configScope.includes(configScope)
                      }
                      validateStatus={formErrors[field] ? 'error' : undefined}
                      help={formErrors[field]}
                    >
                      <ConfigItem
                        key={resetCounter}
                        item={activeConfig}
                        form={form}
                        field={field}
                        locale={locale}
                        configValue={form.getFieldValue(field)}
                      />
                    </Form.Item>
                  </div>
                </div>
              );
            })()}
          </Form>
        </div>
      )}
    </div>
  );
};