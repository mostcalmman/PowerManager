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
    label: '提问',
    key: 'ask',
  },
];

function SelectApp(props) {
  const currentPage = props.currentPage;
  switch (currentPage) {
    case 'homepage':
      return <Homepage />;
    case 'device':
      return <Device />;
    case 'ask':
      return <Ask />;
    default:
      return <Homepage />;
  }
}



function App() {
  const [current, setCurrent] = useState('homepage');
  const onClick = (e) => {
    console.log('click ', e);
    setCurrent(e.key);
  };
  return (
    <Layout>
      <Header style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Menu
          theme='dark'
          mode='horizontal'
          defaultSelectedKeys={['homepage']}
          items={components}
          onClick={onClick}
          style={{ minWidth: 'auto', border: 'none' }}
        />
      </Header>

      <SelectApp currentPage={current} />

      <Footer style={{ textAlign: 'center' }}>
        Power Manager©2025
      </Footer>
    </Layout>
  );
}

export default App;
