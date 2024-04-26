import { useEffect, useTransition } from "react"
import { useMatch, useNavigate } from "react-router-dom"

// request
import {
  type LocalSettings,
  defaultLocalSettings,
  useUserStore,
} from "~stores/user"
import { safeParseJSON, safeStringifyJSON } from "~utils/parse"
import { LOCALE, type User } from "~types"
import { useTranslation } from "react-i18next"
import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"
import { bgStorage } from "~storage"
import { Message as message } from "@arco-design/web-react"
import { useMessage } from "@plasmohq/messaging/hook"
import { useSiderStore } from "~stores/sider"

interface ExternalLoginPayload {
  name: string
  body: {
    status: "success" | "failed"
    token?: string
    user?: User
  }
}

export const useGetUserSettings = () => {
  const userStore = useUserStore()
  const navigate = useNavigate()
  const siderStore = useSiderStore()

  const bgMessage = useMessage<ExternalLoginPayload, string>((req, res) => {
    res.send("recevied msg")
  })

  const { i18n } = useTranslation()
  const [token, setToken] = useStorage("token")
  const { t } = useTranslation()

  const [loginNotification, setLoginNotification] = useStorage({
    key: "refly-login-notify",
    instance: bgStorage,
  })

  const getLoginStatus = async () => {
    try {
      let { localSettings, userProfile } = useUserStore.getState()
      const lastStatusIsLogin = !!userProfile?.id

      const res = await sendToBackground({
        name: "getUserInfo",
      })

      console.log("loginStatus", res)

      if (!res?.success) {
        userStore.resetState()
        setLoginNotification("")
        await bgStorage.removeItem("refly-user-profile")
        await bgStorage.removeItem("refly-local-settings")
        navigate("/login")
      } else {
        userStore.setUserProfile(res?.data)

        // 增加 localSettings
        let uiLocale = res?.data?.uiLocale as LOCALE
        let outputLocale = res?.data?.outputLocale as LOCALE

        // 先写回
        localSettings = {
          ...localSettings,
          uiLocale,
          outputLocale,
          isLocaleInitialized: true,
        }

        // 说明是第一次注册使用，此时没有 locale，需要写回
        if (!uiLocale && !outputLocale) {
          uiLocale = (navigator?.language || LOCALE.EN) as LOCALE
          outputLocale = (navigator?.language || LOCALE.EN) as LOCALE
          // 不阻塞写回用户配置
          sendToBackground({
            name: "getUserInfo",
            body: { uiLocale, outputLocale },
          })

          // 如果是初始化的再替换
          localSettings = {
            ...localSettings,
            uiLocale,
            outputLocale,
            isLocaleInitialized: false,
          } as LocalSettings
        }

        // 应用 locale
        i18n.changeLanguage(uiLocale)
        userStore.setLocalSettings(localSettings)

        await bgStorage.setItem(
          "refly-user-profile",
          safeStringifyJSON(res?.data),
        )
        await bgStorage.setItem(
          "refly-local-settings",
          safeStringifyJSON(localSettings),
        )

        if (!lastStatusIsLogin) {
          navigate("/")
        }
      }
    } catch (err) {
      console.log("getLoginStatus err", err)
      userStore.resetState()
      bgStorage.removeItem("refly-user-profile")
      bgStorage.removeItem("refly-local-settings")
      setLoginNotification("")
      navigate("/login")
    }
  }

  const handleLoginStatus = async ({ body: data }: ExternalLoginPayload) => {
    if (data?.status === "success") {
      try {
        let { localSettings, userProfile } = useUserStore.getState()
        const lastStatusIsLogin = !!userProfile?.id

        const res = await sendToBackground({
          name: "getUserInfo",
        })

        console.log("loginStatus", res)

        if (!res?.success) {
          userStore.setUserProfile(undefined)
          userStore.setToken("")
          setToken("")
          await bgStorage.removeItem("refly-user-profile")
          await bgStorage.removeItem("refly-local-settings")

          navigate("/login")
          message.error(t("translation:loginPage.status.failed"))
        } else {
          userStore.setUserProfile(res?.data)
          userStore.setToken(data?.token)
          setToken(data?.token)
          await bgStorage.setItem(
            "refly-user-profile",
            safeStringifyJSON(res?.data),
          )

          // 增加 localSettings
          let uiLocale = res?.data?.uiLocale as LOCALE
          let outputLocale = res?.data?.outputLocale as LOCALE

          // 先写回
          localSettings = {
            ...localSettings,
            uiLocale,
            outputLocale,
            isLocaleInitialized: true,
          }

          // 说明是第一次注册使用，此时没有 locale，需要写回
          if (!uiLocale && !outputLocale) {
            uiLocale = (navigator?.language || LOCALE.EN) as LOCALE
            outputLocale = (navigator?.language || LOCALE.EN) as LOCALE
            // 不阻塞写回用户配置
            sendToBackground({
              name: "getUserInfo",
              body: { uiLocale, outputLocale },
            })

            // 如果是初始化的再替换
            localSettings = {
              ...localSettings,
              uiLocale,
              outputLocale,
              isLocaleInitialized: false,
            } as LocalSettings
          }

          // 应用 locale
          i18n.changeLanguage(uiLocale)

          userStore.setLocalSettings(localSettings)
          await bgStorage.setItem(
            "refly-user-profile",
            safeStringifyJSON(res?.data),
          )
          await bgStorage.setItem(
            "refly-local-settings",
            safeStringifyJSON(localSettings),
          )

          // message.success(t("translation:loginPage.status.success"))

          if (!lastStatusIsLogin) {
            navigate("/")
          }
        }
      } catch (err) {
        console.log("getLoginStatus err", err)
        userStore.setUserProfile(undefined)
        userStore.setLocalSettings(defaultLocalSettings)
        userStore.setToken("")
        setToken("")
        await bgStorage.removeItem("refly-user-profile")
        await bgStorage.removeItem("refly-local-settings")

        navigate("/login")
      }
    } else {
      // message.error(t("translation:loginPage.status.failed"))
    }

    userStore.setIsCheckingLoginStatus(false)
  }

  useEffect(() => {
    if (bgMessage?.data?.name === "refly-login-notify") {
      handleLoginStatus(bgMessage?.data)
    }
  }, [bgMessage.data])
  // sync storage
  useEffect(() => {
    console.log("loginNotification", loginNotification)
    if (loginNotification) {
      const data = safeParseJSON(loginNotification)
      handleLoginStatus(data)
    }
  }, [loginNotification])

  // 监听打开关闭
  useEffect(() => {
    getLoginStatus()
  }, [siderStore?.showSider])

  return {
    getLoginStatus,
  }
}