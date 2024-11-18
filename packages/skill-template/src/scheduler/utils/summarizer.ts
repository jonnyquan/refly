import { IContext, SelectedContentDomain, SkillContextContentItemMetadata } from '../types';
import {
  SkillContextContentItem,
  SkillContextResourceItem,
  Source,
  ResourceType,
  SkillContextDocumentItem,
} from '@refly-packages/openapi-schema';
import { truncateContext, truncateMessages } from './truncator';
import { BaseMessage } from '@langchain/core/messages';
import { getClientOrigin } from '@refly-packages/utils';

export const concatChatHistoryToStr = (messages: BaseMessage[]) => {
  let chatHistoryStr = '';

  if (messages.length > 0) {
    const concatMessage = (content: string, type: string) => {
      return `<ChatHistoryItem type={${type}}>${content}</ChatHistoryItem>`;
    };

    chatHistoryStr += messages.map((m) => {
      const type = m?.additional_kwargs?.type as string;
      const content = m.content as string;
      return concatMessage(content, type);
    });
  }

  if (chatHistoryStr?.length > 0) {
    chatHistoryStr = `<ChatHistory>${chatHistoryStr}</ChatHistory>`;
  }

  return chatHistoryStr;
};

export const concatMergedContextToStr = (mergedContext: {
  mentionedContext: IContext;
  lowerPriorityContext: IContext;
  webSearchSources: Source[];
}) => {
  const { mentionedContext, lowerPriorityContext, webSearchSources } = mergedContext || {};
  let contextStr = '';
  let currentIndex = 1; // Start index

  const webSearchContexConcatRes = concatContextToStr({ webSearchSources }, currentIndex);
  const mentionedContextConcatRes = concatContextToStr(mentionedContext, webSearchContexConcatRes.nextIndex);
  const lowerPriorityContextConcatRes = concatContextToStr(lowerPriorityContext, mentionedContextConcatRes.nextIndex);

  if (webSearchContexConcatRes.contextStr?.length > 0) {
    contextStr += `\n\n<WebSearchContext>\n${webSearchContexConcatRes.contextStr}\n</WebSearchContext>\n\n`;
  }

  if (mentionedContextConcatRes.contextStr?.length > 0) {
    contextStr += `\n\n<MentionedContext>\n${mentionedContextConcatRes.contextStr}\n</MentionedContext>\n\n`;
  }

  if (lowerPriorityContextConcatRes.contextStr?.length > 0) {
    contextStr += `\n\n<OtherContext>\n${lowerPriorityContextConcatRes.contextStr}\n</OtherContext>\n\n`;
  }

  return contextStr;
};

export const flattenMergedContextToSources = (mergedContext: {
  mentionedContext: IContext;
  lowerPriorityContext: IContext;
  webSearchSources: Source[];
}) => {
  const { mentionedContext, lowerPriorityContext, webSearchSources } = mergedContext || {};

  const sources = [
    ...flattenContextToSources({
      webSearchSources,
    }),
    ...flattenContextToSources(mentionedContext),
    ...flattenContextToSources(lowerPriorityContext),
  ];

  // Remove duplicates
  const uniqueSources = sources.filter(
    (source, index, self) =>
      index ===
      self.findIndex((s) => s.url === source.url && s.title === source.title && s.pageContent === source.pageContent),
  );

  return uniqueSources;
};

// TODO: should replace id with `type-index` for better llm extraction
// citationIndex for each context item is used for LLM to cite the context item in the final answer
export const concatContextToStr = (context: Partial<IContext>, startIndex: number = 1) => {
  const { contentList = [], resources = [], documents = [], webSearchSources = [] } = context || {};

  let contextStr = '';
  let index = startIndex; // Use passed in startIndex

  if (webSearchSources.length > 0) {
    // contextStr += 'Following are the web search results: \n';
    const concatWebSearchSource = (url: string, title: string, content: string) => {
      return `<ContextItem citationIndex='[[citation:${index++}]]' type='webSearchSource' url='${url}' title='${title}'>${content}</WebSearchSource>`;
    };

    contextStr += webSearchSources.map((s) => concatWebSearchSource(s.url, s.title, s.pageContent)).join('\n');
    contextStr += '\n\n';
  }

  // TODO: prior handle mentioned context, includes mentioned contentList, canvases, and resources
  // TODO: otherwise, the context more front will be more priority, should be most focused in the prompt

  if (contentList.length > 0) {
    // contextStr += 'Following are the user selected content: \n';
    const concatContent = (content: string, from: SelectedContentDomain, title: string, id?: string, url?: string) => {
      return `<ContextItem citationIndex='[[citation:${index++}]]' type='selectedContent' from='${from}' ${
        id ? `entityId='${id}'` : ''
      } title='${title}' ${url ? `weblinkUrl='${url}'` : ''}>${content}</ContextItem>`;
    };

    const contentStr = contentList
      .map((c) => {
        const { metadata } = c;
        const { domain, entityId, title, url } = metadata as any as SkillContextContentItemMetadata;
        return concatContent(c?.content, domain as SelectedContentDomain, title, entityId, url);
      })
      .join('\n\n');

    contextStr += `\n\n<UserSelectedContent>\n${contentStr}\n</UserSelectedContent>\n\n`;
  }

  if (documents.length > 0) {
    // contextStr += 'Following are the knowledge base canvases: \n';
    const concatCanvas = (id: string, title: string, content: string) => {
      return `<ContextItem citationIndex='[[citation:${index++}]]' type='canvas' entityId='${id}' title='${title}'>${content}</ContextItem>`;
    };

    const canvasStr = documents
      .map((n) => concatCanvas(n.document?.docId!, n.document?.title!, n.document?.content!))
      .join('\n\n');

    contextStr += `\n\n<KnowledgeBaseCanvases>\n${canvasStr}\n</KnowledgeBaseCanvases>\n\n`;
  }

  if (resources.length > 0) {
    // contextStr += 'Following are the knowledge base resources: \n';
    const concatResource = (id: string, type: ResourceType, title: string, content: string) => {
      return `<ContextItem citationIndex='[[citation:${index++}]]' type='resource' entityId='${id}' title='${title}'>${content}</ContextItem>`;
    };

    const resourceStr = resources
      .map((r) =>
        concatResource(r.resource?.resourceId!, r.resource?.resourceType!, r.resource?.title!, r.resource?.content!),
      )
      .join('\n');

    contextStr += `\n\n<KnowledgeBaseResources>\n${resourceStr}\n</KnowledgeBaseResources>\n\n`;
  }

  return { contextStr, nextIndex: index };
};

