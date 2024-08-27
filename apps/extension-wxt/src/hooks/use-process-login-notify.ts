import { useEffect } from 'react';
import { browser } from 'wxt/browser';

export const useProcessLoginNotify = () => {
  // 收到消息之后，关闭窗口
  const handleExtensionMessage = (request: any) => {
    console.log('activate useProcessLoginNotify', request);
    if (request?.data?.name === 'refly-login-notify') {
      window.close();
    }
  };

  useEffect(() => {
    browser.runtime.onMessage.addListener(handleExtensionMessage);

    return () => {
      browser.runtime.onMessage.removeListener(handleExtensionMessage);
    };
  }, []);
};