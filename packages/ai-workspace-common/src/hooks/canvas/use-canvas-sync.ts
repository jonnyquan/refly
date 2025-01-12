import { useCallback, useMemo } from 'react';
import { useCanvasContext } from '../../context/canvas';
import { useThrottledCallback } from 'use-debounce';
import { Edge } from '@xyflow/react';
import { CanvasNode } from '../../components/canvas/nodes';

export const useCanvasSync = () => {
  const { provider } = useCanvasContext();
  const ydoc = provider.document;

  const syncFunctions = useMemo(() => {
    const syncTitleToYDoc = (title: string) => {
      ydoc?.transact(() => {
        const yTitle = ydoc?.getText('title');
        yTitle?.delete(0, yTitle?.length ?? 0);
        yTitle?.insert(0, title);
      });
    };

    const syncNodesToYDoc = (nodes: CanvasNode<any>[]) => {
      ydoc?.transact(() => {
        const yNodes = ydoc?.getArray('nodes');
        yNodes?.delete(0, yNodes?.length ?? 0);
        yNodes?.push(nodes);
      });
    };

    const syncEdgesToYDoc = (edges: Edge[]) => {
      ydoc?.transact(() => {
        const yEdges = ydoc?.getArray('edges');
        yEdges?.delete(0, yEdges?.length ?? 0);
        yEdges?.push(edges);
      });
    };

    return {
      syncTitleToYDoc,
      syncNodesToYDoc,
      syncEdgesToYDoc,
    };
  }, [ydoc]);

  const throttledSyncNodesToYDoc = useThrottledCallback(syncFunctions.syncNodesToYDoc, 500, {
    leading: true,
    trailing: false,
  });

  const throttledSyncEdgesToYDoc = useThrottledCallback(syncFunctions.syncEdgesToYDoc, 500, {
    leading: true,
    trailing: false,
  });

  return {
    ...syncFunctions,
    throttledSyncNodesToYDoc,
    throttledSyncEdgesToYDoc,
  };
};