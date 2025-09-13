// nodes.js
// 旅游路线规划A2A主从Agent节点
import fetch from 'node-fetch';
import { callLLM } from './utils.js';

// 子Agent1: 查询景点、餐饮、打卡点
export async function MapFoodAgentNode(destination, dateRange) {
  // 这里可用真实API或skingflow.js搜索，这里用LLM模拟
  const prompt = `你是一个旅游助手，请为${destination}在${dateRange}期间，列出最值得游览的名胜古迹、特色餐饮和网红打卡点，要求分类清晰、简洁明了。`;
  return await callLLM(prompt);
}

// 子Agent2: 查询天气和机票
export async function WeatherTicketAgentNode(destination, dateRange, fromCity = '北京') {
  // 这里可用真实API或skingflow.js搜索，这里用LLM模拟
  const prompt = `请查询${fromCity}到${destination}在${dateRange}期间的天气预报和机票信息，要求简明扼要。`;
  return await callLLM(prompt);
}

// 主Agent: 负责分配任务并聚合结果
export async function MainAgentNode({ destination, dateRange, fromCity = '北京', mapFoodAgentUrl, weatherTicketAgentUrl }) {
  // 1. 调用子Agent1（本地或远程）
  let mapFoodResult;
  if (mapFoodAgentUrl) {
    // 远程HTTP调用
    const resp = await fetch(mapFoodAgentUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination, dateRange })
    });
    mapFoodResult = (await resp.json()).result;
  } else {
    // 本地调用
    mapFoodResult = await MapFoodAgentNode(destination, dateRange);
  }

  // 2. 调用子Agent2（本地或远程）
  let weatherTicketResult;
  if (weatherTicketAgentUrl) {
    const resp = await fetch(weatherTicketAgentUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination, dateRange, fromCity })
    });
    weatherTicketResult = (await resp.json()).result;
  } else {
    weatherTicketResult = await WeatherTicketAgentNode(destination, dateRange, fromCity);
  }

  // 3. 聚合所有信息，生成完整旅游路线规划
  const finalPrompt = `请根据以下信息，帮我为${destination}在${dateRange}期间，制定一份合理的旅游路线规划，要求包含每日行程建议，并合理结合景点、美食、天气和交通：\n\n【景点餐饮】\n${mapFoodResult}\n\n【天气机票】\n${weatherTicketResult}`;
  const plan = await callLLM(finalPrompt);
  return {
    mapFood: mapFoodResult,
    weatherTicket: weatherTicketResult,
    plan
  };
}
