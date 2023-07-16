// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    modeList: [
      {modeName: "冷光模式", checked: false},
      {modeName: "暖光模式", checked: false},
      {modeName: "桃红柳绿", checked: false},
      {modeName: "骄阳似火", checked: false},
      {modeName: "一叶知秋", checked: false},
      {modeName: "星夜如梦", checked: false},
      {modeName: "彩虹呼吸灯", checked: false},
    ],
    serviceId: "",
		writeCharacteristicId: "",
		readCharacteristicId: "",
    characteristicsId: "",
    showModal: true,
    user_define_mode: true
  },

  onLoad() {
  },
  onShow: function() {
    var self = this;
    if(app.globalData.ble_connect_status == "已连接"){
      self.setData({
        showModal: false
      })
    }
      else{
        self.setData({
          showModal: true
        })
      }
  },

  modeSwitch: function (options) {
    var index = options.currentTarget.dataset.index; //被点击按钮索引
    var item = this.data.modeList[index];        // 索引对应内容
    for (let i = 0; i < this.data.modeList.length; i++) {
      if (i == index) {
        item.checked = true;   //当前点击的位置为选中的按钮
      }
      else {
        this.data.modeList[i].checked = false;  //其他的位置为false
      }
    }
    // item.checked = !item.checked; //多选情况下
    app.globalData.display_mode = index
    this.setData({
      modeList: this.data.modeList,
      user_define_mode: false,
    });
    this.BLEWriteMode()
  },

  BLEWriteMode (e) {
    var self = this;
    let current_mode = app.globalData.display_mode.toString()
    let mode_buffer = new ArrayBuffer(4)
    let mode_dataView = new DataView(mode_buffer)
    mode_dataView.setUint8(0, parseInt(2)) //STX ascii表示正文开始
    mode_dataView.setUint8(1, parseInt(18)) //18代表切换模式
    mode_dataView.setUint8(2, parseInt(current_mode.charCodeAt())) //0代表xxxx模式,1代表xxxx模式,2代表xxxx模式,3代表xxxx模式
    mode_dataView.setUint8(3, parseInt(3)) //ETX ascii表示正文结束
    console.log("发送当前选择模式数据", mode_buffer)
    wx.writeBLECharacteristicValue({
      deviceId: app.globalData.deviceId,
      serviceId: app.globalData.serviceId,
      characteristicId: app.globalData.writeCharacteristicId,
      value: mode_buffer,
      success: e => {
        console.log("成功写入", e)
      },
      fail: e => {
        console.log("写入失败", e)
      }
    })
  }
})


