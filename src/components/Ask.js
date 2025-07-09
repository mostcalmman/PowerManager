import React from 'react';
import { Table, Card, Tag, Typography, Space, Tooltip } from 'antd';
import { 
  FireOutlined, 
  ThunderboltOutlined, 
  WarningOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons';
import './Ask.css';

const { Title } = Typography;

function Ask({ historyDataQueue }) {
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

  return (
    <div className="ask-container">
      <Card className="ask-card">
        <Title level={2} className="ask-title">
          <WarningOutlined style={{ marginRight: '8px' }} />
          设备历史数据分析
        </Title>
        
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
            pageSizeOptions: ['10', '20', '30'],
          }}
          scroll={{ 
            x: 1200,
            y: 'calc(100vh - 300px)'
          }}
          size="middle"
          bordered
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}>
                  <strong>统计信息</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <strong>{dataSource.length > 0 ? `${dataSource.length}条记录` : '暂无数据'}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} colSpan={6}>
                  {dataSource.length > 0 && (
                    <Space>
                      <span>平均总功率: {Math.round(dataSource.reduce((sum, item) => sum + item.totalPower, 0) / dataSource.length)}W</span>
                      <span>平均温度: {Math.round(dataSource.reduce((sum, item) => sum + item.temperature, 0) / dataSource.length)}°C</span>
                      <span>报警次数: {dataSource.reduce((sum, item) => sum + (item.alerts ? item.alerts.length : 0), 0)}</span>
                    </Space>
                  )}
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </div>
  );
}

export default Ask;