import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Badge, Typography, Space, Divider, Button, Switch } from 'antd';
import { ThunderboltOutlined, PoweroffOutlined, WifiOutlined, DisconnectOutlined } from '@ant-design/icons';
import './Device.css';

function Device() {
  const [deviceNumber, setDeviceNumber] = useState(0);
  const [pluginNumber, setPluginNumber] = useState(1);
  const [deviceInfo, setDeviceInfo] = useState({});

  const { Title } = Typography;

  // 模拟云端数据接口
  const fetchDeviceData = async () => {
    // TODO: 替换为真实的云端API调用
    try {
      // 模拟云端下发的JSON数据格式
      const mockData = {
        pluginNumber: 1,
        deviceNumber: 1,
        deviceInfo: {
          "1": { isOpen: 1, power: 25.5, deviceType: "智能灯泡" },
          
        }
      };
      
      setPluginNumber(mockData.pluginNumber);
      setDeviceNumber(mockData.deviceNumber);
      setDeviceInfo(mockData.deviceInfo);
    } catch (error) {
      console.error('获取设备数据失败:', error);
    }
  };

  // 处理开关按钮点击
  const handleSwitchToggle = (deviceId, isOn) => {
    console.log(`设备 ${deviceId} 切换至: ${isOn ? '开启' : '关闭'}`);
    // TODO: 调用云端API切换设备状态
  };

  // 渲染设备卡片
  const renderDeviceCard = (index) => {
    const deviceId = (index + 1).toString();
    const device = deviceInfo[deviceId];
    const isOpen = device ? device.isOpen === 1 : false;
    const power = device ? device.power : 0;
    const deviceType = device ? device.deviceType : '无设备插入';
    
    return (
      <Col span={pluginNumber === 1 ? 24 : 12} key={deviceId}>
        <div className={pluginNumber === 1 ? 'single-card-container' : ''}>
          <Card 
            className={`device-card ${isOpen ? 'online' : 'offline'} ${pluginNumber === 1 ? 'single-card' : ''}`}
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>插孔 {deviceId}</span>
                {/* <Badge 
                  status={isOnline ? 'success' : 'error'} 
                  text={isOnline ? '在线' : '离线'}
                /> */}
              </div>
            }
            extra={
              <Switch
                checked={isOpen}
                disabled={!device}
                onChange={(checked) => handleSwitchToggle(deviceId, checked)}
                checkedChildren="开"
                unCheckedChildren="关"
                style={{ marginLeft: '8px' }}
              />
            }
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isOpen ? <WifiOutlined style={{ color: '#52c41a' }} /> : <DisconnectOutlined style={{ color: '#ff4d4f' }} />}
                <span style={{ fontSize: '16px', fontWeight: 500 }}>{deviceType}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ThunderboltOutlined style={{ color: '#faad14' }} />
                <span style={{ fontSize: '16px' }}>功率: {isOpen ? power : 0}W</span>
              </div>
            </Space>
          </Card>
        </div>
      </Col>
    );
  };

  useEffect(() => {
    fetchDeviceData();
    // 可以设置定时器定期更新数据
    const interval = setInterval(fetchDeviceData, 1000); // 每1秒更新一次
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="device-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2} className='title'>
          设 备 详 细 信 息
        </Title>
        <Title level={4}
          style={{ 
            textAlign: 'center', color: '#888',
            margin: '0 0 10px 0'
           }}>
          电器信息由电源管理系统预测
        </Title>

        {/* 统计信息 */}
        <Row gutter={16}>
          <Col span={12}>
            <Card>
              <Statistic
                title="插孔数量"
                value={pluginNumber}
                prefix={<PoweroffOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="在线设备"
                value={deviceNumber}
                prefix={<WifiOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        <Divider style={{ margin: '8px 0 8px 0' }} />

        {/* 插孔卡片 */}
        <Row gutter={[16, 16]}>
          {Array.from({ length: pluginNumber }, (_, index) => renderDeviceCard(index))}
        </Row>
      </Space>
    </div>
  );
}

export default Device;