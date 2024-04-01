import type { Source } from "./"

export interface MetaRecord {
  // 分类key，例如 startup_product_research
  key: string
  // 分类名称，例如: 这个标签涉及创业公司的产品开发、市场定位、用户体验设计和产品管理等方面。这些内容可以帮助创业者了解如何将AI技术转化为实际可用的产品，并在市场上取得成功。
  name: string
  // 分类分数
  score: number
  // 分类原因
  reason: string
}

export interface ContentMeta {
  topics: MetaRecord[]
  contentType?: MetaRecord[]
  formats?: MetaRecord[]
  needIndex?: boolean
  topicKeys?: string[]
}

export interface Digest {
  id: string
  title: string
  abstract: string
  meta: ContentMeta
  source: Source[]
  createdAt: string
  updatedAt: string
}

export type DateType = "daily" | "weekly" | "month" | "yearly"

export interface DigestFilter {
  date?: {
    year?: string
    month?: string
    day?: string
    dateType: DateType
  }

  topic?: string
}