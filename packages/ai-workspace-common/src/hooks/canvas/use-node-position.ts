import { Node, useReactFlow, XYPosition } from '@xyflow/react';
import { CanvasNodeFilter } from './use-node-selection';
import { useCallback } from 'react';
import Dagre from '@dagrejs/dagre';
import { useCanvasStore } from '@refly-packages/ai-workspace-common/stores/canvas';
import { CalculateNodePositionParams, LayoutBranchOptions } from './use-node-position-utils/types';
import {
  getAbsolutePosition,
  getNodeHeight,
  getNodeWidth,
  getRootNodes,
  getLeftmostBottomPosition,
  getRightmostPosition,
  getNodeAbsolutePosition,
} from './use-node-position-utils/utils';
import { SPACING } from './use-node-position-utils/constants';
import { useCanvasContext } from '@refly-packages/ai-workspace-common/context/canvas';

export const calculateNodePosition = ({
  nodes,
  sourceNodes,
  connectTo,
  defaultPosition,
  edges = [],
}: CalculateNodePositionParams): XYPosition => {
  // If position is provided, use it
  if (defaultPosition) {
    return defaultPosition;
  }

  // Case 1: No nodes exist - place in center-left of canvas
  if (nodes.length === 0) {
    return {
      x: SPACING.INITIAL_X,
      y: SPACING.INITIAL_Y,
    };
  }

  // Case 2: No source nodes - add to leftmost bottom position
  if (!sourceNodes?.length) {
    return getLeftmostBottomPosition(nodes);
  }

  // Case 3: Connected to existing nodes
  if (sourceNodes?.length > 0) {
    const { autoLayout } = useCanvasStore.getState();

    // Convert relative positions to absolute positions for calculations
    const sourceNodesAbsolute = sourceNodes.map((node) => ({
      ...node,
      position: getNodeAbsolutePosition(node, nodes),
      width: getNodeWidth(node),
    }));

    if (!autoLayout) {
      // For each source node, find all its connected target nodes
      const connectedNodes = new Set<Node>();

      sourceNodes.forEach((sourceNode) => {
        // Find all direct target nodes of this source node
        edges.forEach((edge) => {
          if (edge.source === sourceNode.id) {
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (targetNode) {
              connectedNodes.add(targetNode);
            }
          }
        });
      });

      // Calculate X position considering node width
      const rightmostSourceX = Math.max(...sourceNodesAbsolute.map((n) => n.position.x + n.width / 2));
      const targetX = rightmostSourceX + SPACING.X;

      if (connectedNodes.size > 0) {
        // Convert connected nodes to absolute positions
        const connectedNodesAbsolute = Array.from(connectedNodes).map((node) => ({
          ...node,
          position: getNodeAbsolutePosition(node, nodes),
          width: getNodeWidth(node),
        }));

        // Find the bottommost node among all connected nodes
        const bottomNode = connectedNodesAbsolute.reduce((bottom, current) => {
          const bottomY = bottom.position.y + (bottom.measured?.height ?? 320) / 2;
          const currentY = current.position.y + (current.measured?.height ?? 320) / 2;
          return currentY > bottomY ? current : bottom;
        });

        // Position new node below the bottommost connected node
        const bottomY = bottomNode.position.y + (bottomNode.measured?.height ?? 320) / 2;

        return {
          x: targetX,
          y: bottomY + SPACING.Y + 320 / 2,
        };
      } else {
        // If no connected nodes, place at average Y of source nodes
        const avgSourceY = sourceNodesAbsolute.reduce((sum, n) => sum + n.position.y, 0) / sourceNodesAbsolute.length;
        return {
          x: targetX,
          y: avgSourceY,
        };
      }
    }

    // If auto-layout is enabled or no branch nodes found, use original positioning logic
    return getRightmostPosition(sourceNodesAbsolute, nodes, edges);
  }

  // Case 2: No specific connections - add to a new branch
  const rootNodes = getRootNodes(nodes, edges);

  if (rootNodes.length > 0) {
    // Sort root nodes by Y position
    const sortedRootNodes = [...rootNodes].sort((a, b) => a.position.y - b.position.y);

    // Try to find a gap between root nodes that's large enough
    for (let i = 0; i < sortedRootNodes.length - 1; i++) {
      const gap = sortedRootNodes[i + 1].position.y - sortedRootNodes[i].position.y;
      if (gap >= 30) {
        return {
          x: sortedRootNodes[i].position.x,
          y: sortedRootNodes[i].position.y + gap / 2,
        };
      }
    }

    // If no suitable gap found, place below the last root node
    const lastNode = sortedRootNodes[sortedRootNodes.length - 1];
    return {
      x: lastNode.position.x,
      y: lastNode.position.y + SPACING.Y + (lastNode.measured?.height ?? 320),
    };
  }

  // Fallback: Place to the right of existing nodes with proper spacing
  const rightmostNodes = nodes
    .filter((n) => {
      const isRightmost = !edges.some((e) => e.source === n.id);
      return isRightmost;
    })
    .sort((a, b) => a.position.y - b.position.y);

  if (rightmostNodes.length > 0) {
    // Try to find a gap between rightmost nodes
    for (let i = 0; i < rightmostNodes.length - 1; i++) {
      const gap = rightmostNodes[i + 1].position.y - rightmostNodes[i].position.y;
      if (gap >= 30) {
        return {
          x: Math.max(...rightmostNodes.map((n) => n.position.x)) + SPACING.X,
          y: rightmostNodes[i].position.y + gap / 2,
        };
      }
    }

    // If no suitable gap found, place below the last rightmost node
    const lastNode = rightmostNodes[rightmostNodes.length - 1];
    return {
      x: Math.max(...rightmostNodes.map((n) => n.position.x)) + SPACING.X,
      y: lastNode.position.y + SPACING.Y + (lastNode.measured?.height ?? 320),
    };
  }

  // Final fallback: Place at initial position with offset
  return {
    x: SPACING.INITIAL_X,
    y: SPACING.INITIAL_Y,
  };
};

