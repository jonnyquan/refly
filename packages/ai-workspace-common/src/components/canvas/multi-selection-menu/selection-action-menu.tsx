import { Button, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { FC, useCallback, useMemo } from 'react';
import { useReactFlow, useStore } from '@xyflow/react';
import { IconDelete, IconAskAI, IconLoading } from '@refly-packages/ai-workspace-common/components/common/icon';
import { useCanvasContext } from '@refly-packages/ai-workspace-common/context/canvas';
import { CanvasNode, SkillNodeMeta } from '@refly-packages/ai-workspace-common/components/canvas/nodes';
import { MessageSquareDiff, Group, Target, Layout } from 'lucide-react';
import { genActionResultID, genSkillID } from '@refly-packages/utils/id';
import { CanvasNodeType } from '@refly/openapi-schema';
import { useAddNode } from '@refly-packages/ai-workspace-common/hooks/canvas/use-add-node';
import { useGroupNodes } from '@refly-packages/ai-workspace-common/hooks/canvas/use-batch-nodes-selection/use-group-nodes';
import { useAddToContext } from '@refly-packages/ai-workspace-common/hooks/canvas/use-add-to-context';
import { useDeleteNode } from '@refly-packages/ai-workspace-common/hooks/canvas/use-delete-node';
import { useInvokeAction } from '@refly-packages/ai-workspace-common/hooks/canvas/use-invoke-action';
import { CanvasNodeData } from '@refly-packages/ai-workspace-common/components/canvas/nodes/shared/types';
import { IContextItem } from '@refly-packages/ai-workspace-common/stores/context-panel';
import { convertContextItemsToNodeFilters } from '@refly-packages/ai-workspace-common/utils/map-context-items';
import { useNodeCluster } from '@refly-packages/ai-workspace-common/hooks/canvas/use-node-cluster';

interface MenuItem {
  key: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  loading?: boolean;
  danger?: boolean;
  primary?: boolean;
  type: 'button' | 'divider';
  disabled?: boolean;
}

interface SelectionActionMenuProps {
  onClose?: () => void;
}

export const SelectionActionMenu: FC<SelectionActionMenuProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { getNodes } = useReactFlow();
  const { canvasId } = useCanvasContext();
  const { addNode } = useAddNode();
  const { createGroupFromSelectedNodes } = useGroupNodes();
  const { addContextItems } = useAddToContext();
  const { deleteNodes } = useDeleteNode();
  const { invokeAction } = useInvokeAction();
  const { selectNodeCluster, groupNodeCluster, layoutNodeCluster } = useNodeCluster();
  const nodes = useStore((state) => state.nodes);

  const checkHasSkill = useCallback(() => {
    return nodes.filter((node) => node.selected).some((node) => node.type === 'skill');
  }, [nodes]);
  const checkAllSelectedNodesAreSkill = useCallback(() => {
    return nodes.filter((node) => node.selected).every((node) => node.type === 'skill');
  }, [nodes]);
  const hasSkill = checkHasSkill();
  const allSelectedNodesAreSkill = checkAllSelectedNodesAreSkill();

  const handleAskAI = useCallback(() => {
    // Get all selected nodes except skills
    const selectedNodes = getNodes().filter(
      (node) => node.selected && !['skill', 'memo'].includes(node.type),
    ) as CanvasNode[];

    const connectTo = selectedNodes.map((node) => ({
      type: node.type as CanvasNodeType,
      entityId: node.data.entityId as string,
    }));

    // Only proceed if there are non-skill nodes selected
    if (selectedNodes.length > 0) {
      addNode(
        {
          type: 'skill',
          data: {
            title: 'Skill',
            entityId: genSkillID(),
            metadata: {
              contextItems: selectedNodes.map((node) => ({
                type: node.type,
                title: node.data?.title,
                entityId: node.data?.entityId,
                metadata: {
                  ...node.data?.metadata,
                  ...(node.type === 'skillResponse' ? { withHistory: true } : {}),
                },
              })),
            },
          },
        },
        connectTo,
        false,
        false,
      );
    }

    onClose?.();
  }, [getNodes, addNode, onClose]);

  const handleAddToContext = useCallback(() => {
    const selectedItems = getNodes()
      .filter((node) => node.selected)
      .map((node) => ({
        type: node.type,
        title: node.data?.title,
        entityId: node.data?.entityId,
        metadata: node.data?.metadata,
      })) as IContextItem[];

    // Add all selected nodes to context
    addContextItems(selectedItems);

    onClose?.();
  }, [getNodes, addContextItems, onClose]);

  const handleDelete = useCallback(() => {
    const selectedNodes = getNodes()
      .filter((node) => node.selected)
      .map((node) => ({
        id: node.id,
        type: node.type,
        data: node.data,
        position: node.position,
      })) as CanvasNode[];

    deleteNodes(selectedNodes);
    onClose?.();
  }, [getNodes, deleteNodes, onClose]);

  const handleGroup = useCallback(() => {
    createGroupFromSelectedNodes();
    onClose?.();
  }, [createGroupFromSelectedNodes, onClose]);

  const handleBatchAskAI = useCallback(() => {
    // Get all selected skill nodes
    const selectedSkillNodes = getNodes().filter((node) => node.selected && node.type === 'skill');

    selectedSkillNodes.forEach((node) => {
      const { metadata } = node.data as CanvasNodeData<SkillNodeMeta>;
      const { query, modelInfo, selectedSkill, contextItems = [] } = metadata;

      const resultId = genActionResultID();

      // Invoke action for this skill node
      invokeAction(
        {
          resultId,
          query,
          modelInfo,
          contextItems,
          selectedSkill,
        },
        {
          entityId: canvasId,
          entityType: 'canvas',
        },
      );

      addNode(
        {
          type: 'skillResponse',
          data: {
            title: query,
            entityId: resultId,
            metadata: {
              status: 'executing',
              contextItems,
            },
          },
          position: node.position,
        },
        convertContextItemsToNodeFilters(contextItems),
      );

      // Delete the skill node after invoking
      deleteNodes([
        {
          id: node.id,
          type: 'skill',
          data: node.data as CanvasNodeData<SkillNodeMeta>,
          position: node.position,
        },
      ]);
    });

    onClose?.();
  }, [getNodes, invokeAction, canvasId, deleteNodes, onClose]);

  const handleSelectCluster = useCallback(() => {
    const selectedNodes = getNodes().filter((node) => node.selected);
    if (selectedNodes.length > 0) {
      selectNodeCluster(selectedNodes.map((node) => node.id));
    }
  }, [getNodes, selectNodeCluster]);

  const handleGroupCluster = useCallback(() => {
    const selectedNodes = getNodes().filter((node) => node.selected);
    if (selectedNodes.length > 0) {
      groupNodeCluster(selectedNodes.map((node) => node.id));
    }
  }, [getNodes, groupNodeCluster]);

  const handleLayoutCluster = useCallback(() => {
    const selectedNodes = getNodes().filter((node) => node.selected);
    if (selectedNodes.length > 0) {
      layoutNodeCluster(selectedNodes.map((node) => node.id));
    }
  }, [getNodes, layoutNodeCluster]);

  const getMenuItems = (): MenuItem[] => {
    return [
      allSelectedNodesAreSkill
        ? null
        : {
            key: 'askAI',
            icon: IconAskAI,
            label: t('canvas.nodeActions.askAI'),
            onClick: handleAskAI,
            type: 'button' as const,
            primary: true,
          },
      hasSkill
        ? {
            key: 'batchAskAI',
            icon: IconAskAI,
            label: t('canvas.nodeActions.batchRun'),
            onClick: handleBatchAskAI,
            type: 'button' as const,
            primary: true,
          }
        : null,
      { key: 'divider-1', type: 'divider' } as MenuItem,
      {
        key: 'addToContext',
        icon: MessageSquareDiff,
        label: t('canvas.nodeActions.addToContext'),
        onClick: handleAddToContext,
        type: 'button' as const,
      },
      { key: 'divider-2', type: 'divider' } as MenuItem,
      {
        key: 'group',
        icon: Group,
        label: t('canvas.nodeActions.group'),
        onClick: handleGroup,
        type: 'button' as const,
      },
      { key: 'divider-3', type: 'divider' } as MenuItem,
      {
        key: 'selectCluster',
        icon: Target,
        label: t('canvas.nodeActions.selectCluster'),
        onClick: handleSelectCluster,
        type: 'button' as const,
      },
      {
        key: 'groupCluster',
        icon: Group,
        label: t('canvas.nodeActions.groupCluster'),
        onClick: handleGroupCluster,
        type: 'button' as const,
      },
      {
        key: 'layoutCluster',
        icon: Layout,
        label: t('canvas.nodeActions.layoutCluster'),
        onClick: handleLayoutCluster,
        type: 'button' as const,
      },
      { key: 'divider-4', type: 'divider' } as MenuItem,
      {
        key: 'delete',
        icon: IconDelete,
        label: t('canvas.nodeActions.deleteAll'),
        onClick: handleDelete,
        danger: true,
        type: 'button' as const,
      },
    ].filter(Boolean);
  };

  const menuItems = useMemo(() => getMenuItems(), []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-2 w-[200px] border border-[rgba(0,0,0,0.06)]">
      {menuItems.map((item) => {
        if (item.type === 'divider') {
          return <Divider key={item.key} className="my-1 h-[1px] bg-gray-100" />;
        }

        return (
          <Button
            key={item.key}
            className={`
              w-full
              h-8
              flex
              items-center
              gap-2
              px-2
              rounded
              text-sm
              transition-colors
              text-gray-700 hover:bg-gray-50 hover:text-gray-700
              ${item.danger ? '!text-red-600 hover:bg-red-50' : ''}
              ${item.primary ? '!text-primary-600 hover:bg-primary-50' : ''}
              ${item.loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            type="text"
            loading={item.loading}
            onClick={item.onClick}
            disabled={item.disabled}
          >
            {item.loading ? <IconLoading className="w-4 h-4" /> : <item.icon className="w-4 h-4" />}
            <span className="flex-1 text-left truncate">{item.label}</span>
          </Button>
        );
      })}
    </div>
  );
};