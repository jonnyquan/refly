import { ParseSource, type WebLinkItem } from "@/components/weblink-list/types";
import type { Source } from "@/types";
import { removeUnusedHtmlNode } from "./removeUnusedHtmlNode";
import parse from "node-html-parser";

export const buildSource = (weblink?: Source): Source => {
  const { pageContent = "", metadata = {}, score = -1 } = weblink;
  const { title = "", source = "" } = metadata as {
    title: string;
    source: string;
  };

  return {
    pageContent,
    metadata: {
      title,
      source,
    },
    score,
  };
};

// TODO: 这里需要新增一个方法用于处理 quickAction
export const mapSourceFromWeblinkList = (
  weblinkList: { content: WebLinkItem; key: string | number }[]
) => {
  return weblinkList?.map((item) => ({
    pageContent: item?.content?.originPageDescription,
    metadata: {
      source: item?.content?.originPageUrl,
      title: item?.content?.originPageTitle,
    },
    score: -1,
  }));
};

export const getContentFromHtmlSelector = (selector: string) => {
  const html = removeUnusedHtmlNode();
  const $ = parse(html);

  console.log(
    "getContentFromHtmlSelector",
    $.querySelector(selector).text,
    `target`,
    document.querySelector(selector)
  );

  return {
    target: document.querySelector(selector),
  };
};

export const buildCurrentWeblink = (): Partial<WebLinkItem> => {
  return {
    origin: location?.origin || "", // 冗余存储策略，for 后续能够基于 origin 进行归类归档
    originPageTitle: document?.title || "",
    title: document?.title || "",
    originPageUrl: location.href,
    summary: "",
    relatedQuestions: [],
    parseSource: ParseSource.serverCrawl,
    parseStatus: "init",
    chunkStatus: "init",
  };
};