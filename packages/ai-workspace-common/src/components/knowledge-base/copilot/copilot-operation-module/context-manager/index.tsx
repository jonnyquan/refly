import { useState } from 'react';
import { ContextItem } from './context-item';
import { ContextPreview } from './context-preview';

// hooks
import { useProcessContextItems } from './hooks/use-process-context-items';
import { useProcessContextFilter } from '@refly-packages/ai-workspace-common/components/knowledge-base/copilot/copilot-operation-module/context-manager/hooks/use-process-context-filter';

// components
import { AddBaseMarkContext } from './components/add-base-mark-context';
import './index.scss';

// components
import { ContentSelectorBtn } from '@refly-packages/ai-workspace-common/modules/content-selector/components/content-selector-btn';
import { ResetContentSelectorBtn } from './reset-content-selector-btn';
import { ContextFilter } from './components/context-filter/index';

// stores
import { useContextPanelStore } from '@refly-packages/ai-workspace-common/stores/context-panel';

// types
import { SearchDomain, SearchResult } from '@refly/openapi-schema';
import { backendBaseMarkTypes, BaseMarkType, frontendBaseMarkTypes, Mark } from '@refly/common-types';
import { useSkillStore } from '@refly-packages/ai-workspace-common/stores/skill';

const mapMarkToSearchResult = (marks: Mark[]): SearchResult[] => {
  let searchResults: SearchResult[] = [];

  searchResults = marks
    .filter((item) => backendBaseMarkTypes.includes(item?.type as BaseMarkType))
    .map((mark) => ({
      id: mark.id,
      domain: mark.type as SearchDomain,
      title: mark.title,
      url: mark.url,
    }));

  return searchResults;
};

export const ContextManager = () => {
  const [activeItemId, setActiveItemId] = useState(null);
  const { processedContextItems } = useProcessContextItems();
  const { addMark, removeMark, toggleMarkActive, clearMarks, filterIdsOfCurrentSelectedMarks, filterErrorInfo } =
    useContextPanelStore((state) => ({
      addMark: state.addMark,
      removeMark: state.removeMark,
      toggleMarkActive: state.toggleMarkActive,
      clearMarks: state.clearMarks,
      filterIdsOfCurrentSelectedMarks: state.filterIdsOfCurrentSelectedMarks,
      filterErrorInfo: state.filterErrorInfo,
    }));

  const skillStore = useSkillStore((state) => ({
    selectedSkill: state.selectedSkill,
  }));

  console.log('processedContextItems', processedContextItems);

  const handleToggleItem = (id) => {
    toggleMarkActive(id);
    setActiveItemId((prevId) => (prevId === id ? null : id));
  };

  const handleRemoveItem = (id) => {
    removeMark(id);
    if (activeItemId === id) {
      setActiveItemId(null);
    }
  };

  const activeItem = processedContextItems.find((item) => item.id === activeItemId);

  const handleExpandItem = (id) => {
    // 这里可以添加展开项目的逻辑
    console.log(`Expanding item with id: ${id}`);
    // 例如，可以设置一个新的状态来跟踪展开的项目
    // setExpandedItems(prev => [...prev, id]);
  };

  const handleAddItem = (newMark: Mark) => {
    // 检查项目是否已经存在于 store 中
    const existingMark = useContextPanelStore
      .getState()
      .currentSelectedMarks.find((mark) => mark.id === newMark.id && mark.type === newMark.type);

    if (!existingMark) {
      // 如果项目不存在，添加到 store
      addMark(newMark);
    } else {
      removeMark(existingMark.id);
      // 如果项目已存在，可以选择更新它或者不做任何操作
      // 这里我们选择不做任何操作，但您可以根据需求进行调整
      console.log('Item already exists in the store');
    }
  };

  const selectedItems = processedContextItems?.filter((item) =>
    [...backendBaseMarkTypes, ...frontendBaseMarkTypes].includes(item?.type as BaseMarkType),
  );

  const processContextFilterProps = useProcessContextFilter(true);

  return (
    <div className="context-manager">
      <div className="context-content">
        <div className="context-items-container">
          <AddBaseMarkContext handleAddItem={handleAddItem} selectedItems={selectedItems} />

          <ContentSelectorBtn />

          <ResetContentSelectorBtn />

          <ContextFilter processContextFilterProps={processContextFilterProps} />

          {processedContextItems.map((item) => (
            <ContextItem
              key={item.id}
              item={item}
              disabled={(filterIdsOfCurrentSelectedMarks || []).includes(item.id)}
              isLimit={!!filterErrorInfo[item.type]}
              isActive={item.id === activeItemId}
              onToggle={handleToggleItem}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>

        {activeItem && (
          <ContextPreview
            item={activeItem}
            onClose={() => setActiveItemId(null)}
            onRemove={handleRemoveItem}
            onOpenUrl={(url) => {
              if (typeof url === 'function') {
                url(); // 执行跳转函数
              } else {
                window.open(url, '_blank'); // 打开外部链接
              }
            }}
          />
        )}
      </div>
    </div>
  );
};