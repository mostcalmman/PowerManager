import React, {useState, useRef} from 'react';
import { Layout, Menu, notification } from 'antd';

import './App.css';
import Homepage from './components/Homepage';
import Device from './components/Device';
import Ask from './components/Ask';
import { fetchCloudDeviceData } from './Cloud/huaweiCloudService';


const { Header, Footer } = Layout;

const components = [
  {
    label: '首页',
    key: 'homepage',
  },
  {
    label: '设备',
    key: 'device',
  },
  {
    label: '分析',
    key: 'ask',
  },
];

function SelectApp(props) {
  const currentPage = props.currentPage;
  const onNavigate = props.onNavigate;
  // const onRefreshData = props.onRefreshData;
  const { pluginOnOff, pluginNumber, onlineDeviceNumber, power, temperature, humidity, deviceClass } = props;

  switch (currentPage) {
    case 'homepage':
      return <Homepage 
        onNavigate={onNavigate} 
        // onRefreshData={onRefreshData}
        pluginNumber={pluginNumber} 
        onlineDeviceNumber={onlineDeviceNumber} 
        power={power} 
        temperature={temperature} 
        humidity={humidity} 
        deviceClass={deviceClass} 
        pluginOnOff={pluginOnOff}
      />;
    case 'device':
      return <Device 
        // onRefreshData={onRefreshData} 
        pluginNumber={pluginNumber}
        onlineDeviceNumber={onlineDeviceNumber} 
        power={power} 
        temperature={temperature} 
        humidity={humidity} 
        deviceClass={deviceClass} 
        pluginOnOff={pluginOnOff}
      />;
    case 'ask':
      return <Ask 
        // onRefreshData={onRefreshData} 
        pluginNumber={pluginNumber}
        onlineDeviceNumber={onlineDeviceNumber} 
        power={power} 
        temperature={temperature} 
        humidity={humidity} 
        deviceClass={deviceClass} 
        pluginOnOff={pluginOnOff}
      />;
    default:
      return <Homepage 
        onNavigate={onNavigate} 
        // onRefreshData={onRefreshData} 
        pluginNumber={pluginNumber}
        onlineDeviceNumber={onlineDeviceNumber} 
        power={power} 
        temperature={temperature} 
        humidity={humidity} 
        deviceClass={deviceClass} 
        pluginOnOff={pluginOnOff}
      />;
  }
}



