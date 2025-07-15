import React, { useState, useRef, useEffect } from 'react';
import { Table, Card, Tag, Typography, Space, Tooltip, Input, Button, message, Spin, Row, Col, Divider, Image } from 'antd';
import { 
  FireOutlined, 
  ThunderboltOutlined, 
  WarningOutlined,
  CheckCircleOutlined,
  SendOutlined,
  UserOutlined,
  ClearOutlined
} from '@ant-design/icons';
import AIService from '../services/aiService';
import './Ask.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

function Ask({ historyDataQueue, power, temperature, humidity, onlineDeviceNumber, pluginNumber }) {
  // AI对话相关状态
  const [chatHistory, setChatHistory] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);
  
  // 初始化AI服务
  const aiService = useRef(new AIService());

  // 处理数据，最新的在最上面
  const dataSource = historyDataQueue ? [...historyDataQueue].reverse().map((item, index) => ({
    key: index,
    ...item,
    id: historyDataQueue.length - index // 用于排序，最新的ID最大
  })) : [];

  // 渲染报警信息
  const renderAlerts = (alerts) => {
    if (!alerts || alerts.length === 0) {
      return <Tag color="green" icon={<CheckCircleOutlined />}>无报警</Tag>;
    }

    return (
      <Space direction="vertical" size="small">
        {alerts.map((alert, index) => (
          <Tag 
            key={index}
            color={alert.type === 'temperature' ? 'orange' : 'red'}
            icon={alert.type === 'temperature' ? <FireOutlined /> : <ThunderboltOutlined />}
          >
            {alert.message}
          </Tag>
        ))}
      </Space>
    );
  };

  // 渲染设备功率
  const renderDevicePowers = (powers) => {
    if (!powers || powers.length === 0) return '-';
    
    return (
      <Space wrap>
        {powers.map((power, index) => (
          <Tag 
            key={index}
            color={power > 250 ? 'red' : power > 150 ? 'orange' : 'blue'}
          >
            插孔{index + 1}: {power}W
          </Tag>
        ))}
      </Space>
    );
  };

  // 表格列定义
  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      align: 'center',
      fixed: 'left',
    },
    {
      title: '时间',
      dataIndex: 'formattedTime',
      key: 'formattedTime',
      width: 180,
      fixed: 'left',
      sorter: (a, b) => a.timestamp - b.timestamp,
      defaultSortOrder: 'descend',
    },
    {
      title: '插孔数',
      dataIndex: 'pluginNumber',
      key: 'pluginNumber',
      width: 80,
      align: 'center',
    },
    {
      title: '在线设备',
      dataIndex: 'onlineDeviceNumber',
      key: 'onlineDeviceNumber',
      width: 100,
      align: 'center',
      render: (value) => (
        <Tag color={value > 0 ? 'green' : 'default'}>
          {value}台
        </Tag>
      ),
    },
    {
      title: '设备功率',
      dataIndex: 'devicePowers',
      key: 'devicePowers',
      width: 200,
      render: renderDevicePowers,
    },
    {
      title: '总功率',
      dataIndex: 'totalPower',
      key: 'totalPower',
      width: 100,
      align: 'center',
      render: (value) => (
        <Tag color={value > 500 ? 'red' : value > 300 ? 'orange' : 'blue'}>
          {value}W
        </Tag>
      ),
      sorter: (a, b) => a.totalPower - b.totalPower,
    },
    {
      title: '温度',
      dataIndex: 'temperature',
      key: 'temperature',
      width: 100,
      align: 'center',
      render: (value) => (
        <Tag color={value > 50 ? 'red' : value > 40 ? 'orange' : 'blue'}>
          {value}°C
        </Tag>
      ),
      sorter: (a, b) => a.temperature - b.temperature,
    },
    {
      title: '湿度',
      dataIndex: 'humidity',
      key: 'humidity',
      width: 100,
      align: 'center',
      render: (value) => (
        <Tag color="cyan">
          {value}%
        </Tag>
      ),
      sorter: (a, b) => a.humidity - b.humidity,
    },
    {
      title: '报警信息',
      dataIndex: 'alerts',
      key: 'alerts',
      width: 250,
      render: renderAlerts,
      filters: [
        { text: '无报警', value: 'none' },
        { text: '温度报警', value: 'temperature' },
        { text: '功率报警', value: 'power' },
      ],
      onFilter: (value, record) => {
        if (value === 'none') {
          return !record.alerts || record.alerts.length === 0;
        }
        return record.alerts && record.alerts.some(alert => alert.type === value);
      },
    },
  ];

  // 自动滚动到聊天底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim()) {
      message.warning('请输入消息内容');
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // 添加用户消息
    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date().toLocaleTimeString('zh-CN')
    };

    setChatHistory(prev => [...prev, newUserMessage]);

    try {
      // 准备设备数据
      const deviceData = {
        temperature,
        humidity,
        power,
        onlineDeviceNumber,
        pluginNumber,
        historyDataQueue
      };
      
      // 调用AI服务
      const aiResponse = await aiService.current.callAI(userMessage, deviceData);
      
      // 添加AI回复
      const newAIMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString('zh-CN')
      };

      setChatHistory(prev => [...prev, newAIMessage]);
    } catch (error) {
      console.error('AI服务错误:', error);
      message.error('AI回复失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 清空聊天记录
  const handleClearChat = () => {
    setChatHistory([]);
    message.success('聊天记录已清空');
  };

  // 快速提问按钮
  const quickQuestions = [
    '分析当前设备状态',
    '功率使用是否正常？',
    '温度情况如何？',
    '给出优化建议',
    '检查是否有异常'
  ];

  const handleQuickQuestion = (question) => {
    setInputValue(question);
  };

  return (
    <div className="ask-container">
      <Row gutter={[16, 16]}>
        {/* 数据表格区域 */}
        <Col xs={24} lg={12}>
          <Card className="ask-card">
            <Title level={3} className="ask-title">
              <WarningOutlined style={{ marginRight: '8px' }} />
              历史数据分析
            </Title>
            
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                // showQuickJumper: true,
                showTotal: (total, range) => 
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
                // pageSizeOptions: ['8', '16', '24'],
              }}
              scroll={{ 
                x: 800,
                y: false
              }}
              size="small"
              bordered
            />
          </Card>
        </Col>

        {/* AI对话区域 */}
        <Col xs={24} lg={12}>
          <Card className="chat-card" title={
            <Space>
              <Image 
                src="./DS_LOGO.jpg" 
                alt="DeepSeek Logo" 
                width={24} 
                height={24} 
                preview={false}
                style={{ borderRadius: '4px' }}
              />
              <span>基于Deepseek的智能电源管理助手</span>
              <Button 
                size="small" 
                icon={<ClearOutlined />} 
                onClick={handleClearChat}
                type="text"
              >
                清空
              </Button>
            </Space>
          }>
            {/* 聊天历史 */}
            <div 
              ref={chatContainerRef}
              style={{ 
                height: '400px', 
                overflowY: 'auto', 
                padding: '8px',
                backgroundColor: '#fafafa',
                borderRadius: '6px',
                marginBottom: '12px'
              }}
            >
              {chatHistory.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', marginTop: '50px' }}>
                  <Image 
                    src="./DS_LOGO.jpg" 
                    alt="DeepSeek Logo" 
                    width={40} 
                    height={40} 
                    preview={false}
                    style={{ borderRadius: '6px', marginBottom: '8px' }}
                  />
                  <div>我是电源管理智能助手，可以帮您分析设备数据</div>
                </div>
              ) : (
                chatHistory.map(msg => (
                  <div key={msg.id} style={{ marginBottom: '12px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      flexDirection: msg.type === 'user' ? 'row-reverse' : 'row'
                    }}>
                      <div style={{ margin: '0 8px' }}>
                        {msg.type === 'user' ? (
                          <UserOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                        ) : (
                          <Image 
                            src="./DS_LOGO.jpg" 
                            alt="DeepSeek Logo" 
                            width={16} 
                            height={16} 
                            preview={false}
                            style={{ borderRadius: '2px' }}
                          />
                        )}
                      </div>
                      <div style={{
                        background: msg.type === 'user' ? '#e6f7ff' : '#fff',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        maxWidth: '80%',
                        border: '1px solid #d9d9d9'
                      }}>
                        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {msg.content}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#999', 
                          marginTop: '4px',
                          textAlign: msg.type === 'user' ? 'right' : 'left'
                        }}>
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {isLoading && (
                <div style={{ textAlign: 'center', padding: '12px' }}>
                  <Spin size="small" />
                  <span style={{ marginLeft: '8px', color: '#999' }}>AI正在思考中...</span>
                </div>
              )}
            </div>

            {/* 快速提问按钮 */}
            <div style={{ marginBottom: '12px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>快速提问：</Text>
              <div style={{ marginTop: '4px' }}>
                <Space wrap>
                  {quickQuestions.map((question, index) => (
                    <Button 
                      key={index}
                      size="small" 
                      type="dashed"
                      onClick={() => handleQuickQuestion(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </Space>
              </div>
            </div>

            {/* 输入区域 */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="请输入您的问题，我会基于当前设备数据为您分析..."
                autoSize={{ minRows: 2, maxRows: 4 }}
                onPressEnter={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                type="primary" 
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                loading={isLoading}
                style={{ alignSelf: 'flex-end' }}
              >
                发送
              </Button>
            </div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              提示：按 Ctrl+Enter 快速发送
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Ask;