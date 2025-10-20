chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    if (msg.type === "fetchWeibo") {
        try {
            const res = await fetch(`https://m.weibo.cn/api/container/getIndex?type=uid&value=${msg.uid}`, {
                headers: { "User-Agent": "Mozilla/5.0" }
            })
            const data = await res.json()
            sendResponse({ success: true, data })
        } catch (err) {
            sendResponse({ success: false, error: err.message })
        }
    }
    return true // Keep message channel open for async response
})
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: "index.html" });
});
