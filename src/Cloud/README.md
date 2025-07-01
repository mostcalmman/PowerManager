# 云端数据获取功能说明

## 概述
本项目已集成华为云IoT设备管理服务，可以从云端获取设备数据并在前端显示。

## 功能特性

### 1. 华为云服务集成
- 自动获取华为云用户Token
- 查询设备影子信息
- 解析设备数据（特别是Test数据，映射到deviceNumber）
- 支持下发设备消息

### 2. 智能数据获取
- **直接调用**：优先尝试直接调用华为云API
- **备选方案**：如果直接调用失败，自动切换到模拟数据或代理服务
- **开发环境**：自动使用模拟数据，避免频繁调用云端API

### 3. 自动数据刷新
- 应用启动时自动获取数据
- 每5分钟自动刷新数据
- 支持手动刷新功能

## 文件结构

```
src/
├── Cloud/
│   ├── huaweiCloudService.js     # 华为云服务核心功能
│   └── cloudServiceFallback.js  # 备选方案和模拟数据
└── App.js                       # 主应用组件（已更新）
```

## 配置说明

### 华为云配置 (huaweiCloudService.js)
```javascript
const HUAWEI_CLOUD_CONFIG = {
  IAM_URL: "https://iam.cn-north-4.myhuaweicloud.com/v3/auth/tokens",
  IOT_BASE_URL: "https://3b42e90b15.st1.iotda-app.cn-north-4.myhuaweicloud.com/v5/iot",
  INSTANCE_ID: "02108a22-911a-45de-bbae-186e4331a8b8",
  DOMAIN_NAME: "thecalmman",
  USERNAME: "L610",
  PASSWORD: "QianSaiAPP",
  PROJECT_ID: "1d2b74f87e5c495d9dfb67a7ad8bcab2",
  DEVICE_ID: "681cce3d9314d1185119d0be_DataTransfer"
};
```

## 数据映射

从设备影子获取的数据会被映射到应用状态：

- `shadow.reported.Test` → `deviceNumber` (主要数据)
- `shadow.reported.power` → `power` (功率数据数组)
- `shadow.reported.temperature` → `temperature` (温度)
- `shadow.reported.humidity` → `humidity` (湿度)

## 使用方法

### 1. 在组件中获取数据
```javascript
// 数据会自动传递给子组件
function Homepage({ deviceNumber, power, temperature, humidity, onRefreshData }) {
  // 使用设备数据
  console.log('当前设备编号:', deviceNumber);
  
  // 手动刷新数据
  const handleRefresh = () => {
    onRefreshData();
  };
}
```

### 2. 开发环境测试
开发环境会自动使用模拟数据，无需真实的云端连接：
```javascript
const mockDeviceData = {
  deviceNumber: 42,
  power: [100, 150, 120, 180, 200],
  temperature: 28.5,
  humidity: 65.2
};
```

## CORS 问题解决方案

由于浏览器的CORS限制，直接从前端调用华为云API可能会失败。提供以下解决方案：

### 1. 使用代理服务器
在 `package.json` 中添加代理配置：
```json
{
  "proxy": "http://localhost:3001"
}
```

### 2. 后端API代理
创建后端API endpoint `/api/device-data` 来代理华为云调用。

### 3. 模拟数据（开发环境）
开发环境自动使用模拟数据，无需额外配置。

## 错误处理

系统包含完善的错误处理机制：
- 网络错误自动重试
- API调用失败时切换到备选方案
- 显示详细的错误日志
- 设置默认值防止应用崩溃

## 监控和调试

在浏览器控制台中可以看到详细的日志信息：
```
开始从云端获取数据...
直接从华为云获取数据成功
成功更新设备数据: { deviceNumber: 42, power: [...], ... }
```

## 扩展功能

### 添加新的数据字段
在 `parseDeviceDataFromShadow` 函数中添加新的数据解析：
```javascript
if (reportedData.newField !== undefined) {
  deviceData.newField = reportedData.newField;
}
```

### 修改刷新频率
在 `App.js` 中修改定时器间隔：
```javascript
const interval = setInterval(() => {
  fetchDataFromCloud();
}, 2 * 60 * 1000); // 改为2分钟
```

## 注意事项

1. **安全性**：生产环境中应该将敏感配置（如密码）移到环境变量中
2. **性能**：避免过于频繁的API调用，建议间隔不少于1分钟
3. **错误处理**：确保网络错误不会影响用户体验
4. **数据验证**：对从云端获取的数据进行验证和清理
