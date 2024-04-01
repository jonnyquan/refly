import React, { useEffect } from "react"
import { Layout } from "@arco-design/web-react"
import { SiderLayout } from "./sider"
import "./index.scss"
import { useUserStore } from "@/stores/user"

// request
import getUserInfo from "@/requests/getUserInfo"
import { useLocation, useMatch, useNavigate } from "react-router-dom"

// 组件
import { LoginModal } from "@/components/login-modal/index"
import { useCookie } from "react-use"
import { safeStringifyJSON } from "@/utils/parse"

const Content = Layout.Content

interface AppLayoutProps {
  children?: any
}

export const AppLayout = (props: AppLayoutProps) => {
  const userStore = useUserStore()
  const navigate = useNavigate()
  const [token, updateCookie, deleteCookie] = useCookie("_refly_ai_sid")
  const routeDigestDetailPageMatch = useMatch("/digest/:digestId")
  const routeFeedDetailPageMatch = useMatch("/feed/:feedId")

  const getLoginStatus = async () => {
    try {
      const res = await getUserInfo()

      console.log("loginStatus", res)

      if (!res?.success) {
        userStore.setUserProfile(undefined)
        userStore.setToken("")
        localStorage.removeItem("refly-user-profile")

        if (!(routeDigestDetailPageMatch || routeFeedDetailPageMatch)) {
          navigate("/")
        }
      } else {
        userStore.setUserProfile(res?.data)
        localStorage.setItem("refly-user-profile", safeStringifyJSON(res?.data))
      }
    } catch (err) {
      console.log("getLoginStatus err", err)
      userStore.setUserProfile(undefined)
      userStore.setToken("")
    }
  }

  useEffect(() => {
    getLoginStatus()
  }, [token, userStore.loginModalVisible])

  return (
    <Layout className="app-layout main">
      <SiderLayout />
      <Layout
        className="content-layout"
        style={{
          height: "calc(100vh - 16px)",
          flexGrow: 1,
          width: `calc(100% - 200px - 16px)`,
        }}>
        <Content>{props.children}</Content>
      </Layout>
      {userStore.loginModalVisible ? <LoginModal /> : null}
    </Layout>
  )
}