import { TASK_TYPE } from '@refly/common-types';

export const defaultMessageState = {
  pendingMsg: '', // 生成中的 msg
  pendingFirstToken: false, // 是否正在准备生成，如果收到第一个字符，即代表已经开始生生成
  pending: false, // 是否正在生成，表示一次任务生成是否正在进行中
  error: false, // 此次信息是否出错，比如还没开始生成就 abort，显示错误信息
  pendingReplyMsg: null, // 即将生成的 replyMsg 对象
  taskType: TASK_TYPE.CHAT,
  history: [], // 本次聊天历史
  pendingSourceDocs: [], // 实现搜索知识库时，给出的答案引用来源，也是流式获取
  pendingRelatedQuestions: [], // 实现搜索知识库时，给出的答案引用来源，也是流式获取
};