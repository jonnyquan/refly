import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { Topic } from '@refly/openapi-schema';

interface TopicState {
  topicList: Topic[];
  pageSize: number;
  currentPage: number;
  hasMore: boolean;
  total: number;

  updateTopicList: (newTopicList: Topic[]) => void;
  updateTopicTotalCnt: (total: number) => void;
  updateCurrentPage: (currentPage: number) => void;
  updateHasMore: (hasMore: boolean) => void;
  resetState: () => void;
}

export const defaultState = {
  topicList: [],
  total: 0,
  pageSize: 10,
  currentPage: 1,
  hasMore: true,
};

export const useDigestTopicStore = create<TopicState>()(
  devtools((set) => ({
    ...defaultState,

    updateTopicList: (newTopicList: Topic[]) =>
      set((state) => ({
        ...state,
        topicList: state.topicList.concat(newTopicList),
      })),
    updateTopicTotalCnt: (total: number) =>
      set((state) => ({
        ...state,
        total,
      })),
    updateCurrentPage: (currentPage: number) => set((state) => ({ ...state, currentPage })),
    updateHasMore: (hasMore: boolean) => set((state) => ({ ...state, hasMore })),
    resetState: () => set((state) => ({ ...state, ...defaultState })),
  })),
);