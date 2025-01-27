import classNames from 'classnames';
import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Message } from '@arco-design/web-react';
import type {
  Mark,
  TextType,
  MarkScope,
  SyncMarkEvent,
  SyncMarkEventType,
  SyncStatusEvent,
  MarkType,
} from '@refly/common-types';
import { safeStringifyJSON } from '@refly-packages/utils/parse';
import {
  sendMessage,
  onMessage,
} from '@refly-packages/ai-workspace-common/utils/extension/messaging';
import { BackgroundMessage } from '@refly/common-types';
import { getRuntime } from '@refly-packages/ai-workspace-common/utils/env';
import { SelectedTextDomain } from '@refly/common-types';
import { getElementType } from '../utils';
import { genContentSelectorID } from '@refly-packages/utils/id';
import { getMarkdown } from '@refly/utils/html2md';
import { BLOCK_SELECTED_MARK_ID, INLINE_SELECTED_MARK_ID } from '../utils/index';

// utils
import { getSelectionNodesMarkdown } from '../utils/highlight-selection';
import { ElementType } from '../utils';
import HoverMenu from '@refly-packages/ai-workspace-common/modules/content-selector/components/hover-menu';
import { getPopupContainer } from '../utils/get-popup-container';
import { t } from 'i18next';
import { useParams } from 'react-router-dom';
import { createRoot } from 'react-dom/client';

export const getContainerElem = (selector: string | null) => {
  const container = getPopupContainer();
  return selector ? container.querySelector(`.${selector}`) : container;
};

