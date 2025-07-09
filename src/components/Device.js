import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Badge, Typography, Space, Divider, Switch, Button, message } from 'antd';
import { ThunderboltOutlined, PoweroffOutlined, WifiOutlined, DisconnectOutlined } from '@ant-design/icons';
import { sendDeviceMessage } from '../Cloud/huaweiCloudService';
import './Device.css';

const { Title } = Typography;

// 插孔数决定显示的卡片数量
// 卡片右上角的开关决定插孔通断
// 情况1, 插孔断开, 设备类型显示插孔断开, 功率显示0, 卡片为灰色
// 情况2, 插孔开启, 数据中功率为0, 设备类型显示无设备插入或设备未工作, 卡片为黄色
// 情况3, 插孔开启, 数据中功率非0, 设备类型显示数据中的对应类型, 卡片为绿色

function Device({ onlineDeviceNumber, power, temperature, humidity, deviceClass, pluginNumber, pluginOnOff }) {
  // 消息组件
  const [messageApi, contextHolder] = message.useMessage();
  const key = 'sending';

  const sending = () => {
    messageApi.open({
      key,
      type: 'loading',
      content: '正在发送命令...',
    });
  };

  const success = () => {
    messageApi.open({
      key,
      type: 'success',
      content: '命令已发送！',
    });
  };

  const error = () => {
    messageApi.open({
      key,
      type: 'error',
      content: '命令发送失败，请稍后再试！',
    });
  };

  // 处理开关按钮点击
  const handleToggleClick = async (deviceId, currentState) => {
    const newState = !currentState;
    console.log(`插孔 ${deviceId} 切换至: ${newState ? '开启' : '关闭'}`);

    // 显示发送中的消息
    sending();

    // 直接调用云端API切换插孔状态
    try {
      await sendDeviceMessage(deviceId, newState ? 1 : 0);
      console.log(`插孔 ${deviceId} 状态切换命令发送成功`);
      success();
    } catch (error) {
      console.error(`插孔 ${deviceId} 状态切换命令发送失败:`, error);
      error();
    }
  };

  // 渲染设备卡片
  const renderDeviceCard = (index) => {
    const pluginIndex = index; // 数组索引，从0开始
    const deviceId = index + 1; // 插孔编号，从1开始显示
    
    // 非空检查和默认值处理
    const isOpen = pluginOnOff && pluginOnOff[pluginIndex] !== undefined ? pluginOnOff[pluginIndex] : false;
    const devicePower = power && power[pluginIndex] ? power[pluginIndex] : 0;
    const deviceType = deviceClass && deviceClass[pluginIndex] ? deviceClass[pluginIndex] : null;
    
    // 根据云端数据确定卡片颜色和设备类型显示
    let cardColor, displayDeviceType;
    
    if (!isOpen) {
      // 情况1: 插孔断开, 设备类型显示插孔断开, 功率显示0, 卡片为灰色
      cardColor = 'gray';
      displayDeviceType = "插孔断开";
    } else if (devicePower > 0 && deviceType) {
      // 情况3: 插孔开启, 数据中功率非0, 设备类型显示数据中的对应类型, 卡片为绿色
      cardColor = 'green';
      // TODO: 把英文的deviceType转换为中文
      // displayDeviceType = deviceType;
      switch (deviceType) {
        case "Air Conditioner":
          displayDeviceType = "空调";
          break;
        case "TV":
          displayDeviceType = "电视";
          break;
        case "Predicting":
          displayDeviceType = "预测中...";
          break;
        case "Refrigerator":
          displayDeviceType = "冰箱";
          break;
        case "Unknown":
          displayDeviceType = "未知设备";
          break;
        case "Hair Dryer":
          displayDeviceType = "吹风机";
          break;
        case "Charger":
          displayDeviceType = "充电器";
          break;
        case "(Idle/Off)":
          displayDeviceType = "待机";
          break;
        case "Kettle":
          displayDeviceType = "电热水壶";
          break;
        case "Microwave":
          displayDeviceType = "微波炉";
          break;
        case "Heater":
          displayDeviceType = "电暖气";
          break;
        case "Computer":
          displayDeviceType = "电脑";
          break;
        case "Fan":
          displayDeviceType = "风扇";
          break;
        case "LED Light":
          displayDeviceType = "LED灯";
          break;
        case "Error":
          displayDeviceType = "位置设备";
          break;
        default:
          displayDeviceType = deviceType; // 保持原样
      }
    } else {
      // 情况2: 插孔开启, 但是数据中功率为0, 设备类型显示无设备工作, 卡片为黄色
      cardColor = 'yellow';
      displayDeviceType = "无设备工作";
    }
    
    // 获取卡片样式类名
    const getCardClassName = () => {
      const baseClass = `device-card ${pluginNumber === 1 ? 'single-card' : ''}`;
      switch (cardColor) {
        case 'gray':
          return `${baseClass} card-gray`;
        case 'yellow':
          return `${baseClass} card-yellow`;
        case 'green':
          return `${baseClass} card-green`;
        default:
          return baseClass;
      }
    };
    
    // 获取图标样式类名
    const getIconClassName = () => {
      switch (cardColor) {
        case 'gray':
          return 'device-icon-gray';
        case 'yellow':
          return 'device-icon-yellow';
        case 'green':
          return 'device-icon-green';
        default:
          return 'device-icon-gray';
      }
    };
    
    // 获取文字样式类名
    const getTextClassName = () => {
      switch (cardColor) {
        case 'gray':
          return 'device-text-gray';
        case 'yellow':
          return 'device-text-yellow';
        case 'green':
          return 'device-text-green';
        default:
          return 'device-text-gray';
      }
    };
    
    // 获取图标组件
    const getIcon = () => {
      const className = getIconClassName();
      switch (cardColor) {
        case 'gray':
          return <DisconnectOutlined className={className} />;
        case 'yellow':
          return <PoweroffOutlined className={className} />;
        case 'green':
          return <WifiOutlined className={className} />;
        default:
          return <PoweroffOutlined className={className} />;
      }
    };
    
    return (
      <Col span={pluginNumber === 1 ? 24 : pluginNumber === 2 ? 12 : 8} key={deviceId}>
        <div className={pluginNumber === 1 ? 'single-card-container' : ''}>
          <Card 
            className={getCardClassName()}
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>插孔 {deviceId}</span>
                <Badge 
                  status={cardColor === 'green' ? 'success' : cardColor === 'yellow' ? 'warning' : 'error'} 
                  text={isOpen ? '开启' : '关闭'}
                />
              </div>
            }
            extra={
              <Button
                onClick={() => handleToggleClick(deviceId, isOpen)}
                shape="circle"
                size="middle"
                icon={<PoweroffOutlined />}  
                className='button'
                style={{ 
                  color: isOpen ? '#ff4d4f' : '#52c41a',
                  border: `1px solid ${isOpen ? '#ff4d4f' : '#52c41a'}`,
                  backgroundColor: isOpen ? '#fff2f0' : '#f6ffed',
                }}
                hoverable
                title={isOpen ? '关闭插孔' : '开启插孔'}
              />
            }
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getIcon()}
                <span className={`device-type-text ${getTextClassName()}`}>
                  {displayDeviceType}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ThunderboltOutlined className="device-power-icon" />
                <span className="device-power-text">功率: {isOpen ? devicePower : 0}W</span>
              </div>
            </Space>
          </Card>
        </div>
      </Col>
    );
  };

  // 使用 useEffect 来监听 props 变化
  useEffect(() => {
    console.log('Device组件收到新数据:', {
      pluginNumber,
      power,
      deviceClass,
      temperature,
      humidity,
      pluginOnOff
    });
  }, [pluginNumber, power, deviceClass, temperature, humidity, pluginOnOff]);

  return (
    <div className="device-container">
      {contextHolder}
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
                value={onlineDeviceNumber}
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