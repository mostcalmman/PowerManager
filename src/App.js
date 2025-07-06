import React, {useState, useRef} from 'react';
import { Layout, Menu } from 'antd';

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

  // 用于防止重复调用的标记
  const hasCalledAPI = useRef(false);

  // 从云端获取数据的函数
  const fetchDataFromCloud = async () => {
    try {
      console.log('开始从华为云获取数据...');
      
      // 直接调用华为云服务
      const deviceData = await fetchCloudDeviceData();
      console.log('华为云获取数据成功');
      
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
    
    // 清理函数：组件卸载时清除定时器
    return () => {
      clearInterval(interval);
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
