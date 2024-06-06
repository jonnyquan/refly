import { Runtime, Tabs, browser } from 'wxt/browser';
import { extRequest } from '@/utils/request';
import { BackgroundMessage, HandlerRequest, HandlerResponse } from '@/types/request';
import { storage } from 'wxt/storage';
import { getCurrentTab, getLastActiveTab, saveLastActiveTab } from '@/utils/extension/tabs';
import { requestFileNames } from '@/types/request-filename';
import * as requestModule from '@refly/openapi-schema';
import { createClient } from '@hey-api/client-fetch';
import { getServerOrigin } from '@refly/ai-workspace-common/utils/url';
import { getCookie } from '@/utils/cookie';

/**
 * @deprecated
 */
export const handleRequest = async (msg: HandlerRequest<any>) => {
  const lastActiveTab = await getLastActiveTab();
  const url = appConfig?.url[msg.name as keyof typeof appConfig.url] || '';
  const [err, userRes] = await extRequest(url as string, { ...msg });
  let messageRes = {} as HandlerResponse<any>;

  if (err) {
    messageRes = {
      success: false,
      errMsg: err,
    };
  } else {
    messageRes = {
      success: true,
      data: userRes,
    };
  }

  await browser.tabs.sendMessage(lastActiveTab?.id as number, {
    name: msg?.name,
    body: messageRes,
  });
};

const client = createClient({ baseUrl: getServerOrigin() + '/v1' });

client.interceptors.request.use(async (request) => {
  console.log('extension intercept request:', request);
  const token = await getCookie();
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`);
  }
  return request;
});

export const handleRequestReflect = async (msg: BackgroundMessage) => {
  // @ts-ignore
  console.log('received background msg:', msg);
  const res = await requestModule[msg.name as keyof typeof requestModule]?.call?.(msg?.thisArg, {
    ...msg.args[0],
    client,
  });
  const lastActiveTab = await getLastActiveTab();
  await browser.tabs.sendMessage(lastActiveTab?.id as number, {
    name: msg?.name,
    body: res,
  });
};

export const handleRegisterSidePanel = async (msg: BackgroundMessage) => {
  if (msg?.body?.isArc) {
    const path = browser.runtime.getURL('/popup.html');
    browser.action.onClicked.addListener(async () => {
      console.log('action click');
      browser.browserAction.openPopup();
      browser.action.openPopup();
    });
  } else {
    // @ts-ignore
    browser?.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .then(() => {
        console.log('open sidePanel success');
      })
      .catch((error: any) => console.error(`sidePanel open error: `, error));
  }
};

export const handleRegisterEvent = async (msg: BackgroundMessage) => {
  if (msg?.name === 'registerSidePanel') {
    handleRegisterSidePanel(msg);
  }
};

export const onMessage = async (
  msg: BackgroundMessage,
  sender: Runtime.MessageSender,
  sendResponse: (response?: any) => void,
) => {
  // 前置做保存，后续使用
  await saveLastActiveTab(sender?.tab as Tabs.Tab);

  // 处理服务端来的发请求的操作
  if (msg.type === 'apiRequest') {
    return await handleRequestReflect({
      ...msg,
    });
  }

  if (msg.type === 'registerEvent') {
    return await handleRegisterEvent(msg);
  }
};
