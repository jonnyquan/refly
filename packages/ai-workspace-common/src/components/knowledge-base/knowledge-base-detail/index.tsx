import { useUserStore } from '@refly-packages/ai-workspace-common/stores/user';
import { cnGuessQuestions, enGuessQuestions } from '@refly-packages/ai-workspace-common/utils/guess-question';
import { Button, Tabs } from '@arco-design/web-react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

// 自定义组件
import { KnowledgeBaseDirectory } from '../directory';
import { KnowledgeBaseResourceDetail } from '../resource-detail';
import { KnowledgeBaseDetailEmpty } from '../knowledge-base-detail-empty';
// 样式
import './index.scss';
import { useResizePanel } from '@refly-packages/ai-workspace-common/hooks/use-resize-panel';
import { ActionSource, useKnowledgeBaseStore } from '@refly-packages/ai-workspace-common/stores/knowledge-base';
import { KnowledgeBaseListModal } from '../copilot/knowledge-base-list-modal';
import { useKnowledgeBaseTabs } from '@refly-packages/ai-workspace-common/hooks/use-knowledge-base-tabs';
import { getDefaultPopupContainer, getPopupContainer } from '@refly-packages/ai-workspace-common/utils/ui';
import { IconSearch } from '@arco-design/web-react/icon';
import { useSearchStore } from '@refly-packages/ai-workspace-common/stores/search';
import { useSearchParams } from '@refly-packages/ai-workspace-common/utils/router';

const TabPane = Tabs.TabPane;

interface KnowledgeBaseDetailProps {}

export const KnowledgeBaseDetail = (props: KnowledgeBaseDetailProps) => {
  const searchStore = useSearchStore();

  const [queryParams] = useSearchParams();
  const kbId = queryParams.get('kbId');
  // directory minSize 270px ~ maxSize 50%
  const [minSize] = useResizePanel({
    getGroupSelector: () => {
      return document.querySelector('.knowledge-base-detail-panel-container');
    },
    getResizeSelector: () =>
      document.querySelectorAll('.knowledge-base-detail-panel-resize') as NodeListOf<HTMLElement>,
    initialMinSize: 24,
    initialMinPixelSize: 270,
  });

  const { tabs, activeTab, setActiveTab, handleDeleteTab } = useKnowledgeBaseTabs();
  const knowledgeBaseStore = useKnowledgeBaseStore((state) => ({
    kbModalVisible: state.kbModalVisible,
    actionSource: state.actionSource,
  }));
  if (!kbId || kbId === 'undefined' || kbId === 'null') {
    return <KnowledgeBaseDetailEmpty />;
  }

  return (
    <div className="knowledge-base-detail-container">
      <Tabs
        editable
        className="knowledge-base-detail-tab-container"
        type="card-gutter"
        showAddButton={false}
        activeTab={activeTab}
        onDeleteTab={handleDeleteTab}
        onChange={setActiveTab}
        renderTabHeader={(props, DefaultTabHeader) => {
          return (
            <div className="knowledge-base-detail-header">
              <div className="knowledge-base-detail-nav-switcher">
                <DefaultTabHeader {...props} />
              </div>
              <div className="knowledge-base-detail-navigation-bar">
                <Button
                  icon={<IconSearch />}
                  type="text"
                  shape="circle"
                  className="assist-action-item"
                  onClick={() => {
                    searchStore.setPages(searchStore.pages.concat('readResources'));
                    searchStore.setIsSearchOpen(true);
                  }}
                ></Button>
              </div>
            </div>
          );
        }}
      >
        {tabs.map((x, i) => (
          <TabPane destroyOnHide key={x.key} title={x.title}>
            <div></div>
          </TabPane>
        ))}
      </Tabs>
      <PanelGroup direction="horizontal" className="knowledge-base-detail-panel-container">
        <Panel
          // defaultSize={minSize}
          // minSize={minSize}
          maxSize={50}
          // collapsedSize={0}
          collapsible={true}
          className="knowledge-base-detail-directory-panel"
        >
          <KnowledgeBaseDirectory />
        </Panel>
        <PanelResizeHandle className="knowledge-base-detail-panel-resize" />
        <Panel className="knowledge-base-detail-resource-panel" minSize={50}>
          <KnowledgeBaseResourceDetail />
        </Panel>
      </PanelGroup>
      {knowledgeBaseStore?.kbModalVisible && knowledgeBaseStore.actionSource === ActionSource.KnowledgeBase ? (
        <KnowledgeBaseListModal title="知识库" classNames="kb-list-modal" placement="right" width={360} height="100%" />
      ) : null}
    </div>
  );
};
