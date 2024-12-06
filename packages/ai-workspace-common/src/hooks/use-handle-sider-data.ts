import { useEffect } from 'react';
import { useSiderStoreShallow } from '@refly-packages/ai-workspace-common/stores/sider';
import getClient from '@refly-packages/ai-workspace-common/requests/proxiedRequest';

const DATA_NUM = 5;

export const useHandleSiderData = (initData?: boolean) => {
  const { canvasList, libraryList, updateCanvasList, updateLibraryList } = useSiderStoreShallow((state) => ({
    canvasList: state.canvasList,
    libraryList: state.libraryList,
    updateCanvasList: state.setCanvasList,
    updateLibraryList: state.setLibraryList,
  }));

  const getCanvasList = async () => {
    const { data: res, error } = await getClient().listCanvases({
      query: { page: 1, pageSize: DATA_NUM },
    });
    if (error) {
      console.error('getCanvasList error', error);
      return;
    }
    const canvases = res?.data || [];
    updateCanvasList(
      canvases.map((canvas) => ({
        id: canvas.canvasId,
        name: canvas.title,
        updatedAt: canvas.updatedAt,
        type: 'canvas',
      })),
    );
  };

  const getDocumentList = async () => {
    const { data: res, error } = await getClient().listDocuments({
      query: { page: 1, pageSize: DATA_NUM },
    });
    if (error) {
      console.error('getDocumentList error', error);
      return;
    }
    const documents = res?.data || [];
    return documents.map((document) => ({
      id: document.docId,
      name: document.title,
      updatedAt: document.updatedAt,
      type: 'document',
    }));
  };

  const getResourceList = async () => {
    const { data: res, error } = await getClient().listResources({
      query: { page: 1, pageSize: DATA_NUM },
    });
    if (error) {
      console.error('getResourceList error', error);
      return;
    }
    const resources = res?.data || [];
    return resources.map((resource) => ({
      id: resource.resourceId,
      name: resource.title,
      updatedAt: resource.updatedAt,
      type: 'resource',
    }));
  };

  const mixDocumentAndResourceByUpdateAt = (documentList, resourceList) => {
    const mixedList = [...documentList, ...resourceList].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    return mixedList.slice(0, DATA_NUM);
  };

  const getLibraryList = async () => {
    const documentList = await getDocumentList();
    const resourceList = await getResourceList();
    const libraryList = mixDocumentAndResourceByUpdateAt(documentList, resourceList);
    updateLibraryList(libraryList);
  };

  const loadSiderData = async () => {
    getCanvasList();
    getLibraryList();
  };

  useEffect(() => {
    if (initData) {
      loadSiderData();
    }
  }, []);

  return { loadSiderData, getLibraryList, getCanvasList, canvasList, libraryList };
};