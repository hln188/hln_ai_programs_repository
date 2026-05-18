import type { AIRecommendationResponse, RecommendRequest } from '@/types/aiRecommendation';
import { generateRecommendationPrompt } from '@/prompts/customerRecommendation';

class AIRecommendationService {
  
  /**
   * 智能推荐客户 - 主函数
   * @param request 包含客户列表和TOP N参数
   * @returns AI推荐结果
   */
  async getRecommendations(request: RecommendRequest): Promise<AIRecommendationResponse> {
    try {
      // 1. 构建推荐 Prompt
      const prompt = generateRecommendationPrompt(request.customers, request.topN || 5);
      
      // 2. 调用后端代理（BFF层）
      const response = await fetch('/api/deepseek', {
        method: 'POST',
        headers: {
          'Content-Type': 'applicantion/json'
        },
        body: JSON.stringify({
          model: 'deepseek-v4-pro',
          messages: [
            { role: 'system', content: '你是一个专业的金融CRM销售助手, 擅长客户分析和精准推荐。' },
            { role: 'user', content: prompt }
          ],
          thinking: {type: "enabled"},
          reasoning_effort: "high",
          stream: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content;
      
      if (!assistantMessage) {
        throw new Error('AI 模型返回数据格式异常');
      }
      
      // 3. 解析 AI 返回的 JSON
      return this.parseAIResponse(assistantMessage);
    } catch (error) {
      console.error('AI推荐服务出错:', error);
      return this.getFallbackRecommendation(request);
    }
  }
  
  /**
   * 解析 AI 返回的 JSON 字符串
   */
  private parseAIResponse(aiContent: string): AIRecommendationResponse {
    try {
      // 提取 JSON 内容（AI有时会输出非JSON前缀）
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('未找到有效的 JSON');
      }
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      throw new Error('解析 AI 响应失败');
    }
  }
  
  /**
   * 降级策略：当 AI 服务不可用时返回基础推荐
   */
  private getFallbackRecommendation(request: RecommendRequest): AIRecommendationResponse {
    const sortedCustomers = [...request.customers]
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, request.topN || 5);
      
    return {
      recommendedCustomerIds: sortedCustomers.map(c => c.id),
      reason: '基于活跃度评分的基础推荐(AI服务暂时不可用)',
      suggestAction: '建议优先联系最近7天有活跃行为的客户'
    };
  }
}

export const aiRecommendationService = new AIRecommendationService();