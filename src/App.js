import './App.css';

import React, {useState} from 'react';

import Homepage from './components/Homepage';
import Device from './components/Device';
import Ask from './components/Ask';

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
  
  switch (currentPage) {
    case 'homepage':
      return <Homepage onNavigate={onNavigate} />;
    case 'device':
      return <Device />;
    case 'ask':
      return <Ask />;
    default:
      return <Homepage onNavigate={onNavigate} />;
  }
}



function App() {
  const [current, setCurrent] = useState('homepage');
  
  const onClick = (e) => {
    console.log('click ', e);
    setCurrent(e.key);
  };
  
  const handleNavigate = (page) => {
    setCurrent(page);
  };
  
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

      <SelectApp currentPage={current} onNavigate={handleNavigate} />

      <Footer style={{ 
          textAlign: 'center',
          // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
        Power Manager©2025
      </Footer>
    </Layout>
  );
}

export default App;
