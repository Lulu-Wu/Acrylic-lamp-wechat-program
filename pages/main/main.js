// pages/main/main.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ble_connect_status: app.globalData.ble_connect_status,
    ble_connect_device: app.globalData.ble_connect_device,
    wifi_connect_status: app.globalData.wifi_connect_status,
    ble_hasnot_conn: true,
    has_conn_wifi_name: '未连接Wi-Fi',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.setData({
      ble_connect_status: app.globalData.ble_connect_status,
      ble_connect_device: app.globalData.ble_connect_device,
      wifi_connect_status: app.globalData.wifi_connect_status,
      has_conn_wifi_name: app.globalData.has_conn_wifi_name
    })
    if(app.globalData.ble_connect_status == "已连接"){
      this.setData({
        ble_hasnot_conn: false
      })
    }
    else{
      this.setData({
        ble_hasnot_conn: true
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // wx.closeBLEConnection({
		// 	deviceId: app.globalData.deviceId,
		// 	success: e => {
		// 		this.setData({
		// 			connected: false,
		// 			connectName: '未连接'
		// 		})
		// 		console.log("页面卸载，断开连接！")
		// 	}
		// })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  jumpToBLEConnPage(){
    wx.navigateTo({
      url: '../bleConnect/bleConnect'
    })
  },
  jumpToBLECommPage(){
    wx.navigateTo({
      url: '../bleComm/bleComm'
    })
  }
})