export const useContentSelector = (
  selector: string | null,
  domain: SelectedTextDomain,
  metadata?: { url: string },
) => {
  const statusRef = useRef(true);
  const markRef = useRef<HTMLDivElement | null>(null);
  const targetList = useRef<Element[]>([]);
  const markListRef = useRef<Mark[]>([]);
  const showContentSelectorRef = useRef<boolean>(false);
  const messageListenerEventRef = useRef<any>();
  const selectorScopeRef = useRef<MarkScope>('block');
  const { projectId } = useParams();

  useEffect(() => {
    const containerElem = getContainerElem(selector);
    if (containerElem) {
      const existingMark = containerElem.querySelector('.refly-content-selector-mark');
      if (existingMark) {
        markRef.current = existingMark as HTMLDivElement;
      }
    }
  }, [selector]);

  const buildMark = (textType: TextType, content: string, xPath: string) => {
    const mark: Mark = {
      type: domain as MarkType,
      textType,
      data: content,
      xPath,
      scope: selectorScopeRef.current,
      domain,
      url: metadata?.url || document?.location?.href || (document as any as Location)?.href || '',
      metadata: domain === 'documentSelection' ? { projectId } : null,
    };

    return mark;
  };

  const addMark = (mark: Mark, target: HTMLElement | HTMLElement[]) => {
    markListRef.current = markListRef.current.concat(mark);
    // 添加到 list 方便后续统一的处理
    targetList.current = targetList.current.concat(target as Element);
  };

  const addHoverMenu = (
    { target, rect }: { target?: HTMLElement; rect?: DOMRect },
    {
      onClick,
      selected,
    }: {
      onClick: () => void;
      selected: boolean;
    },
  ) => {
    const containerElem = getContainerElem(selector);

    const menuContainer = document.createElement('div');
    menuContainer.setAttribute('data-id', 'refly-content-selector-hover-menu');
    menuContainer.style.position = 'absolute';
    menuContainer.style.zIndex = '10000';
    menuContainer.style.opacity = '0';
    menuContainer.style.transition = 'opacity 0.3s ease-in-out';
    containerElem?.appendChild?.(menuContainer);

    const root = createRoot(menuContainer);

    let hideTimeout: NodeJS.Timeout;

    const renderMenu = () => {
      if (rect) {
        // 获取视口相对位置
        menuContainer.style.top = `${rect.top - 30}px`;
        menuContainer.style.left = `${rect.left + rect.width / 2}px`;
        menuContainer.style.opacity = '1';
      } else {
        const targetRect = target.getBoundingClientRect();
        // 计算相对于视口的位置
        menuContainer.style.top = `${targetRect.top - 30}px`;
        menuContainer.style.left = `${targetRect.left + targetRect.width / 2}px`;
        menuContainer.style.opacity = '1';
      }

      root.render(
        <HoverMenu
          onClick={onClick}
          selected={selected}
          onMouseEnter={() => clearTimeout(hideTimeout)}
          onMouseLeave={() => removeHoverMenu()}
        />,
      );
    };

    renderMenu();

    const removeHoverMenu = () => {
      hideTimeout = setTimeout(() => {
        root.unmount();
        // 从 document.body 中移除
        document.body.removeChild(menuContainer);
      }, 300);
    };

    // 添加鼠标事件监听器
    if (rect) {
      renderMenu();
    } else {
      target.addEventListener('mouseenter', renderMenu);
      target.addEventListener('mouseleave', removeHoverMenu);
    }

    const cleanup = () => {
      removeHoverMenu();

      if (!rect) {
        target?.removeEventListener('mouseenter', renderMenu);
        target?.removeEventListener('mouseleave', removeHoverMenu);
      }

      if (menuContainer) {
        ReactDOM.unmountComponentAtNode(menuContainer);
        try {
          containerElem?.removeChild(menuContainer);
        } catch (err) {
          console.error('remove menuContainer error', err);
        }
      }
    };

    return cleanup;
  };

  const removeAllInlineHightlightNodes = (xPath: string) => {
    const allNodes = document.querySelectorAll(`[${INLINE_SELECTED_MARK_ID}="${xPath}"]`);
    for (const node of allNodes) {
      const nodeCleanup = (node as any).__hoverMenuCleanup;
      if (typeof nodeCleanup === 'function') {
        nodeCleanup();
      }

      const parent = node.parentNode;
      const textNode = document.createTextNode(node.textContent);
      parent.replaceChild(textNode, node);
      parent.normalize();
    }
  };

  const _addHoverMenuToNode = (node: HTMLElement, xPath: string) => {
    const removeHighlight = (xPath?: string) => {
      removeAllInlineHightlightNodes(xPath);

      const mark = removeInlineMark(node, xPath);
      syncRemoveMarkEvent(mark);
    };

    const cleanup = addHoverMenu(
      { target: node },
      {
        onClick: () => removeHighlight(xPath),
        selected: true,
      },
    );

    // 将 cleanup 函数存储在节点上
    (node as any).__hoverMenuCleanup = cleanup;

    return cleanup;
  };

  const addInlineMarkForNote = () => {
    const selectedText = window.getSelection()?.toString().trim();
    if (!selectedText) {
      Message.warning(t('knowledgeBase.context.contentSelectorIsEmpty'));
      return;
    }

    const xPath = genContentSelectorID();
    const content = getSelectionNodesMarkdown();
    const textType = 'text' as ElementType;
    const mark = buildMark(textType, content, xPath);
    // Sync with content selector
    const markEvent = { type: 'add' as SyncMarkEventType, mark };
    syncMarkEvent({ body: markEvent });
  };

  const addInlineMark = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // check selected text
    const selectedText = selection.toString().trim();
    if (selectedText.length === 0) {
      // if selected text is empty, do not show hover menu
      Message.warning(t('knowledgeBase.context.contentSelectorIsEmpty'));
      return;
    }

    const confirmAddMark = () => {
      const xPath = genContentSelectorID();
      const content = getSelectionNodesMarkdown();
      // const selectionNodes = highlightSelection(xPath);

      const textType = 'text' as ElementType;
      const mark = buildMark(textType, content, xPath);
      addMark({ ...mark, cleanup }, []);

      const markEvent = { type: 'add' as SyncMarkEventType, mark };
      const msg: Partial<SyncMarkEvent> = {
        body: markEvent,
      };
      syncMarkEvent(msg);

      cleanup();
    };

    const cleanup = addHoverMenu(
      { rect },
      {
        onClick: () => {
          confirmAddMark();
        },
        selected: false,
      },
    );

    // add a listener to detect selection change
    const selectionChangeListener = () => {
      const newSelection = window.getSelection();
      if (newSelection.toString().trim().length === 0) {
        cleanup();
        document.removeEventListener('selectionchange', selectionChangeListener);
      }
    };

    document.addEventListener('selectionchange', selectionChangeListener);
  };

  const addBlockMark = (target: HTMLElement) => {
    const type = getElementType(target);
    const xPath = genContentSelectorID();
    target.setAttribute(BLOCK_SELECTED_MARK_ID, xPath);
    const mark = buildMark(type, getMarkdown(target as HTMLElement), xPath);
    const cleanup = addHoverMenu(
      { target },
      {
        onClick: () => {
          const mark = removeBlockMark(target, xPath);
          syncRemoveMarkEvent(mark);
          cleanup();
        },
        selected: true,
      },
    ); // 添加 hover 菜单
    addMark({ ...mark, cleanup }, target);
    return mark;
  };

  const removeInlineMark = (target: HTMLElement, markXPath?: string) => {
    const xPath = markXPath || target.getAttribute(INLINE_SELECTED_MARK_ID);
    const mark = markListRef.current?.find((item) => item?.xPath === xPath);
    markListRef.current = markListRef.current.filter((item) => item.xPath !== xPath);
    targetList.current = targetList.current.filter(
      (item) => item.getAttribute(INLINE_SELECTED_MARK_ID) !== xPath,
    );

    // 执行清理函数
    mark?.cleanup?.();

    removeAllInlineHightlightNodes(xPath);

    return mark;
  };

  const removeBlockMark = (target: HTMLElement, markXPath?: string) => {
    const xPath = markXPath || target.getAttribute(BLOCK_SELECTED_MARK_ID);

    const mark = markListRef.current?.find((item) => item?.xPath === xPath);
    markListRef.current = markListRef.current.filter((item) => item.xPath !== xPath);

    (target as Element)?.removeAttribute(BLOCK_SELECTED_MARK_ID);
    targetList.current = targetList.current.filter(
      (item) => item.getAttribute(BLOCK_SELECTED_MARK_ID) !== xPath,
    );

    // 执行清理函数
    mark?.cleanup?.();

    return mark;
  };

  const syncRemoveMarkEvent = (mark: Mark) => {
    const markEvent = { type: 'remove' as SyncMarkEventType, mark };
    const msg: Partial<SyncMarkEvent> = {
      body: markEvent,
    };
    syncMarkEvent(msg);
  };

  const _syncAddMarkEvent = (mark: Mark) => {
    const markEvent = { type: 'add' as SyncMarkEventType, mark };
    const msg: Partial<SyncMarkEvent> = {
      body: markEvent,
    };
    syncMarkEvent(msg);
  };

  const syncMarkEvent = (event: Partial<SyncMarkEvent>) => {
    const { type, mark } = event.body;
    // 发送给 refly-main-app
    const msg: BackgroundMessage<{ type: SyncMarkEventType; mark: Mark }> = {
      source: getRuntime(),
      name: 'syncMarkEvent',
      body: {
        type,
        mark: {
          type: mark?.type,
          data: mark?.data,
          xPath: mark?.xPath,
          scope: selectorScopeRef.current,
          domain: mark?.domain,
          url: mark?.url,
          metadata: mark?.metadata,
        },
      },
    };
    console.log('contentSelectorClickHandler', safeStringifyJSON(msg));
    sendMessage(msg);
  };

  const resetMarkStyle = () => {
    // mark style
    const mark = markRef.current;

    if (!mark) return;

    // TODO: 后续改成 react 组件渲染，带来更多自由度，目前现跑通 PoC
    mark.style.top = '0px';
    mark.style.left = '0px';
    mark.style.width = '0px';
    mark.style.height = '0px';
    mark.style.width = '0px';
    mark.style.height = '0px';
  };

  const resetStyle = () => {
    resetMarkStyle();
    // selected list style
    for (const item of targetList.current) {
      if (item.getAttribute(BLOCK_SELECTED_MARK_ID)) {
        removeBlockMark(item as HTMLElement);
      } else if (item.getAttribute(INLINE_SELECTED_MARK_ID)) {
        removeInlineMark(item as HTMLElement);
      }
    }
    targetList.current = [];
    markListRef.current = [];
  };

  const isMouseOutsideContainer = (ev: MouseEvent) => {
    const containerElem = selector ? document.querySelector(`.${selector}`) : document.body;
    const _containerRect = containerElem.getBoundingClientRect();
    const _x = ev.clientX;
    const _y = ev.clientY;

    return false;
  };

  const onMouseMove = (ev: MouseEvent) => {
    ev.stopImmediatePropagation();

    console.log('isMouseOutsideContainer', isMouseOutsideContainer(ev), selector);

    if (isMouseOutsideContainer(ev)) {
      return;
    }

    console.log('contentActionHandler', ev, statusRef, markRef, showContentSelectorRef);
    if (
      statusRef.current &&
      markRef.current &&
      showContentSelectorRef.current &&
      selectorScopeRef.current === 'block'
    ) {
      const { target } = ev;
      const rect = (target as Element)?.getBoundingClientRect();
      const containerElem = selector ? document.querySelector(`.${selector}`) : document.body;
      const containerRect = containerElem.getBoundingClientRect();
      const mark = markRef.current;

      const width = rect.width || 0;
      const height = rect.height || 0;
      const top = rect.top || 0;
      const left = rect.left || 0;
      // console.log('rect', , rect.height, rect.top, rect.left);
      // container 的 top 和 left 是相对于 document 的
      const containerTop = selector ? containerRect.top || 0 : 0;
      const containerLeft = selector ? containerRect.left || 0 : 0;

      // console.log('top', window.scrollY + rect.top);
      mark.style.top = `${top - containerTop}px`;
      mark.style.left = `${left - containerLeft}px`;
      mark.style.width = `${width}px`;
      mark.style.height = `${height}px`;
      mark.style.background = '#ffd40024 !important';
      mark.style.zIndex = '99999999';
    }
  };

  const onContentClick = (ev: MouseEvent) => {
    ev.stopImmediatePropagation();
    ev.preventDefault();
    ev.stopPropagation();
    let markEvent: { type: 'remove' | 'add'; mark: Mark };

    if (isMouseOutsideContainer(ev)) {
      return;
    }

    if (statusRef.current && markRef.current && showContentSelectorRef.current) {
      const { target } = ev;

      console.log('onContentClick');

      if ((target as Element)?.getAttribute(BLOCK_SELECTED_MARK_ID)) {
        //
      } else if ((target as Element)?.getAttribute(INLINE_SELECTED_MARK_ID)) {
        //
      } else {
        const mark = addBlockMark(target as HTMLElement);
        markEvent = { type: 'add', mark };
      }

      // 发送给 refly-main-app
      const msg: Partial<SyncMarkEvent> = {
        body: markEvent,
      };
      syncMarkEvent(msg);
    }
  };

  const onMouseDownUpEvent = (ev: MouseEvent) => {
    ev.stopImmediatePropagation();
    ev.preventDefault();
    ev.stopPropagation();

    if (isMouseOutsideContainer(ev)) {
      return;
    }

    const selection = window.getSelection();
    const text = selection?.toString();

    console.log('onMouseDownUpEvent');

    if (statusRef.current && markRef.current && showContentSelectorRef.current) {
      if (text && text?.trim()?.length > 0) {
        addInlineMark();
      }
    }
  };

  const initBlockDomEventListener = () => {
    const containerElem = selector ? document.querySelector(`.${selector}`) : document.body;

    containerElem.addEventListener('mousemove', onMouseMove);
    containerElem.addEventListener('click', onContentClick, {
      capture: true,
    });
  };

  const initInlineDomEventListener = () => {
    const containerElem = selector ? document.querySelector(`.${selector}`) : document.body;

    containerElem?.addEventListener('mouseup', onMouseDownUpEvent);
  };

  const initDomEventListener = () => {
    if (selectorScopeRef.current === 'block') {
      initBlockDomEventListener();
    } else {
      initInlineDomEventListener();
    }
  };

  const removeDomEventListener = () => {
    const containerElem = selector ? document.querySelector(`.${selector}`) : document.body;

    if (!containerElem) return;

    containerElem.removeEventListener('mousemove', onMouseMove);
    containerElem.removeEventListener('click', onContentClick, { capture: true });
    containerElem.removeEventListener('mouseup', onMouseDownUpEvent);
  };

  const onStatusHandler = (event: MessageEvent<any>) => {
    const data = event as any as BackgroundMessage;
    if ((data as SyncStatusEvent)?.name === 'syncMarkStatusEvent') {
      const { type, scope } = (data as SyncStatusEvent)?.body ?? { type: '', scope: '' };

      if (type === 'start') {
        selectorScopeRef.current = scope; // 每次开启都动态的处理 scope
        initDomEventListener();
        showContentSelectorRef.current = true;
      } else if (type === 'update') {
        if (!showContentSelectorRef.current) {
          return;
        }

        if (selectorScopeRef.current !== scope) {
          removeDomEventListener();
        }

        if (scope === 'inline') {
          resetMarkStyle(); // 自由选择时不需要 mark style
        }

        selectorScopeRef.current = scope; // 每次开启都动态的处理 scope
        initDomEventListener();
      } else if (type === 'reset') {
        resetStyle();
        removeDomEventListener();
        showContentSelectorRef.current = false;
      } else if (type === 'stop') {
        resetMarkStyle();
        removeDomEventListener();
        showContentSelectorRef.current = false;
      }
    }

    if ((data as SyncMarkEvent)?.name === 'syncMarkEventBack') {
      const { mark, type } = (data as SyncMarkEvent)?.body ?? { mark: null, type: '' };

      if (type === 'remove') {
        const xPath = mark?.xPath || '';
        const target = markListRef.current.find((item) => item.xPath === xPath)?.target;

        if (mark?.scope === 'block') {
          removeBlockMark(target as HTMLElement, xPath);
        } else {
          removeInlineMark(target as HTMLElement, xPath);
        }
      }
    }
  };

  const initMessageListener = () => {
    onMessage(onStatusHandler, getRuntime()).then((clearEvent) => {
      messageListenerEventRef.current = clearEvent;
    });

    return () => {
      messageListenerEventRef.current?.();
      removeDomEventListener();
    };
  };

  const initContentSelectorElem = () => {
    return (
      <div className="refly-content-selector-container">
        <div
          ref={(el) => {
            if (el) markRef.current = el;
          }}
          style={{
            backgroundColor: '#ffd40024 !important',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            width: 0,
            height: 0,
            pointerEvents: 'none',
          }}
          className={classNames(
            'refly-content-selector-mark',
            'refly-content-selector-mark--active',
          )}
        />
      </div>
    );
  };

  useEffect(() => {
    return () => {
      resetStyle(); // 清理
    };
  }, []);

  return {
    initContentSelectorElem,
    initMessageListener,
    addInlineMarkForNote,
  };
};
