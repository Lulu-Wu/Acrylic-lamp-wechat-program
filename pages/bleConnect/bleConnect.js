const app = getApp()
var utils = require("../../utils/util.js");

Page({
	data: {
		isopen: false, //蓝牙适配器是否已打开
		devices: [],
		connected: false,
    connectName: '未连接',
    serviceId: "",
		writeCharacteristicId: "",
		readCharacteristicId: "",
    characteristicsId: "",
  },

	startScan: function (e) {
		var self = this;
		if (self.data.isopen) {
      self.getBluetoothAdapterState();
		} else {
      self.openBluetoothAdapter();
		}
	},

	getBluetoothAdapterState: function () {
		var self = this;
		wx.getBluetoothAdapterState({
			success: e => {
				console.log("getBluetoothAdapterState", e);
				if (e.available) {
					self.startScanDevices();
				} else {
					wx.showModal({
						title: '错误',
						content: '蓝牙适配器不可用！',
					})
				}
			},
			fail: console.error
		})
	},
	openBluetoothAdapter: function () {
		var self = this;
		wx.openBluetoothAdapter({
			success: e => {
				self.setData({
					isopen: true,
				})
				console.log(e);
			},
			fail: e => {
				wx.showModal({
					title: '蓝牙未打开',
					content: '请先打开手机蓝牙！',
				})
			}
		})
	}, 
	startScanDevices: function () {
		wx.showLoading({
			title: '搜索中',
		})
		var self = this;
		wx.startBluetoothDevicesDiscovery({
			success: e => {
				console.log("startScanDevices", e);
				wx.getBluetoothDevices({
					success: e => {
						console.log("getBluetoothDevices success", e);
						self.setData({
              devices: e.devices,
            })
            console.log(self.data.devices[0],self.data.devices.length)
            for (let i = 0; i < self.data.devices.length; i++) {
              if (self.data.devices[i].localName == 'Propylene') {
                var temp_device = self.data.devices[0];
                self.data.devices[0] = self.data.devices[i];
                self.data.devices[i] = temp_device;
                console.log('change device list success')
                console.log(self.data.devices[0])
                break;
              }
              else{
                console.log('not find match bluetooth')
              }
            }
            self.setData({
              devices: self.data.devices,
            })
					},
					fail: e => {
						console.log("getBluetoothDevices fail", e);
					}
				})
			},
			fail: e => {
				console.log(e)
			},
			complete: e => {
				wx.hideLoading();
			}
		})
	},

	startConnect: function (e) {
		console.log("点击连接", e)
		var self = this;
		if ((self.data.connected == true) && (e.currentTarget.dataset.name == self.data.connectName)) {
			wx.switchTab({
				url: '../main/main',
			})
		} else {
			wx.showModal({
				title: '提示',
				content: '是否连接到' + e.currentTarget.dataset.name + '？',
				success: res => {
					if (res.confirm) {
						wx.createBLEConnection({
							deviceId: e.currentTarget.dataset.id,
							success: res => {
								console.log("成功连接", res)
								self.setData({
									connected: true,
                  connectName: e.currentTarget.dataset.name,
								})
								app.globalData.deviceId = e.currentTarget.dataset.id
                app.globalData.deviceName = e.currentTarget.dataset.name
                app.globalData.ble_connect_status = "已连接"
                app.globalData.ble_connected = true
                app.globalData.ble_connect_device = e.currentTarget.dataset.name
								wx.stopBluetoothDevicesDiscovery({
									success: e => {
										console.log(e)
									},
									fail: console.error,
                })
                //测试片段代码
                wx.showToast({
                  title: '加载中',
                  icon: 'loading',
                  duration: 5000
                 });
                wx.getBLEDeviceServices({
                  deviceId: app.globalData.deviceId,
                  success: e => {
                    console.log("获取服务UUID成功", e)
                    self.setData({
                      serviceId: e.services[0].uuid,
                    })
                    wx.getBLEDeviceCharacteristics({
                      deviceId: app.globalData.deviceId,
                      serviceId: e.services[0].uuid,
                      success: res => {
                        console.log("获取特征值成功", res)
                        for (let i = 0; i < res.characteristics.length; i++) {
                          if (res.characteristics[i].properties.write) {
                            self.setData({
                              writeCharacteristicId: res.characteristics[i].uuid
                            })
                            console.log("write特征值", res.characteristics[i].uuid)
                          }
                          if (res.characteristics[i].properties.read) {
                            self.setData({
                              readCharacteristicId: res.characteristics[i].uuid
                            })
                            console.log("read特征值", res.characteristics[i].uuid)
                          }
                          if (res.characteristics[i].properties.notify) {
                            self.setData({
                              characteristicId: res.characteristics[i].uuid
                            })
                            console.log("notify特征值", res.characteristics[i].uuid)
                            self.onBLEnotify();
                          }
                        }
                        app.globalData.serviceId = self.data.serviceId
                        app.globalData.writeCharacteristicId = self.data.writeCharacteristicId
                        app.globalData.characteristicId=self.data.characteristicId
                      },
                      fail: res => {
                        console.log("获取特征值失败", res)
                      }
                    })
                  },
                  fail: e => {
                    console.error
                  }
                })
                setTimeout(function () {
                  let get_wifi_status_buffer = new ArrayBuffer(3)
                  let get_wifi_status_data_view = new DataView(get_wifi_status_buffer)
                  get_wifi_status_data_view.setUint8(0, parseInt(2)) //STX ascii表示正文开始
                  get_wifi_status_data_view.setUint8(1, parseInt(20)) //17代表设置WiFi，18代表切换模式，19代表设计,20用于获取当前wifi连接名称
                  get_wifi_status_data_view.setUint8(2, parseInt(3)) //ETX ascii表示正文结束
                  console.log("发送获取当前wi-Fi状态数据", get_wifi_status_buffer)
                  wx.writeBLECharacteristicValue({
                    deviceId: app.globalData.deviceId,
                    serviceId: app.globalData.serviceId,
                    characteristicId: app.globalData.writeCharacteristicId,
                    value: get_wifi_status_buffer,
                    success: e => {
                      console.log("成功写入", e)
                    },
                    fail: e => {
                      console.log("写入失败", e)
                    }
                  })
                 }, 2000)
                 
                //测试片段代码
                setTimeout(function () {
                  wx.switchTab({
                    url: '../main/main',
                  })
                }, 3000)
							},
							fail: res => {
								wx.showToast({
									title: '连接失败',
									icon: 'none',
								})
							}
						})
					} else if (res.cancel) {
						console.log("取消连接")
					}
				}
			})
		}

	},
	stopConnect: function () {
		var self = this;
		if (self.data.connected) {
			wx.closeBLEConnection({
				deviceId: app.globalData.deviceId,
				success: e => {
					wx.showToast({
						title: '已断开连接！',
						icon: 'none'
					})
					self.setData({
						connected: false,
						connectName: '未连接'
          })
          app.globalData.ble_connect_status = "未连接",
          app.globalData.ble_connected = false,
          app.globalData.ble_connect_device = "未连接设备",
          console.log(e)
          wx.closeBLEConnection({
			      deviceId: app.globalData.deviceId,
			      success: e => {
				    this.setData({
					    connected: false,
					    connectName: '未连接'
				    })
				    console.log("手动点击，断开连接！")
			      }
		      })
				},
				fail: console.error
			})
		} else {
			wx.showToast({
        title: '没有已连接设备',
				icon: 'none',
			})
		}
  },
  //测试片段代码
  onBLEnotify: function () {
		var self = this;
		wx.notifyBLECharacteristicValueChange({
			deviceId: app.globalData.deviceId,
			serviceId: self.data.serviceId,
			characteristicId: self.data.characteristicId,
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
    })
  },
  
  onBLEConnectionStateChange: function (onFailCallback) {
		wx.onBLEConnectionStateChange(function (res) {
			// 该方法回调中可以用于处理连接意外断开等异常情况
			console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`);
			return res.connected;
		});
  },

  //测试片段代码

	onLoad: function (e) {
		var self = this;
		self.openBluetoothAdapter();
  },
  onShow: function (e) {
		var self = this;
		self.setData({
      connected: app.globalData.ble_connected,
      connectName: app.globalData.ble_connect_device,
    })
  },

	onUnload: function (e) {
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
	onHide: function () {

	}
})