// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now()) //向数组的开头添加一个或更多元素
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取系统信息
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      }
    })
  },
  globalData: {
    userInfo: null,
    deviceId: "",
    serviceId: "",
    writeCharacteristicId: "",
    characteristicId: "",
    deviceName: "",
    ble_connect_status: "未连接",
    ble_connected: false,
    ble_connect_device: "未连接设备",
    display_mode: -1,
    display_gif: -1,
  }
})
