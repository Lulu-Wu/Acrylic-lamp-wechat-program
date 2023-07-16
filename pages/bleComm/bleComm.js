var app = getApp();
var utils = require("../../utils/util.js");

Page({
  data: {
    wifi_name: null,
    wifi_password: null,
    serviceId: "",
		writeCharacteristicId: "",
		readCharacteristicId: "",
    characteristicsId: "",
    ble_send_wifiname: "",
    ble_send_wifipassword: "",
    ble_recv_data: "",
    not_recv_wifi_status: false,
    wifi_has_conn_name: "没有已连接Wi-Fi",
    cur_wifi_conn_status: 'cur_false'
  },

  onLoad: function (options) {
    var self = this;
    console.log(self.data.not_recv_wifi_status)
		console.log(app.globalData.deviceName)
		self.setData({
			name: app.globalData.deviceName,
    })
    self.onBLEnotify();
  },

  onBLEnotify: function () {
		var self = this;
		wx.notifyBLECharacteristicValueChange({
			deviceId: app.globalData.deviceId,
			serviceId: app.globalData.serviceId,
			characteristicId: app.globalData.characteristicId,
			state: true,
			success: e => {
				self.onBLEnotifyChange();
				console.log("开启notify成功", e);
			},
		})
  },
  
  onBLEnotifyChange: function (e) {
		var self = this;
		wx.onBLECharacteristicValueChange(function (res) {
			console.log("监听", res.value)
			var resValue = utils.ab2hext(res.value); //16进制字符串
      var resValueStr = utils.hexToString(resValue);
      if(resValueStr == 'true' || resValueStr == 'false'){
        self.setData({
          ble_recv_data: resValueStr,
          })
      }
      else if(resValueStr == 'cur_true' || resValueStr == 'cur_false'){
        self.setData({
          cur_wifi_conn_status: resValueStr,
          })
      }
      else{
        app.globalData.has_conn_wifi_name = resValueStr
      }
      console.log(self.data.ble_recv_data)
      console.log(app.globalData.has_conn_wifi_name)
    })
  },
  
  onBLEConnectionStateChange: function (onFailCallback) {
		wx.onBLEConnectionStateChange(function (res) {
			// 该方法回调中可以用于处理连接意外断开等异常情况
			console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`);
			return res.connected;
		});
  },
  
  getWifiName(e) {
    var self = this;
    console.log(e.detail)
			self.setData({
				ble_send_wifiname: e.detail.value,
      })
      console.log(self.data.ble_send_wifiname)
  },
  getWifiPassword(e) {
    var self = this;
    console.log(e.detail)
			self.setData({
				ble_send_wifipassword: e.detail.value,
      })
      console.log(self.data.ble_send_wifipassword)
  },
  getWifiConnectStatus(){
    var self = this;
    if(self.data.ble_recv_data == 'true'){
      app.globalData.wifi_connect_status = "已连接"
    }
    // 等待确认重试
    // else{
    //   app.globalData.wifi_connect_status = "未连接"
    // }
    console.log("app.globalData.wifi_connect_status:",app.globalData.wifi_connect_status)
  },

  BLEWriteWifi (e) {
    var self = this;
    if(self.data.ble_send_wifiname == ""){
      wx.showToast({
        title: '账号不能为空！',
        icon: 'none',
      })
    }
    else{
      self.setData({
        not_recv_wifi_status: !self.data.not_recv_wifi_status
       })
      var temp = 0
      var length = self.data.ble_send_wifiname.length + self.data.ble_send_wifipassword.length  //全部长度
      var str_name_password = self.data.ble_send_wifiname + self.data.ble_send_wifipassword  //账号和密码连接为一整个字符串
      console.log(str_name_password)
      var byte_name_password = utils.stringToBytes(str_name_password)
  
      let begin_buffer = new ArrayBuffer(3)
      let begin_dataView = new DataView(begin_buffer)
      begin_dataView.setUint8(0, parseInt(2)) //STX ascii表示正文开始
      begin_dataView.setUint8(1, parseInt(17)) //17代表设置WiFi，18代表切换模式，19代表设计
      begin_dataView.setUint8(2, parseInt(self.data.ble_send_wifiname.length)) //存储WiFi_name长度
      console.log("发送wifi_name长度", begin_buffer)
      wx.writeBLECharacteristicValue({
        deviceId: app.globalData.deviceId,
        serviceId: app.globalData.serviceId,
        characteristicId: app.globalData.writeCharacteristicId,
        value: begin_buffer,
        success: e => {
          console.log("成功写入", e)
        },
        fail: e => {
          console.log("写入失败", e)
        }
      })
  
      let pos = 0
      let count = 0
      let tempBuffer //一次发送的数据
      while(length > 0) {
        count++
        if(length > 18){
          tempBuffer = byte_name_password.slice(pos, pos + 18)
          pos += 18
          length -= 18
          console.log("第", count, "条发送数据:", tempBuffer)
            wx.writeBLECharacteristicValue({
              deviceId: app.globalData.deviceId,
              serviceId: app.globalData.serviceId,
              characteristicId: app.globalData.writeCharacteristicId,
              value: tempBuffer,
              success: e => {
                console.log("成功写入", e)
              },
              fail: e => {
                console.log("写入失败", e)
              }
            })
        }
        else{
          tempBuffer = byte_name_password.slice(pos, pos + length)
          pos += length
          length -= length
          console.log("第", count, "条发送数据:", tempBuffer)
            wx.writeBLECharacteristicValue({
              deviceId: app.globalData.deviceId,
              serviceId: app.globalData.serviceId,
              characteristicId: app.globalData.writeCharacteristicId,
              value: tempBuffer,
              success: e => {
                console.log("成功写入", e)
              },
              fail: e => {
                console.log("写入失败", e)
              }
            })
        }
      }
  
      let end_buffer = new ArrayBuffer(1)
        let end_dataView = new DataView(end_buffer)
        end_dataView.setUint8(0, parseInt(3)) //ETX ascii表示正文结束
        console.log("发送数据结束", end_buffer)
        wx.writeBLECharacteristicValue({
          deviceId: app.globalData.deviceId,
          serviceId: app.globalData.serviceId,
          characteristicId: app.globalData.writeCharacteristicId,
          value: end_buffer,
          success: e => {
            console.log("成功写入", e)
          },
          fail: e => {
            console.log("写入失败", e)
          }
        })
  
      setTimeout(function () {
        self.getWifiConnectStatus()
        self.setData({
          not_recv_wifi_status: !self.data.not_recv_wifi_status
        })
        if(app.globalData.wifi_connect_status == '已连接' && self.data.ble_recv_data == 'true' && self.data.cur_wifi_conn_status == 'cur_true'){
          wx.switchTab({
            url: '../main/main'
          })
        }
        else{
          self.setData({
            wifi_name: null,
            wifi_password:null
          })
          wx.showToast({
            title: 'Wi-Fi账号或密码不正确，请重新输入',
            icon: 'none',
          })
        }
       }, 6000)
    }
  }
})