export const useNodePosition = () => {
  const { getNode, setCenter, getZoom, setNodes } = useReactFlow();
  const { canvasId } = useCanvasContext();

  const calculatePosition = useCallback((params: CalculateNodePositionParams) => calculateNodePosition(params), []);

  const setNodeCenter = useCallback(
    (nodeId: string, shouldSelect: boolean = false) => {
      requestAnimationFrame(() => {
        const renderedNode = getNode(nodeId);
        const { data } = useCanvasStore.getState();
        const nodes = data?.[canvasId]?.nodes || [];
        if (!nodes) return;

        const renderedNodeAbsolute = getNodeAbsolutePosition(renderedNode, nodes);

        const currentZoom = getZoom();
        if (renderedNode) {
          setCenter(renderedNodeAbsolute.x + 200, renderedNodeAbsolute.y + 200, {
            duration: 300,
            zoom: currentZoom,
          });
          if (shouldSelect) {
            setNodes((nodes) =>
              nodes.map((node) => ({
                ...node,
                selected: node.id === nodeId,
              })),
            );
          }
        }
      });
    },
    [setCenter, getNode, getZoom, setNodes],
  );

  const layoutBranchAndUpdatePositions = useCallback(
    (
      sourceNodes: Node[],
      allNodes: Node[],
      edges: any[],
      options: LayoutBranchOptions = {},
      needSetCenter: { targetNodeId: string; needSetCenter: boolean } = { targetNodeId: '', needSetCenter: true },
    ) => {
      // Collect all source nodes including children of group nodes
      const sourceNodesAbsolute = sourceNodes.map((node) => ({
        ...node,
        position: getNodeAbsolutePosition(node, allNodes),
        width: getNodeWidth(node),
      }));
      if (sourceNodesAbsolute.length === 0) return;

      // Find all nodes directly connected to source nodes and their connections
      const targetNodeIds = new Set<string>();
      const queue = [...sourceNodes.map((n) => n.id)];
      const visited = new Set<string>();

      // Find all connected nodes in the branch
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        edges.forEach((edge) => {
          if (edge.source === currentId && !sourceNodes.some((n) => n.id === edge.target)) {
            targetNodeIds.add(edge.target);
            queue.push(edge.target);
          }
        });
      }

      // Get target nodes that need to be laid out
      const targetNodes = allNodes.filter((node) => targetNodeIds.has(node.id));
      if (targetNodes.length === 0) return;

      // Group nodes by their level (distance from source nodes)
      const nodeLevels = new Map<number, Node[]>();
      const nodeLevel = new Map<string, number>();

      // Calculate levels for each node
      const calculateLevels = (nodeId: string, level: number) => {
        if (nodeLevel.has(nodeId)) return;
        nodeLevel.set(nodeId, level);

        const levelNodes = nodeLevels.get(level) || [];
        const node = allNodes.find((n) => n.id === nodeId);
        if (node) {
          levelNodes.push(node);
          nodeLevels.set(level, levelNodes);
        }

        // Process children
        edges.filter((edge) => edge.source === nodeId).forEach((edge) => calculateLevels(edge.target, level + 1));
      };

      // Start level calculation from source nodes
      sourceNodesAbsolute.forEach((node) => calculateLevels(node.id, 0));

      // Sort nodes within each level by their Y position
      nodeLevels.forEach((nodes) => {
        nodes.sort((a, b) => a.position.y - b.position.y);
      });

      // First pass: Calculate initial positions
      const nodePositions = new Map<string, { x: number; y: number }>();
      const fixedSpacing = SPACING.Y;

      // Process each level
      Array.from(nodeLevels.entries()).forEach(([level, nodes]) => {
        // Calculate X position consistently with calculatePosition
        const levelX =
          level === 0
            ? Math.max(...sourceNodesAbsolute.map((n) => n.position.x + getNodeWidth(n) / 2))
            : Math.max(
                ...Array.from(nodeLevels.get(level - 1) || []).map((n) => {
                  const nodeWidth = getNodeWidth(n);
                  const pos = n.position;
                  return pos.x + nodeWidth / 2;
                }),
              ) + SPACING.X;

        // Calculate total height needed for this level
        const totalHeight = nodes.reduce((sum, node) => {
          const nodeHeight = getNodeHeight(node);
          return sum + nodeHeight + fixedSpacing;
        }, -fixedSpacing);

        // Calculate starting Y position (centered around average source Y)
        const avgSourceY = sourceNodesAbsolute.reduce((sum, n) => sum + n.position.y, 0) / sourceNodesAbsolute.length;
        let currentY = avgSourceY - totalHeight / 2;

        // Calculate center positions for nodes in this level
        nodes.forEach((node, index) => {
          const nodeHeight = getNodeHeight(node);
          const nodeWidth = getNodeWidth(node);

          // Get direct source nodes for this node
          const directSourceNodes = edges
            .filter((edge) => edge.target === node.id)
            .map((edge) => allNodes.find((n) => n.id === edge.source))
            .filter((n): n is Node => n !== undefined);
          const directSourceNodesAbsolute = directSourceNodes.map((node) => ({
            ...node,
            position: getNodeAbsolutePosition(node, allNodes),
            width: getNodeWidth(node),
          }));

          if (directSourceNodesAbsolute.length > 0) {
            // Try to align with average Y of source nodes
            const avgDirectSourceY =
              directSourceNodesAbsolute.reduce((sum, n) => sum + n.position.y, 0) / directSourceNodesAbsolute.length;
            // Adjust currentY to be closer to direct source nodes while maintaining spacing
            currentY = avgDirectSourceY - totalHeight / 2 + index * (nodeHeight + fixedSpacing);
          }

          nodePositions.set(node.id, {
            x: levelX,
            y: currentY + nodeHeight / 2,
          });

          currentY += nodeHeight + fixedSpacing;
        });
      });

      // Second pass: Adjust positions to prevent overlaps
      const adjustOverlaps = () => {
        let hasOverlap = true;
        const maxIterations = 10;
        let iteration = 0;

        while (hasOverlap && iteration < maxIterations) {
          hasOverlap = false;
          iteration++;

          // Check each pair of nodes for overlaps
          Array.from(nodePositions.entries()).forEach(([nodeId, pos1]) => {
            const node1 = allNodes.find((n) => n.id === nodeId)!;
            const height1 = getNodeHeight(node1);

            Array.from(nodePositions.entries()).forEach(([otherId, pos2]) => {
              if (nodeId === otherId) return;

              const node2 = allNodes.find((n) => n.id === otherId)!;
              const height2 = getNodeHeight(node2);

              // Calculate the vertical overlap between the two nodes
              const node1Top = pos1.y - height1 / 2;
              const node1Bottom = pos1.y + height1 / 2;
              const node2Top = pos2.y - height2 / 2;
              const node2Bottom = pos2.y + height2 / 2;

              // Check if the nodes overlap vertically
              if (!(node1Bottom < node2Top - fixedSpacing || node1Top > node2Bottom + fixedSpacing)) {
                hasOverlap = true;
                // Move the node with higher Y value further down
                if (pos1.y > pos2.y) {
                  const newY = node2Bottom + fixedSpacing + height1 / 2;
                  nodePositions.set(nodeId, {
                    ...pos1,
                    y: newY,
                  });
                }
              }
            });
          });
        }
      };

      adjustOverlaps();

      // Apply the calculated positions
      const updatedNodes = allNodes.map((node) => {
        if (!targetNodeIds.has(node.id)) {
          return node; // Keep original position for non-target nodes
        }

        const newPosition = nodePositions.get(node.id);
        if (!newPosition) return node;

        return {
          ...node,
          position: newPosition,
        };
      });

      setNodes(updatedNodes);

      // Set center on the specified target node
      if (needSetCenter.needSetCenter && needSetCenter.targetNodeId) {
        setNodeCenter(needSetCenter.targetNodeId);
      }
    },
    [setNodes, setNodeCenter],
  );

  return { calculatePosition, setNodeCenter, layoutBranchAndUpdatePositions };
};