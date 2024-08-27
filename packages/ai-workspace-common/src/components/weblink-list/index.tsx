import { Drawer, Table, type TableColumnProps, Button, Message as message, Tag } from '@arco-design/web-react';
import React, { forwardRef, useEffect, memo, useMemo } from 'react';
import throttle from 'lodash.throttle';
import { Weblink } from '@refly/openapi-schema';

import { time } from '@refly-packages/ai-workspace-common/utils/time';
// stores
import { useWeblinkStore } from '@refly-packages/ai-workspace-common/stores/weblink';
// requests
import getClient from '@refly-packages/ai-workspace-common/requests/proxiedRequest';
// styles
import './index.scss';
import { safeParseURL } from '@refly/utils/url';
import { useTranslation } from 'react-i18next';
import { LOCALE } from '@refly/common-types';

const WebLinkItem = (props: { weblink: Weblink }) => {
  const {
    updatedAt,
    originPageDescription,
    url = '',
    originPageTitle,
    originPageUrl,
    indexStatus,
  } = props?.weblink || {};
  const origin = safeParseURL(url || '');
  console.log('weblink rerender');

  const { t, i18n } = useTranslation();
  const uiLocale = i18n?.languages?.[0] as LOCALE;

  return (
    <div className="conv-item-wrapper">
      <div className="conv-item">
        <div className="conv-item-header">
          <span className="title">
            <div className="title-text css-ellipsis">{originPageTitle}</div>
          </span>
          {/* <Tooltip className="edit" content="编辑">
            <IconEdit />
          </Tooltip> */}
          <span className="date">{time(updatedAt, uiLocale).utc().fromNow()}</span>
        </div>
        <div className="conv-item-content">
          <span className="conv-item-content-text css-ellipsis" style={{ width: 250 }}>
            {originPageDescription}
          </span>
        </div>
        <div className="conv-item-footer">
          <div className="page-link">
            <a rel="noreferrer" href={originPageUrl} target="_blank">
              <img className="icon" src={`https://www.google.com/s2/favicons?domain=${origin}&sz=${16}`} alt="" />
              <span className="text">{originPageTitle}</span>
              {indexStatus === 'finish' ? (
                <Tag color="green">{t('loggedHomePage.homePage.weblinkList.item.read')}</Tag>
              ) : (
                <Tag color="orange">{t('loggedHomePage.homePage.weblinkList.item.unread')}</Tag>
              )}
            </a>
          </div>
          {/** 第一版本不允许删除 */}
          {/* <Tooltip className="delete" content="删除网页">
            <IconDelete
              onClick={() => {
                console.log("handleDelete", handleDelete)
                handleDelete({
                  id
                })
              }}
            />
          </Tooltip> */}
        </div>
      </div>
    </div>
  );
};

