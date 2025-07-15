// AI API配置文件
// 专门为DeepSeek优化

export const AI_CONFIG = {
  // DeepSeek配置
  deepseek: {
    apiKey: 'sk-c5fab6aa617a45b9b2ebe8c908aaadc0', // DeepSeek API密钥
    apiUrl: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 1500
  },
  
  // 系统提示词模板
  systemPromptTemplate: 
    `
    你是一个专业的电源管理系统智能助手。你正在与电源管理系统的用户对话，系统处于环境{deviceEnv}下，请在回答时注意。
    
    你需要基于以下设备数据为用户提供专业的分析和建议：

    {deviceContext}

    请注意：
    1. 当温度超过65°C时，提醒用户注意散热问题
    2. 当功率超过250W时，提醒用户检查设备负载
    3. 综合考虑系统历史状态与当前状态，提供具体、实用的建议
    4. 保持专业但友好的语调
    5. 如果数据异常，要及时指出并给出解决方案
    6. 你的内容展示不会经过markdown渲染，因此请直接输出普通文本，不要使用任何markdown语法。

    请简洁明了地回答用户问题。
    `
};

// AI API调用类
export class AIService {
  constructor(config = AI_CONFIG) {
    this.config = config;
  }
  
  // 生成设备上下文信息
  generateDeviceContext(deviceData) {
    const { temperature, humidity, power, onlineDeviceNumber, pluginNumber, historyDataQueue } = deviceData;
    
    const currentTime = new Date().toLocaleString('zh-CN');
    const totalPower = power ? power.reduce((sum, p) => sum + p, 0) : 0;
    
    let context = `
当前时间: ${currentTime}
设备状态:
- 插孔数量: ${pluginNumber}个
- 在线设备: ${onlineDeviceNumber}台
- 各插孔功率: ${power ? power.map((p, i) => `插孔${i+1}: ${p}W`).join(', ') : '暂无数据'}
- 总功率: ${totalPower}W
- 环境温度: ${temperature}°C
- 环境湿度: ${humidity}%`;

    // 添加历史数据分析
    if (historyDataQueue && historyDataQueue.length > 0) {
      const recentData = historyDataQueue.slice(-10);
      const avgTemp = Math.round(recentData.reduce((sum, item) => sum + item.temperature, 0) / recentData.length);
      const avgTotalPower = Math.round(recentData.reduce((sum, item) => sum + item.totalPower, 0) / recentData.length);
      const alertCount = recentData.reduce((sum, item) => sum + (item.alerts ? item.alerts.length : 0), 0);
      
      context += `

历史数据分析(最近10条):
- 平均温度: ${avgTemp}°C
- 平均总功率: ${avgTotalPower}W
- 报警次数: ${alertCount}次
- 时间范围: ${recentData[0]?.formattedTime} 到 ${recentData[recentData.length-1]?.formattedTime}`;
    }
    
    return context;
  }
  
  // 调用 DeepSeek
  async callAI(userMessage, deviceData) {
    const deviceContext = this.generateDeviceContext(deviceData);
    const systemPrompt = this.config.systemPromptTemplate.replace('{deviceContext}', deviceContext);
    
    return await this.callDeepSeek(userMessage, systemPrompt);
  }
  
  // DeepSeek API调用
  async callDeepSeek(userMessage, systemPrompt) {
    const { apiKey, apiUrl, model, temperature, maxTokens } = this.config.deepseek;
    
    if (!apiKey) {
      throw new Error('DeepSeek API密钥未配置，请在aiService.js中填入您的API密钥');
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature,
        max_tokens: maxTokens
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API调用失败: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
}

export default AIService;
