import { SkillEvent } from '@refly/common-types';
import { CreateChatMessageInput } from '@/conversation/conversation.dto';
import { SkillMeta, User } from '@refly/openapi-schema';
import { SkillRunnableMeta } from '@refly/skill-template';

interface MessageData {
  skillMeta: SkillMeta;
  logs: string[];
  content: string;
  structuredData: Record<string, unknown>;
}

export class MessageAggregator {
  /**
   * Span ID list, in the order of sending
   */
  spanIdList: string[] = [];

  /**
   * Message data, with key being the spanId and value being the message
   */
  data: Record<string, MessageData> = {};

  getOrInitData(event: Pick<SkillEvent, 'spanId' | 'skillMeta'>): MessageData {
    const { spanId, skillMeta } = event;

    const messageData = this.data[spanId];
    if (messageData) {
      return messageData;
    }

    this.spanIdList.push(spanId);

    return {
      skillMeta,
      logs: [],
      content: '',
      structuredData: {},
    };
  }

  addSkillEvent(event: SkillEvent) {
    const msg: MessageData = this.getOrInitData(event);
    switch (event.event) {
      case 'log':
        msg.logs.push(event.content);
        break;
      case 'structured_data':
        if (event.structuredDataKey) {
          msg.structuredData[event.structuredDataKey] = event.content;
        }
        break;
    }
    this.data[event.spanId] = msg;
  }

  setContent(meta: SkillRunnableMeta, content: string) {
    const msg = this.getOrInitData({ skillMeta: meta, spanId: meta.spanId });
    msg.content = content;
    this.data[meta.spanId] = msg;
  }

  getMessages(param: { user: User; convId: string; jobId: string }): CreateChatMessageInput[] {
    const { user, convId, jobId } = param;

    return this.spanIdList.map((spanId) => {
      const { skillMeta, content, logs, structuredData } = this.data[spanId];
      return {
        type: 'ai',
        content,
        skillMeta: JSON.stringify(skillMeta),
        logs: JSON.stringify(logs),
        structuredData: JSON.stringify(structuredData),
        uid: user.uid,
        convId,
        jobId,
      };
    });
  }
}