import { Button, Checkbox, Form } from '@arco-design/web-react';
// 自定义样式
import './index.scss';
// 自定义组件
import { memo, useEffect, useState } from 'react';
import { ChatInput } from './chat-input';
import { SkillDisplay } from './skill-display';
import { ChatInputAssistAction } from './chat-input-assist-action';
import { ContextManager } from './context-manager';
import { ChatActions } from './chat-actions';
import { SelectedSkillHeader } from './selected-skill-header';
import { ConfigManager } from './config-manager';
//stores
import { useSkillStore } from '@refly-packages/ai-workspace-common/stores/skill';

// utils
import { useMessageStateStore } from '@refly-packages/ai-workspace-common/stores/message-state';
import { SelectedInstanceCard } from '@refly-packages/ai-workspace-common/components/skill/selected-instance-card';
// hooks
import { useCopilotContextState } from '@refly-packages/ai-workspace-common/hooks/use-copilot-context-state';

interface CopilotInputModuleProps {
  source?: string;
  chatContainerHeight?: number;
  operationContainerHeight?: number;
}

export const CopilotOperationModule = memo((props: CopilotInputModuleProps) => {
  const { source, chatContainerHeight, operationContainerHeight } = props;
  const messageStateStore = useMessageStateStore((state) => ({
    pending: state.pending,
    pendingFirstToken: state.pendingFirstToken,
    resetState: state.resetState,
  }));
  const skillStore = useSkillStore((state) => ({
    selectedSkill: state.selectedSkill,
    setSelectedSkillInstance: state.setSelectedSkillInstance,
  }));

  const { contextCardHeight, computedShowContextCard, showContextState } = useCopilotContextState();

  const [form] = Form.useForm();

  useEffect(() => {
    if (!skillStore.selectedSkill?.tplConfigSchema?.items?.length) {
      form.setFieldValue('tplConfig', undefined);
    }
  }, [skillStore.selectedSkill?.skillId, skillStore.selectedSkill?.tplConfigSchema?.items]);

  return (
    <>
      <div className="ai-copilot-operation-container">
        <div className="ai-copilot-operation-body">
          <SkillDisplay source={source} />
          <div className="ai-copilot-chat-container">
            <div className="chat-input-container">
              <SelectedSkillHeader />
              <ContextManager />
              <div className="chat-input-body">
                <ChatInput
                  tplConfig={form.getFieldValue('tplConfig')}
                  placeholder="提出问题，发现新知"
                  autoSize={{ minRows: 1, maxRows: 3 }}
                />
              </div>

              {skillStore.selectedSkill?.tplConfigSchema?.items?.length > 0 && (
                <ConfigManager
                  form={form}
                  schema={skillStore.selectedSkill?.tplConfigSchema}
                  tplConfig={skillStore.selectedSkill?.tplConfig}
                  fieldPrefix="tplConfig"
                  configScope="runtime"
                  resetConfig={() => {
                    form.setFieldValue('tplConfig', skillStore.selectedSkill?.tplConfig || {});
                  }}
                />
              )}

              <ChatActions />
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
