import { useBuildThreadAndRun } from '@refly-packages/ai-workspace-common/hooks/use-build-thread-and-run';
import { Button, Tag, Dropdown, Menu, Tooltip, Switch, Divider } from '@arco-design/web-react';
import { IconCloseCircle, IconFontColors, IconList, IconMore } from '@arco-design/web-react/icon';
import { useResizeBox } from '@refly-packages/ai-workspace-common/hooks/use-resize-box';
import { getPopupContainer } from '@refly-packages/ai-workspace-common/utils/ui';
import { useTranslation } from 'react-i18next';
import { LOCALE } from '@refly/common-types';
import { languageNameToLocale } from '@refly/common-types';
import { BaseContextCard } from './base-context-card';
import { useGetCurrentEnvContext } from '@refly-packages/ai-workspace-common/components/knowledge-base/copilot/context-panel/hooks/use-get-current-env-context';
import { useDispatchAction } from '@refly-packages/ai-workspace-common/skills/main-logic/use-dispatch-action';
import { safeParseURL } from '@refly-packages/utils/url';
import { useKnowledgeBaseStore } from '@refly-packages/ai-workspace-common/stores/knowledge-base';
import { useMemo } from 'react';
import { MemorizedImgIcon } from '@refly-packages/ai-workspace-common/components/memorizedImgIcon';

// resize hook
const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;

// TODO: 目前先写死，后续支持动态添加
const resourceSkills = [
  {
    prompt: '总结',
    key: 'summary',
    title: '总结',
  },
  {
    prompt: '相关内容',
    key: 'relatedResource',
    title: '相关内容',
  },
];

export const WeblinkContextCard = () => {
  const { runSkill } = useBuildThreadAndRun();
  const { dispatch } = useDispatchAction();
  const { hasContent } = useGetCurrentEnvContext();
  const currentResource = useKnowledgeBaseStore((state) => state.currentResource);
  const disabled = !hasContent;

  const { t, i18n } = useTranslation();
  const uiLocale = (i18n?.languages?.[0] as LOCALE) || LOCALE.EN;
  const localeList = languageNameToLocale?.[uiLocale];

  console.log('NoteSelectedContextPanel', uiLocale, localeList);

  const [containCnt] = useResizeBox({
    getGroupSelector: () => {
      const container = getPopupContainer();
      const elem = container?.querySelector('.context-state-action-list');

      return elem as HTMLElement;
    },
    getResizeSelector: () => {
      const container = getPopupContainer();
      const elems = container?.querySelectorAll('.context-state-action-item') as NodeListOf<HTMLElement>;

      return elems;
    },
    initialContainCnt: resourceSkills.length,
    paddingSize: 0,
    itemSize: 60,
    placeholderWidth: 120,
  });

  console.log('containCnt', containCnt);

  const dropList = (
    <Menu>
      {resourceSkills.slice(containCnt).map((skill, index) => {
        return (
          <MenuItem
            key={`${skill.key}`}
            onClick={() => {
              runSkill(skill?.prompt);
            }}
          >
            {skill.title}
          </MenuItem>
        );
      })}
    </Menu>
  );

  const skillLen = resourceSkills.length;
  const skillContent = (
    <div className="context-state-action-list">
      <Button
        type="primary"
        size="mini"
        className="context-state-action-item"
        disabled={disabled}
        style={{ borderRadius: 8 }}
        onClick={() => {
          // 保存相关逻辑
          dispatch({
            name: 'saveToKnowledgeBase',
            type: 'state',
            body: {
              modalVisible: true,
            },
          });
        }}
      >
        保存
      </Button>
      <Divider type="vertical" style={{ margin: '0 4px' }} />
      {resourceSkills.slice(0, containCnt).map((skill, index) => (
        <Button
          type="outline"
          size="mini"
          className="context-state-action-item"
          key={index}
          disabled={disabled}
          style={{ borderRadius: 8 }}
          onClick={() => {
            runSkill(skill?.prompt);
          }}
        >
          {skill.title}
        </Button>
      ))}
      {containCnt >= skillLen || skillLen === 0 ? null : (
        <Dropdown droplist={dropList}>
          <Button
            type="primary"
            size="mini"
            className="context-state-action-item"
            icon={<IconMore />}
            style={{ borderRadius: 8, paddingLeft: 8 }}
          >
            更多
          </Button>
        </Dropdown>
      )}
    </div>
  );

  const icon = <MemorizedImgIcon url={currentResource?.data?.url} />;

  return (
    <div className="note-selected-context-panel">
      <BaseContextCard title="当前网页快捷操作" skillContent={skillContent} icon={icon} />
    </div>
  );
};