function App() {
  const [current, setCurrent] = useState('homepage');
  
  // 数据状态管理
  const [onlineDeviceNumber, setOnlineDeviceNumber] = useState(0);
  const [power, setPower] = useState([0]);
  const [temperature, setTemperature] = useState(25);
  const [humidity, setHumidity] = useState(60);
  const [deviceClass, setDeviceClass] = useState(["插孔断开"]); // 设备类型，默认插孔断开
  const [pluginNumber, setPluginNumber] = useState(1); // 插孔数量，默认1个
  const [pluginOnOff, setPluginOnOff] = useState([0]); // 插孔开关状态，默认1个, 关闭

  // 通知 API
  const [api, contextHolder] = notification.useNotification();
  
  // 使用 useRef 来存储警告状态
  const activeAlerts = useRef(new Set()); // 当前显示的警告
  const lastUserClosed = useRef(new Map()); // 用户关闭警告的时间记录
  
  // 格式化时间为月日时分秒格式
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${month}月${day}日${hours}时${minutes}分${seconds}秒`;
  };
  
  const temperatureAlert = () => {
    const alertKey = 'temperature-alert';
    
    api.warning({
      key: alertKey,
      message: `🔥 温度警告`,
      description: `设备环境温度于${formatTime(Date.now())}过高，设备侧将切断所有插孔电源！请及时检查设备！`,
      placement: 'topRight',
      duration: 0, // 永不自动消失
      style: {
        backgroundColor: '#fff2e8',
        border: '2px solid #ff7a00',
      },
      onClose: () => {
        // 记录用户关闭时间
        lastUserClosed.current.set(alertKey, Date.now());
        activeAlerts.current.delete(alertKey);
        console.log('用户关闭温度警告');
      }
    });
    
    activeAlerts.current.add(alertKey);
  };

  const powerAlert = (pluginId) => {
    const alertKey = `power-alert-${pluginId}`;
    
    api.error({
      key: alertKey,
      message: `⚡ 功率警告`,
      description: `插孔${pluginId}功率于${formatTime(Date.now())}过高，设备侧将切断该插孔电源！请及时检查设备！`,
      placement: 'topRight',
      duration: 0, // 永不自动消失
      style: {
        backgroundColor: '#fff1f0',
        border: '2px solid #ff4d4f',
      },
      onClose: () => {
        // 记录用户关闭时间
        lastUserClosed.current.set(alertKey, Date.now());
        activeAlerts.current.delete(alertKey);
        console.log(`用户关闭插孔${pluginId}功率警告`);
      }
    });
    
    activeAlerts.current.add(alertKey);
  };
  
  const checkAlerts = (newTemperature, newPower) => {
    const now = Date.now();
    
    // MARK: 温度功率阈值
    // 温度警告检查
    const tempAlertKey = 'temperature-alert';
    const shouldShowTempAlert = newTemperature > 85;
    const tempAlertExists = activeAlerts.current.has(tempAlertKey);
    const tempLastClosed = lastUserClosed.current.get(tempAlertKey) || 0;
    const tempCanReshow = now - tempLastClosed > 5000; // 5秒后可以重新显示

    if (shouldShowTempAlert && !tempAlertExists && tempCanReshow) {
      temperatureAlert();
      console.log('发送温度警告，温度:', newTemperature);
    }
    
    // // 如果温度正常，自动关闭温度警告
    // if (!shouldShowTempAlert && tempAlertExists) {
    //   api.destroy(tempAlertKey);
    //   activeAlerts.current.delete(tempAlertKey);
    //   console.log('温度恢复正常，自动关闭温度警告');
    // }
    
    // 功率警告检查
    newPower.forEach((powerValue, index) => {
      const pluginId = index + 1;
      const powerAlertKey = `power-alert-${pluginId}`;
      const shouldShowPowerAlert = powerValue > 250;
      const powerAlertExists = activeAlerts.current.has(powerAlertKey);
      const powerLastClosed = lastUserClosed.current.get(powerAlertKey) || 0;
      const powerCanReshow = now - powerLastClosed > 5000; // 5秒后可以重新显示

      if (shouldShowPowerAlert && !powerAlertExists && powerCanReshow) {
        powerAlert(pluginId);
        console.log(`发送功率警告，插孔${pluginId}，功率:`, powerValue);
      }
      
      // // 如果功率正常，自动关闭该插孔的功率警告
      // if (!shouldShowPowerAlert && powerAlertExists) {
      //   api.destroy(powerAlertKey);
      //   activeAlerts.current.delete(powerAlertKey);
      //   console.log(`功率恢复正常，自动关闭插孔${pluginId}功率警告`);
      // }
    });
  };

  // 用于防止重复调用的标记
  const hasCalledAPI = useRef(false);

  // 从云端获取数据的函数
  const fetchDataFromCloud = async () => {
    try {
      console.log('开始从华为云获取数据...');
      
      // 直接调用华为云服务
      const deviceData = await fetchCloudDeviceData();
      console.log('华为云获取数据成功');
      
      // MARK: 检查调试
      checkAlerts(deviceData.temperature, deviceData.power);
      // checkAlerts(deviceData.humidity, deviceData.power);
      
      // 更新状态
      setOnlineDeviceNumber(deviceData.onlineDeviceNumber);
      setPower(deviceData.power);
      setTemperature(deviceData.temperature);
      setHumidity(deviceData.humidity);
      setDeviceClass(deviceData.deviceClass);
      setPluginNumber(deviceData.pluginNumber);
      setPluginOnOff(deviceData.pluginOnOff);
      
      console.log('App.js - 成功更新设备数据:', {
        onlineDeviceNumber,
        power,
        temperature,
        humidity,
        deviceClass,
        pluginNumber,
        pluginOnOff
      });
    } 
    catch (error) {
      console.log('华为云调用失败，原因:', error.message || error);
      console.error('华为云调用失败详细信息:', error);
      
      // 直接使用默认值
      setOnlineDeviceNumber(0);
      setPower([0]);
      setTemperature(25);
      setHumidity(60);
      setDeviceClass(["插孔断开"]);
      setPluginNumber(1);
      setPluginOnOff([0]);

      console.log('已设置默认值');
    }
  };

  // 组件挂载时获取数据并设置定时器
  React.useEffect(() => {
    // 防止在 StrictMode 下重复调用
    if (!hasCalledAPI.current) {
      hasCalledAPI.current = true;
      fetchDataFromCloud(); // 直接调用获取数据函数
    }
    
    // 设置定时器，每隔1秒刷新一次数据
    const interval = setInterval(() => {
      fetchDataFromCloud();
    }, 1000);
    
    // 清理函数：组件卸载时清除定时器和所有通知
    return () => {
      clearInterval(interval);
      // 清除所有通知
      api.destroy();
      activeAlerts.current.clear();
    };
  }, []);

  
  const onClick = (e) => {
    console.log('click ', e);
    setCurrent(e.key);
  };

  
  const handleNavigate = (page) => {
    setCurrent(page);
  };
  
  // const handleRefreshData = () => {
  //   fetchDataFromCloud();
  // };
  
  return (
    <Layout>
      {contextHolder}
      <Header style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Menu
          theme='dark'
          mode='horizontal'
          selectedKeys={[current]}
          items={components}
          onClick={onClick}
          style={{ minWidth: 'auto', border: 'none' }}
        />
      </Header>

      <SelectApp 
        currentPage={current} 
        onNavigate={handleNavigate}
        // onRefreshData={handleRefreshData}
        onlineDeviceNumber={onlineDeviceNumber}
        power={power}
        temperature={temperature}
        humidity={humidity}
        deviceClass={deviceClass}
        pluginNumber={pluginNumber}
        pluginOnOff={pluginOnOff}
      />

      <Footer style={{ textAlign: 'center', }}>
        Power Manager©2025
      </Footer>
    </Layout>
  );
}

export default App;
