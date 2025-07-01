// 由于浏览器的 CORS 限制，直接从前端调用华为云 API 可能会失败
// 这个文件提供了一个备选方案：通过本地代理服务器或者模拟数据

/**
 * 模拟从云端获取的设备数据（用于开发测试）
 */
export const mockDeviceData = {
  deviceNumber: 42, // 模拟 Test 数据
  power: [100, 150, 120, 180, 200],
  temperature: 28.5,
  humidity: 65.2,
  testData: 42
};

/**
 * 模拟华为云服务调用（开发环境使用）
 * @returns {Promise<Object>} 模拟的设备数据
 */
export async function fetchCloudDeviceDataMock() {
  return new Promise((resolve) => {
    // 模拟网络延迟
    setTimeout(() => {
      console.log('使用模拟数据（开发环境）');
      resolve(mockDeviceData);
    }, 1000);
  });
}

/**
 * 通过代理服务器获取设备数据
 * 需要在后端或者 package.json 中配置代理
 * @returns {Promise<Object>} 设备数据
 */
export async function fetchCloudDeviceDataViaProxy() {
  try {
    // 这里应该调用你的后端 API 或者代理服务
    const response = await fetch('/api/device-data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('通过代理获取设备数据失败:', error);
    throw error;
  }
}

/**
 * 智能选择获取数据的方式
 * 优先尝试直接调用，失败则使用代理或模拟数据
 * @returns {Promise<Object>} 设备数据
 */
export async function fetchDeviceDataSmart() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // 开发环境使用模拟数据
    console.log('开发环境：使用模拟数据');
    return await fetchCloudDeviceDataMock();
  }
  
  try {
    // 生产环境尝试通过代理获取真实数据
    return await fetchCloudDeviceDataViaProxy();
  } catch (error) {
    console.warn('获取真实数据失败，使用模拟数据:', error);
    return await fetchCloudDeviceDataMock();
  }
}
