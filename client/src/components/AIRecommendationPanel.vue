<template>
  <div class="ai-recommendation-panel">
    <!-- 头部区域 -->
    <div class="panel-header">
      <div class="header-left">
        <el-icon><Opportunity /></el-icon>
        <h3>AI智能客户推荐</h3>
        <el-tag size="small" type="success">{{ modelStatus }}</el-tag>
      </div>
      <el-button 
        type="primary" 
        :loading="isLoading" 
        @click="handleRefresh"
        size="small"
      >
        <el-icon><Refresh /></el-icon>
        刷新推荐
      </el-button>
    </div>
    
    <!-- 推荐理由区域 -->
    <div v-if="recommendationReason" class="reason-section">
      <el-alert 
        :title="recommendationReason" 
        type="info" 
        :closable="false"
        show-icon
      />
    </div>
    
    <!-- 客户列表区域 -->
    <div class="customer-list">
      <div
        v-for="(customer, index) in recommendedCustomers"
        :key="customer.id"
        class="customer-card"
        :class="{ 'top-rank': index === 0 }"
      >
        <div class="rank-badge">{{ index + 1 }}</div>
        <div class="customer-info">
          <div class="customer-name">{{ customer.name }}</div>
          <div class="customer-detail">
            <el-tag size="small">{{ customer.industry }}</el-tag>
            <span class="asset-info">{{ assetTierText(customer.assetTier) }}</span>
            <span class="activity-score">活跃度: {{ customer.activityScore }}/10</span>
          </div>
        </div>
        <el-button 
          size="small" 
          type="primary" 
          plain
          @click="viewCustomerDetail(customer.id)"
        >
          查看详情
        </el-button>
      </div>
      
      <el-empty v-if="!isLoading && recommendedCustomers.length === 0" description="暂无推荐客户" />
    </div>
    
    <!-- 跟进话术区域 -->
    <div v-if="suggestAction" class="action-section">
      <div class="action-title">
        <el-icon><ChatDotRound /></el-icon>
        <span>建议跟进话术</span>
      </div>
      <div class="action-content">
        <p>{{ suggestAction }}</p>
        <el-button 
          size="small" 
          @click="copyToClipboard(suggestAction)"
        >
          <el-icon><CopyDocument /></el-icon>
          复制话术
        </el-button>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <el-skeleton :rows="3" animated />
      <div class="loading-text">AI 正在分析客户数据...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Opportunity, Refresh, ChatDotRound, CopyDocument } from '@element-plus/icons-vue';
import { aiRecommendationService } from '@/services/aiRecommendationService';
import { fetchRecommendationsCache } from '@/utils/aiCatche';
import type { AIRecommendationResponse, CustomerProfile } from '@/types/aiRecommendation';

// Props 定义 - 接收父组件传递的客户列表
const props = defineProps<{
  customers: CustomerProfile[];
  topN?: number;
}>();

// 响应式数据
const isLoading = ref(false);
const recommendedCustomerIds = ref<string[]>([]);
const recommendationReason = ref('');
const suggestAction = ref('');
const modelStatus = ref('在线');

// 计算属性 - 基于推荐ID获取客户完整信息
const recommendedCustomers = computed(() => {
  const customerMap = new Map(props.customers.map(c => [c.id, c]));
  return recommendedCustomerIds.value
    .map(id => customerMap.get(id))
    .filter((c): c is CustomerProfile => c !== undefined);
});

// 资产等级转换
const assetTierText = (tier: string) => {
  const map: Record<string, string> = {
    high: '高净值客户',
    medium: '中产客户',
    low: '基础客户'
  };
  return map[tier] || tier;
};

// 获取AI推荐
const fetchRecommendations = async () => {
  if (!props.customers || props.customers.length === 0) {
    ElMessage.warning('暂无客户数据');
    return;
  }
  
  isLoading.value = true;
  try {
    const result = await fetchRecommendationsCache(props.customers, props.topN || 5);
    
    recommendedCustomerIds.value = result.recommendedCustomerIds;
    recommendationReason.value = result.reason;
    suggestAction.value = result.suggestAction;
    
    ElMessage.success('AI 推荐已更新');
  } catch (error) {
    console.error('获取推荐失败:', error);
    ElMessage.error('获取推荐失败，请稍后重试');
  } finally {
    isLoading.value = false;
  }
};

// 刷新推荐
const handleRefresh = () => {
  fetchRecommendations();
};

// 查看客户详情
const viewCustomerDetail = (customerId: string) => {
  // TODO 跳转到客户详情页
  // window.location.href = `/customer/detail/${customerId}`;
};

// 复制话术到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success('话术已复制');
  } catch {
    ElMessage.error('复制失败');
  }
};

// 组件挂载时获取推荐
onMounted(() => {
  console.log('组件挂载了')
  fetchRecommendations();
});
</script>

<style lang="scss" scoped>
.ai-recommendation-panel {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #eee;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
  
  .reason-section {
    margin-bottom: 20px;
  }
  
  .customer-list {
    max-height: 400px;
    overflow-y: auto;
    
    .customer-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      margin-bottom: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      transition: all 0.2s;
      
      &.top-rank {
        background: linear-gradient(135deg, #fff8e7 0%, #fff 100%);
        border-left: 3px solid #ffd700;
      }
      
      .rank-badge {
        width: 28px;
        height: 28px;
        background: #e9ecef;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: #495057;
      }
      
      .customer-info {
        flex: 1;
        margin-left: 12px;
        
        .customer-name {
          font-weight: 600;
          margin-bottom: 6px;
        }
        
        .customer-detail {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: #6c757d;
        }
      }
    }
  }
  
  .action-section {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #eee;
    
    .action-title {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 12px;
      font-weight: 600;
    }
    
    .action-content {
      background: #f0f7ff;
      padding: 12px 16px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      p {
        margin: 0;
        flex: 1;
        font-size: 14px;
        line-height: 1.5;
      }
    }
  }
  
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    
    .loading-text {
      margin-top: 16px;
      color: #409eff;
      font-size: 14px;
    }
  }
}
</style>