export const summarizeContext = (context: IContext, maxContextTokens: number): string => {
  const { contentList = [], resources = [], documents = [] } = context || {};
  const previewedContext: IContext = {
    resources: resources.map((r) => ({
      ...r,
      content: r?.resource?.contentPreview || r.resource?.content?.slice(0, 50) + '...',
    })),
    documents: documents.map((n) => ({
      ...n,
      content: n?.document?.contentPreview || n.document?.content?.slice(0, 50) + '...',
    })),
    contentList: contentList.map((c) => ({ ...c, content: c.content?.slice(0, 50) + '...' })),
  };
  const truncatedContext = truncateContext(previewedContext, maxContextTokens);

  // contentPreview just about 100~150 tokens, cannot overflow
  const contextConcatRes = concatContextToStr(truncatedContext, 1);

  return contextConcatRes.contextStr || 'no available context';
};

export const summarizeChatHistory = (messages: BaseMessage[]): string => {
  const chatHistoryStr = concatChatHistoryToStr(truncateMessages(messages));
  return chatHistoryStr || 'no available chat history';
};

export function flattenContextToSources(context: Partial<IContext>): Source[] {
  const { webSearchSources = [], contentList = [], resources = [], documents = [] } = context || {};
  const sources: Source[] = [];

  // Web search sources
  webSearchSources.forEach((source) => {
    sources.push({
      url: source.url,
      title: source.title,
      pageContent: source.pageContent,
      metadata: {
        ...source.metadata,
        source: source.url,
        title: source.title,
        sourceType: 'webSearch', // Add source type for web search results
      },
    });
  });

  const baseUrl = getClientOrigin();

  // User selected content
  contentList.forEach((content: SkillContextContentItem) => {
    const metadata = content.metadata as unknown as SkillContextContentItemMetadata;
    sources.push({
      url: metadata?.url,
      title: metadata?.title,
      pageContent: content.content,
      metadata: {
        ...metadata,
        source: metadata?.url,
        title: metadata?.title,
        entityId: metadata?.entityId,
        entityType: metadata?.domain,
        projectId: metadata?.projectId,
        sourceType: 'library', // Add source type for knowledge base content
      },
    });
  });

  // Knowledge base documents
  documents.forEach((document: SkillContextDocumentItem) => {
    sources.push({
      url: `${baseUrl}/project/${document.document?.docId}?docId=${document.document?.docId}`, // TODO: fix this
      title: document.document?.title,
      pageContent: document.document?.content || '',
      metadata: {
        projectId: document.document?.docId,
        title: document.document?.title,
        entityId: document.document?.docId,
        entityType: 'document',
        source: `${baseUrl}/project/${document.document?.docId}?docId=${document.document?.docId}`, // TODO: fix this
        sourceType: 'library', // Add source type for knowledge base documents
      },
    });
  });

  // Knowledge base resources
  resources.forEach((resource: SkillContextResourceItem) => {
    sources.push({
      url: `${baseUrl}/resource/${resource.resource?.resourceId}`,
      title: resource.resource?.title,
      pageContent: resource.resource?.content || '',
      metadata: {
        title: resource.resource?.title,
        entityId: resource.resource?.resourceId,
        entityType: 'resource',
        source: `${baseUrl}/resource/${resource.resource?.resourceId}`,
        sourceType: 'library', // Add source type for knowledge base resources
      },
    });
  });

  return sources;
}
