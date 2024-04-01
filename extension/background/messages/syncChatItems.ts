import { type PlasmoMessaging, sendToContentScript } from "@plasmohq/messaging"

import { appConfig } from "~utils/config"
import { request } from "~utils/request"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log(req.body)

  try {
    const [err, syncRes] = await request(appConfig.url.syncChatItems, {
      method: "POST",
      body: req.body
    })
    if (err) {
      res.send({
        success: false,
        errMsg: err
      })
    } else {
      res.send({
        success: true,
        data: syncRes
      })
    }
  } catch (err) {
    res.send({
      success: false,
      errMsg: err
    })
  }
}

export default handler