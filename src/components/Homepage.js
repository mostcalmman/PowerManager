import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'antd';
import { ThunderboltOutlined, DesktopOutlined, BarChartOutlined } from '@ant-design/icons';
import './Homepage.css';

function Homepage({ onNavigate }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // 清理定时器
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleDeviceClick = () => {
    onNavigate('device');
  }

  const handleAskClick = () => {
    onNavigate('ask');
  }

  return (
    <div className="homepage-container">
      {/* 时钟模块 */}
      <div className="clock-container">
        <h1 className="welcome-title">Hi! 我是电源管理系统</h1>
        <div className="clock">
          <div className="time-display">
            {formatTime(currentTime)}
          </div>
          <div className="date-display">
            {currentTime.toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </div>
        </div>
      </div>
      
      {/* 卡片模块 */}
      <div className="cards-container">
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={8} md={8} lg={6} xl={6}>
            <Card 
              onClick={handleDeviceClick}
              className="feature-card"
              hoverable
              cover={
                <div className="card-icon-container">
                  <ThunderboltOutlined className="card-icon" />
                  <div className="card-text">
                    总功率: 100W
                  </div>
                </div>
              }
            >
              <Card.Meta 
                title="功率监控" 
                description="实时监控系统功率状态，确保设备稳定运行" 
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={8} md={8} lg={6} xl={6}>
            <Card 
              onClick={handleDeviceClick}
              className="feature-card"
              hoverable
              cover={
                <div className="card-icon-container">
                  <DesktopOutlined className="card-icon" />
                  <div className="card-text">
                    在线设备数: 1
                  </div>
                </div>
              }
            >
              <Card.Meta 
                title="设备管理" 
                description="集中管理所有连接设备，优化电源分配策略" 
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={8} md={8} lg={6} xl={6}>
            <Card
              onClick={handleAskClick}
              className="feature-card"
              hoverable
              cover={
                <div className="card-icon-container">
                  <BarChartOutlined className="card-icon" />
                  <div className="card-text">
                    温湿度: 25°C, 60%
                  </div>
                </div>
              }
            >
              <Card.Meta 
                title="数据分析" 
                description="深度分析电源使用数据，提供智能化建议" 
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default Homepage;