import type { CustomerProfile } from '@/types/aiRecommendation'

export const generateRecommendationPrompt = (customerData: CustomerProfile[], topN = 5) => {
  return `
    你是一名资深的金融 CRM 系统销售策略顾问。以下是 ${customerData.length} 个潜在客户的综合摘要信息：

    ${customerData.map((c, idx) => `【客户 ${idx + 1}】
    - 客户ID: ${c.id}
    - 行业: ${c.industry}
    - 近期活跃行为: ${c.recentBehavior}
    - 资产规模: ${c.assetTier}
    - 已持有产品: ${c.products}
    - 活跃度评分: ${c.activityScore}/10`).join('\n')}

    请根据以下销售推荐规则，从以上客户中筛选出 TOP ${topN} 位值得优先跟进的客户：

    1. **高意向优先级**：近期频繁登录、查看产品详情页、咨询客服的客户优先
    2. **资产匹配度**：资产规模较高且持有产品较少的客户，代表有潜在购买力但尚未充分开发
    3. **行业权重**：金融科技、高端制造业等行业客户给予更高优先级
    4. **合规要求**：严格忽略姓名、手机号等个人隐私信息，仅基于业务特征评分

    请按 JSON 格式输出，包含以下字段：
    - recommendedCustomerIds: 推荐的客户 ID 数组（按优先级从高到低排序）
    - reason: 推荐理由（50字以内）
    - suggestAction: 推荐跟进话术（60字以内）

    只输出 JSON，不要有其他内容。`;
};