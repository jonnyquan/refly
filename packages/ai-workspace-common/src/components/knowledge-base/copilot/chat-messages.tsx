// stores
import { useChatStore } from '@refly-packages/ai-workspace-common/stores/chat';
// styles
import { AssistantMessage, HumanMessage, PendingMessage, WelcomeMessage } from './message';
import { useMessageStateStore } from '@refly-packages/ai-workspace-common/stores/message-state';
import { useBuildThreadAndRun } from '@refly-packages/ai-workspace-common/hooks/use-build-thread-and-run';
import { useUserStore } from '@refly-packages/ai-workspace-common/stores/user';
import { Skeleton } from '@arco-design/web-react';

interface ChatMessagesProps {
  disable?: boolean;
  loading?: boolean;
}

export const ChatMessages = (props: ChatMessagesProps) => {
  const chatStore = useChatStore();
  const userStore = useUserStore();
  const messageStateStore = useMessageStateStore();
  const { runSkill } = useBuildThreadAndRun();
  const { loading } = props;

  const LoadingSkeleton = () => {
    return (
      <div style={{ padding: '20px 0' }}>
        <Skeleton animation />
        <Skeleton animation style={{ marginTop: '20px' }} />
      </div>
    );
  };

  return (
    <div className="ai-copilot-message-inner-container">
      {loading ? (
        <LoadingSkeleton />
      ) : (
        chatStore.messages.map((item, index) =>
          item?.type === 'human' ? (
            <HumanMessage
              disable={props.disable}
              message={item}
              key={index}
              profile={{ avatar: userStore?.userProfile?.avatar, name: userStore?.userProfile?.name }}
            />
          ) : (
            <AssistantMessage
              disable={props.disable}
              message={item}
              key={index}
              isLastSession={index === chatStore.messages.length - 1}
              isPendingFirstToken={messageStateStore?.pendingFirstToken as boolean}
              isPending={messageStateStore?.pending as boolean}
              handleAskFollowing={(question?: string) => {
                runSkill(question);
              }}
            />
          ),
        )
      )}
      {chatStore?.messages?.length === 0 && !loading ? <WelcomeMessage /> : null}
      {/* {messageStateStore?.pending && messageStateStore?.pendingFirstToken ? <PendingMessage /> : null} */}
    </div>
  );
};