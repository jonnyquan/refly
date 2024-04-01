import { Message as message } from "@arco-design/web-react"

import { useChatStore } from "@/stores/chat"
import { useConversationStore } from "@/stores/conversation"
import { buildConversation } from "@/utils/conversation"
import { useResetState } from "./use-reset-state"
import { useTaskStore } from "@/stores/task"
import { useNavigate } from "react-router-dom"

// 类型
import {
  QUICK_ACTION_TYPE,
  type QUICK_ACTION_TASK_PAYLOAD,
  type Task,
  type Source,
  Thread,
} from "@/types"
import { SearchTarget, useSearchStateStore } from "@/stores/search-state"
import { buildChatTask, buildQuickActionTask } from "@/utils/task"
import { useWeblinkStore } from "@/stores/weblink"
// request
import createNewConversation from "@/requests/createNewConversation"

export const useBuildThreadAndRun = () => {
  const chatStore = useChatStore()
  const conversationStore = useConversationStore()
  const { resetState } = useResetState()
  const taskStore = useTaskStore()
  const navigate = useNavigate()

  const handleCreateNewConversation = async (task: Task) => {
    /**
     * 1. 创建新 thread，设置状态
     * 2. 跳转到 thread 界面，进行第一个回复，展示 问题、sources、答案
     */
    const question = chatStore.newQAText
    const newConversationPayload = buildConversation()

    // 创建新会话
    const res = await await createNewConversation({
      body: newConversationPayload,
    })

    if (!res?.success) {
      message.error({
        content: "创建新会话失败！",
      })
      return
    }

    console.log("createNewConversation", res)
    conversationStore.setCurrentConversation(res?.data as Thread)

    // 清空之前的状态
    resetState()

    // 设置当前的任务类型及会话 id
    task.data = {
      ...(task?.data || {}),
      conversationId: res?.data?.id,
    }
    taskStore.setTask(task)

    // 更新新的 newQAText，for 新会话跳转使用
    chatStore.setNewQAText(question)
    chatStore.setIsNewConversation(true)
    navigate(`/thread/${res?.data?.id}`)
  }

  const runChatTask = () => {
    const question = chatStore.newQAText
    const { selectedRow } = useWeblinkStore.getState()
    const { searchTarget } = useSearchStateStore.getState()

    let selectedWebLink: Source[] = []

    if (searchTarget === SearchTarget.CurrentPage) {
      selectedWebLink = [
        {
          pageContent: "",
          metadata: {
            title: document?.title || "",
            source: location.href,
          },
          score: -1, // 手工构造
        },
      ]
    } else if (searchTarget === SearchTarget.SelectedPages) {
      selectedWebLink = selectedRow?.map(item => ({
        pageContent: "",
        metadata: {
          title: item?.content?.originPageTitle || "",
          source: item?.content?.originPageUrl || "",
        },
        score: -1, // 手工构造
      }))
    }

    const task = buildChatTask({
      question,
      filter: { weblinkList: selectedWebLink },
    })

    // 创建新会话并跳转
    handleCreateNewConversation(task)
  }

  const runQuickActionTask = async (payload: QUICK_ACTION_TASK_PAYLOAD) => {
    const task = buildQuickActionTask({
      question: `总结网页`,
      actionType: QUICK_ACTION_TYPE.SUMMARY,
      filter: payload?.filter,
      actionPrompt: "总结网页内容并提炼要点",
    })

    // 创建新会话并跳转
    handleCreateNewConversation(task)
  }

  return { handleCreateNewConversation, runQuickActionTask, runChatTask }
}