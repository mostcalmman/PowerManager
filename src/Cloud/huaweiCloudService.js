// 华为云服务配置
const HUAWEI_CLOUD_CONFIG = {
  IAM_URL: process.env.NODE_ENV === 'production' 
    ? "https://iam.cn-north-4.myhuaweicloud.com/v3/auth/tokens" 
    : "/api/iam/v3/auth/tokens", // 使用代理路径
    // : "https://iam.cn-north-4.myhuaweicloud.com/v3/auth/tokens",
  IOT_BASE_URL: process.env.NODE_ENV === 'production' 
    ? "https://3b42e90b15.st1.iotda-app.cn-north-4.myhuaweicloud.com/v5/iot" 
    : "/api/iot/v5/iot", // 使用代理路径
    // : "https://3b42e90b15.st1.iotda-app.cn-north-4.myhuaweicloud.com/v5/iot",
  INSTANCE_ID: "02108a22-911a-45de-bbae-186e4331a8b8",
  DOMAIN_NAME: "thecalmman",
  USERNAME: "L610",
  PASSWORD: "QianSaiAPP",
  PROJECT_ID: "1d2b74f87e5c495d9dfb67a7ad8bcab2",
  DEVICE_ID: "681cce3d9314d1185119d0be_DataTransfer"
};

/**
 * 获取华为云用户Token
 * @returns {Promise<string>} token字符串
 */
export async function getHuaweiToken() {
  const payload = {
    auth: {
      identity: {
        methods: ["password"],
        password: {
          user: {
            domain: {
              name: HUAWEI_CLOUD_CONFIG.DOMAIN_NAME
            },
            name: HUAWEI_CLOUD_CONFIG.USERNAME,
            password: HUAWEI_CLOUD_CONFIG.PASSWORD
          }
        }
      },
      scope: {
        domain: {
          name: HUAWEI_CLOUD_CONFIG.DOMAIN_NAME
        }
      }
    }
  };

  try {
    const response = await fetch(HUAWEI_CLOUD_CONFIG.IAM_URL, {
      // mode: 'no-cors',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf8'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 从响应头中获取用户Token
    const token = response.headers.get('X-Subject-Token');
    return token;
  } catch (error) {
    console.error('获取华为云Token失败:', error);
    throw error;
  }
}

/**
 * 获取设备信息
 * @param {string} token - 用户Token
 * @returns {Promise<Object>} 设备信息
 */
export async function getDevice(token) {
  const url = `${HUAWEI_CLOUD_CONFIG.IOT_BASE_URL}/${HUAWEI_CLOUD_CONFIG.PROJECT_ID}/devices/${HUAWEI_CLOUD_CONFIG.DEVICE_ID}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Auth-Token': token,
        'Instance-Id': HUAWEI_CLOUD_CONFIG.INSTANCE_ID
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取设备信息失败:', error);
    throw error;
  }
}

/**
 * 查询设备影子
 * @param {string} token - 用户Token
 * @returns {Promise<Object>} 设备影子信息
 */
export async function getDeviceShadow(token) {
  const url = `${HUAWEI_CLOUD_CONFIG.IOT_BASE_URL}/${HUAWEI_CLOUD_CONFIG.PROJECT_ID}/devices/${HUAWEI_CLOUD_CONFIG.DEVICE_ID}/shadow`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Auth-Token': token,
        'Instance-Id': HUAWEI_CLOUD_CONFIG.INSTANCE_ID
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取设备影子失败:', error);
    throw error;
  }
}

/**
 * 下发设备消息
 * @param {string} token - 用户Token
 * @param {string} message - 消息内容
 * @returns {Promise<Object>} 响应结果
 */
export async function sendDeviceMessage(deviceId, command) {
  const url = `${HUAWEI_CLOUD_CONFIG.IOT_BASE_URL}/${HUAWEI_CLOUD_CONFIG.PROJECT_ID}/devices/${HUAWEI_CLOUD_CONFIG.DEVICE_ID}/messages`;

  console.log('准备发送消息');
  const token = await getHuaweiToken();
  console.log('获取到的Token:', token);
  console.log("\n\n");

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Auth-Token': token,
        'Instance-Id': HUAWEI_CLOUD_CONFIG.INSTANCE_ID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'message': {
          'deviceId': deviceId,
          'command': command
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('发送设备消息失败:', error);
    throw error;
  }
}

/**
 * 从设备影子中解析数据
 * @param {Object} shadowData - 设备影子数据
 * @returns {Object} 解析后的设备数据
 */
export function parseDeviceDataFromShadow(shadowData) {
  try {
    // 根据实际的设备影子数据结构来解析
    // 这里需要根据实际返回的数据结构进行调整
    const deviceData = {
      pluginNumber: 1,
      onlineDeviceNumber: 0,
      temperature: 25,
      humidity: 60,
      power: [0],
      deviceClass: ["插孔断开"],
      pluginOnOff: [0],
    };

    // console.log('parseDeviceDataFromShadow - 原始影子数据:', JSON.stringify(shadowData, null, 2));

    if(shadowData && shadowData.shadow){
      deviceData.pluginNumber = shadowData.shadow[0].reported.properties.PluginNumber || 1;
      deviceData.onlineDeviceNumber = shadowData.shadow[0].reported.properties.PluginInfo.OnlineDeviceNumber || 0; // 等于联通且有功率数据的插孔数
      var i = 0;
      for (i = 0; i < deviceData.pluginNumber; i++) {
        deviceData.pluginOnOff[i] = shadowData.shadow[0].reported.properties.PluginInfo.id[i].OnOff || 0;
        deviceData.power[i] = shadowData.shadow[0].reported.properties.PluginInfo.id[i].Power || 0;
        deviceData.deviceClass[i] = shadowData.shadow[0].reported.properties.PluginInfo.id[i].Class || "插孔断开";
      }
      deviceData.temperature = shadowData.shadow[0].reported.properties.Temperature || 25;
      deviceData.humidity = shadowData.shadow[0].reported.properties.Humidity || 60;

      console.log('parseDeviceDataFromShadow - 解析后的数据:', {
        pluginOnOff: deviceData.pluginOnOff,
        pluginNumber: deviceData.pluginNumber,
        onlineDeviceNumber: deviceData.onlineDeviceNumber,
        temperature: deviceData.temperature,
        humidity: deviceData.humidity,
        power: deviceData.power,
        deviceClass: deviceData.deviceClass
      });
    }

    return deviceData;
  } catch (error) {
    console.error('解析设备影子数据失败:', error);
    return {
      pluginNumber: 1,
      onlineDeviceNumber: 0,
      temperature: 25,
      humidity: 60,
      power: [0],
      deviceClass: ["插孔断开"],
      pluginOnOff: [0],
    };
  }
}

/**
 * 获取并解析云端设备数据的完整流程
 * @returns {Promise<Object>} 解析后的设备数据
 */
export async function fetchCloudDeviceData() {
  try {
    // 1. 获取Token
    const token = await getHuaweiToken();
    console.log('获取到的Token:', token);
    console.log("\n\n");
    
    // 2. 获取设备影子
    const shadowData = await getDeviceShadow(token);
    
    // 3. 解析数据
    const deviceData = parseDeviceDataFromShadow(shadowData);
    
    console.log('从云端获取的设备数据:', deviceData);
    console.log('原始设备影子数据:', shadowData);
    
    return deviceData;
  } catch (error) {
    console.error('获取云端设备数据失败:', error);
    throw error;
  }
}

// console.log("发送设备消息测试: 插孔1, 开启状态");
// sendDeviceMessage(1, 1)