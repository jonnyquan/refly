import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import { message } from 'antd';
import { useContextPanelStore } from '../stores/context-panel';
import { CanvasNode } from '../components/canvas/nodes';
import { CanvasNodeType } from '@refly/openapi-schema';

export const useDeleteNode = (node: CanvasNode, nodeType: CanvasNodeType) => {
  const { setNodes, setEdges } = useReactFlow();
  const { t } = useTranslation();

  return useCallback(() => {
    // Delete node from canvas
    setNodes((nodes) => nodes.filter((n) => n.id !== node.id));

    // Delete connected edges
    setEdges((edges) => edges.filter((e) => e.source !== node.id && e.target !== node.id));

    // Delete from context panel if exists
    const contextStore = useContextPanelStore.getState();
    contextStore.removeContextItem(node.id);

    // Get node title based on node type
    const nodeTitle = node.data?.title ?? t('knowledgeBase.context.untitled');

    // Show success message
    message.success(
      t('knowledgeBase.context.deleteSuccessWithTitle', {
        title: nodeTitle,
        type: t(`knowledgeBase.context.nodeTypes.${nodeType}`),
      }),
    );
  }, [node, nodeType, setNodes, setEdges, t]);
};