const PreviosWebsiteList = forwardRef(() => {
  const webLinkStore = useWeblinkStore();
  const { t } = useTranslation();

  const loadMore = async (currentPage?: number) => {
    const { isRequest, hasMore, pageSize, ...extraState } = useWeblinkStore.getState();
    console.log('loadMore', isRequest, hasMore, pageSize, extraState);
    if (isRequest || !hasMore) return;
    if (currentPage && currentPage < extraState?.currentPage) return;

    // 获取数据
    const queryPayload = {
      pageSize,
      page: typeof currentPage === 'number' ? currentPage : extraState.currentPage,
    };

    // 更新页码
    webLinkStore.updateCurrentPage((typeof currentPage === 'number' ? currentPage : extraState.currentPage) + 1);
    webLinkStore.updateIsRequest(true);

    const { data: res, error } = await getClient().listWeblinks({
      body: queryPayload,
    });

    if (error || !res?.success) {
      message.error(t('loggedHomePage.homePage.weblinkList.list.fetchErr'));
      webLinkStore.updateIsRequest(false);

      return;
    }

    // 处理分页
    if (res?.data && res?.data?.length < pageSize) {
      webLinkStore.updateHasMore(false);
    }

    console.log('res', res);
    webLinkStore.updateWebLinkList(res?.data || []);
    webLinkStore.updateIsRequest(false);
  };

  //编辑
  // const handleEdit = async (params: { id: string; title: string }) => {
  //   const res = await sendToBackground({
  //     name: "updateConversation",
  //     body: params,
  //   })
  // }

  //删除
  // const handleDelete = async (params: { id: string }) => {
  //   Modal.confirm({
  //     title: "确认删除会话！",
  //     style: {
  //       width: 340,
  //       height: 170,
  //     },
  //     content: "您确定要删除此对话吗？",
  //     okButtonProps: {
  //       status: "danger",
  //     },

  //     onOk: () => {
  //       return sendToBackground({
  //         name: "deleteConversation",
  //         body: params,
  //       })
  //     },
  //   })
  // }

  const MemoWebLinkItem = memo(WebLinkItem, (prev, next) => {
    if (prev?.weblink?.title !== next?.weblink?.title) return true;
    return false;
  });

  const memoData = useMemo(() => {
    return (webLinkStore?.webLinkList || []).map((item, key) => ({
      key,
      content: item,
    }));
  }, [webLinkStore?.webLinkList?.length]);

  const columns: TableColumnProps[] = [
    {
      key: '0',
      dataIndex: 'content',
      title: 'content',
      render: (col, record, index) => <MemoWebLinkItem weblink={record?.content} key={index} />,
    },
  ];

  // 节流的处理
  const handleScroll = throttle(() => {
    const { webLinkList } = useWeblinkStore.getState();

    // 获取列表的滚动高度，以及现在的列表数量，当还存在 2 个时触发滚动
    const scrollTopElem = document.querySelector('.conv-list')?.querySelector('.arco-table-body');

    if (!scrollTopElem || webLinkList?.length < 10) return;
    const scrollTop = scrollTopElem?.scrollTop || 0;
    const scrollHeight = scrollTopElem?.scrollHeight || 0;
    const clientHeight = scrollTopElem?.clientHeight;

    console.log('clientHeight', scrollTop, clientHeight, scrollHeight);
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loadMore();
    }
  }, 500);

  useEffect(() => {
    if (webLinkStore?.isWebLinkListVisible) {
      loadMore(1);
    }
  }, [webLinkStore?.isWebLinkListVisible]);

  return (
    <div style={{ width: '100%' }}>
      <Drawer
        width="392px"
        style={{
          zIndex: 66,
        }}
        headerStyle={{ justifyContent: 'center' }}
        title={
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>{t('loggedHomePage.homePage.weblinkList.title')}</span>
          </div>
        }
        visible={webLinkStore.isWebLinkListVisible}
        placement="right"
        footer={
          <div className="weblink-footer-container">
            <p className="weblink-footer-selected">
              {t('loggedHomePage.homePage.weblinkList.selectedCnt', {
                count: webLinkStore.selectedRow?.length,
              })}
            </p>
            <div>
              <Button
                onClick={() => {
                  webLinkStore.updateIsWebLinkListVisible(false);
                }}
                style={{ marginRight: 8 }}
              >
                {t('loggedHomePage.homePage.weblinkList.drawer.cancel')}
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  webLinkStore.updateIsWebLinkListVisible(false);
                }}
              >
                {t('loggedHomePage.homePage.weblinkList.drawer.confirm')}
              </Button>
            </div>
          </div>
        }
        onOk={() => {
          webLinkStore.updateIsWebLinkListVisible(false);
        }}
        onCancel={() => {
          webLinkStore.updateIsWebLinkListVisible(false);
        }}
      >
        {/* <Input placeholder="搜索" /> */}
        {/* <div className="conv-list"> */}
        {/* {weblinkList.map((weblink, index) => (
            <WebLinkItem weblink={weblink} key={index} />
          ))} */}

        {/* </div> */}
        <Table
          className="conv-list"
          rowSelection={{
            selectedRowKeys: webLinkStore.selectedRow?.map((item) => item.key),
            onChange: (selectedRowKeys, selectedRows) => {
              console.log('selectedRowKeys', selectedRowKeys);
              console.log('selectedRows', selectedRows);
              webLinkStore.updateSelectedRow(selectedRows);
            },
          }}
          virtualListProps={{
            itemHeight: 100,
            onScroll() {
              handleScroll();
            },
          }}
          scroll={{
            y: `calc(100vh - 112px)`,
          }}
          virtualized={true}
          pagination={false}
          columns={columns}
          data={memoData}
          border={false}
          showHeader={false}
        />
      </Drawer>
    </div>
  );
});

export default PreviosWebsiteList;