import './App.css';

import React, {useState, useRef} from 'react';

import Homepage from './components/Homepage';
import Device from './components/Device';
import Ask from './components/Ask';
import { fetchCloudDeviceData } from './Cloud/huaweiCloudService';

import { Flex, Layout, Menu } from 'antd';
const { Header, Footer, Sider, Content } = Layout;

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
  const { deviceNumber, power, temperature, humidity } = props;
  
  switch (currentPage) {
    case 'homepage':
      return <Homepage 
        onNavigate={onNavigate} 
        // onRefreshData={onRefreshData} 
        deviceNumber={deviceNumber} 
        power={power} 
        temperature={temperature} 
        humidity={humidity} 
      />;
    case 'device':
      return <Device 
        // onRefreshData={onRefreshData} 
        deviceNumber={deviceNumber} 
        power={power} 
        temperature={temperature} 
        humidity={humidity} 
      />;
    case 'ask':
      return <Ask 
        // onRefreshData={onRefreshData} 
        deviceNumber={deviceNumber} 
        power={power} 
        temperature={temperature} 
        humidity={humidity} 
      />;
    default:
      return <Homepage 
        onNavigate={onNavigate} 
        // onRefreshData={onRefreshData} 
        deviceNumber={deviceNumber} 
        power={power} 
        temperature={temperature} 
        humidity={humidity} 
      />;
  }
}



function App() {
  const [current, setCurrent] = useState('homepage');
  
  // 数据状态管理
  const [deviceNumber, setDeviceNumber] = useState(0);
  const [power, setPower] = useState([]);
  const [temperature, setTemperature] = useState(25);
  const [humidity, setHumidity] = useState(60);
  
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
      setDeviceNumber(deviceData.deviceNumber);
      setPower(deviceData.power);
      setTemperature(deviceData.temperature);
      setHumidity(deviceData.humidity);
      
      console.log('成功更新设备数据:', {
        deviceNumber: deviceData.deviceNumber,
        power: deviceData.power,
        temperature: deviceData.temperature,
        humidity: deviceData.humidity,
        testData: deviceData.testData
      });
    } 
    catch (error) {
      console.log('华为云调用失败，原因:', error.message || error);
      console.error('华为云调用失败详细信息:', error);
      
      // 直接使用默认值
      setDeviceNumber(0);
      setPower([]);
      setTemperature(25);
      setHumidity(60);
      
      console.log('已设置默认值');
    }
  };

  // 组件挂载时获取数据
  React.useEffect(() => {
    // 防止在 StrictMode 下重复调用
    if (!hasCalledAPI.current) {
      hasCalledAPI.current = true;
      fetchDataFromCloud(); // 直接调用获取数据函数
    }
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
        deviceNumber={deviceNumber}
        power={power}
        temperature={temperature}
        humidity={humidity}
      />

      <Footer style={{ textAlign: 'center', }}>
        Power Manager©2025
      </Footer>
    </Layout>
  );
}

export default App;
