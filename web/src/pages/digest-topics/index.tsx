import {
  List,
  Avatar,
  Skeleton,
  Message as message,
} from "@arco-design/web-react"

// styles
import "./index.scss"
import { IconTag } from "@arco-design/web-react/icon"
import { useEffect, useState } from "react"
// stores
import { useDigestTopicStore } from "@/stores/digest-topics"
import { useMatch, useNavigate } from "react-router-dom"
// utils
import getDigestTopicList from "@/requests/getTopicList"

const names = ["Socrates", "Balzac", "Plato"]
const avatarSrc = [
  "//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a8c8cdb109cb051163646151a4a5083b.png~tplv-uwbnlip3yd-webp.webp",
  "//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/e278888093bef8910e829486fb45dd69.png~tplv-uwbnlip3yd-webp.webp",
  "//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/9eeb1800d9b78349b24682c3518ac4a3.png~tplv-uwbnlip3yd-webp.webp",
]
const imageSrc = [
  "//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/29c1f9d7d17c503c5d7bf4e538cb7c4f.png~tplv-uwbnlip3yd-webp.webp",
  "//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/04d7bc31dd67dcdf380bc3f6aa07599f.png~tplv-uwbnlip3yd-webp.webp",
  "//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/1f61854a849a076318ed527c8fca1bbf.png~tplv-uwbnlip3yd-webp.webp",
]
const dataSource = new Array(60).fill(null).map((_, index) => {
  return {
    id: index,
    index: index,
    avatar: avatarSrc[index % avatarSrc.length],
    title: names[index % names.length],
    description: "Beijing ByteDance Technology Co.,",
    imageSrc: imageSrc[index % imageSrc.length],
    sourceCount: 100,
  }
})

export const DigestTopics = () => {
  const digestTopicStore = useDigestTopicStore()
  const [scrollLoading, setScrollLoading] = useState(
    <Skeleton animation></Skeleton>,
  )
  const navigate = useNavigate()
  const isDigestTopics = useMatch("/digest/topics")

  const fetchData = async (currentPage = 1) => {
    try {
      console.log("currentPage", currentPage)
      if (!digestTopicStore?.hasMore && currentPage !== 1) {
        setScrollLoading(<span>已经到底啦~</span>)
        return
      }

      const newRes = await getDigestTopicList({
        body: {
          page: currentPage,
          pageSize: 10,
        },
      })

      digestTopicStore.updateCurrentPage(currentPage)

      if (!newRes?.success) {
        throw new Error(newRes?.errMsg)
      }
      if (
        newRes?.data &&
        newRes?.data?.list?.length < digestTopicStore?.pageSize
      ) {
        digestTopicStore.updateHasMore(false)
      }

      console.log("newRes", newRes)
      digestTopicStore.updateTopicList(newRes?.data?.list || [])
    } catch (err) {
      message.error("获取主题列表失败，请重新刷新试试")
    }
  }

  useEffect(() => {
    fetchData()
  }, [isDigestTopics])

  return (
    <div className="topics-container">
      <List
        className="topics-list"
        grid={{
          sm: 24,
          md: 12,
          lg: 8,
          xl: 6,
        }}
        dataSource={dataSource}
        wrapperStyle={{ width: "100%" }}
        bordered={false}
        pagination={false}
        offsetBottom={50}
        header={
          <div className="topics-header-container">
            <div className="topics-header-title">所有主题</div>
            <p className="topics-header-desc">
              基于您的浏览历史、会话历史分析提取出来的主题分类，代表您的阅读和学习趋势
            </p>
          </div>
        }
        scrollLoading={scrollLoading}
        onReachBottom={currentPage => fetchData(currentPage)}
        noDataElement={<div>暂无数据</div>}
        render={(item, index) => (
          <List.Item
            key={index}
            className="topic-item-container"
            onClick={() => navigate(`/digest/topic/${item?.id}`)}>
            <div className="topic-item">
              <div className="topic-item-left">
                <Avatar size={60} shape="square">
                  <img src={item.imageSrc} alt="topic-cover" />
                </Avatar>
              </div>
              <div className="topic-item-right">
                <div className="topic-item-title">{item.title}</div>
                <div className="topic-item-desc">{item.description}</div>
                <div className="topic-item-source-cnt">
                  <IconTag />
                  <span>{item.sourceCount}</span>
                </div>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  )
}