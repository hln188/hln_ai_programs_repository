<template>
  <div class="customer-management">
    <!-- 筛选条件栏 -->
    <div class="filter-section">
      <div class="section-item">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索客户名称"
          clearable
          style="width: 220px"
        />
        <el-select
          v-model="selectedIndustry"
          placeholder="行业筛选"
          clearable
          style="width: 220px"
        >
          <el-option label="金融科技" value="fintech" />
          <el-option label="制造业" value="manufacturing" />
          <el-option label="互联网" value="internet" />
          <el-option label="医疗健康" value="healthcare" />
        </el-select>
      </div>
      <div class="section-item">
        <el-button type="primary" @click="loadCustomers">
          查询
        </el-button>
        <el-button @click="resetFilter">
          重置
        </el-button>
      </div>
    </div>

    <!-- AI 智能推荐面板 -->
    <AIRecommendationPanel
      :customers="processedCustomers"
      :top-n="5"
    />

    <!-- 普通客户列表（示例占位，可按需扩展） -->
    <div class="customer-list-section">
      <div class="section-header">
        <h3>全部客户</h3>
        <span class="total-count">共 {{ customerList.length }} 条</span>
      </div>
      <el-table :data="customerList" stripe style="width: 100%">
        <el-table-column prop="name" label="客户名称" min-width="150" />
        <el-table-column prop="industry" label="行业" width="120" />
        <el-table-column prop="assetTier" label="资产等级" width="100">
          <template #default="{ row }">
            <el-tag :type="assetTagType(row.assetTier)" size="small">
              {{ assetTierText(row.assetTier) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="activityScore" label="活跃度评分" width="100">
          <template #default="{ row }">
            <el-progress
              :percentage="row.activityScore * 10"
              :stroke-width="8"
              :show-text="false"
              style="width: 80px"
            />
            <span style="margin-left: 8px">{{ row.activityScore }}/10</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row.id)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import AIRecommendationPanel from '@/components/AIRecommendationPanel.vue';
import type { CustomerProfile } from '@/types/aiRecommendation';

// 响应式数据
const searchKeyword = ref('');
const selectedIndustry = ref('');
const customerList = ref<CustomerProfile[]>([]);

// 资产等级标签类型映射
const assetTagType = (tier: string) => {
  const map: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  };
  return map[tier] || '';
};

// 资产等级文本映射
const assetTierText = (tier: string) => {
  const map: Record<string, string> = {
    high: '高净值',
    medium: '中产',
    low: '基础'
  };
  return map[tier] || tier;
};

// 处理后的客户数据（脱敏后传给 AI 组件）
const processedCustomers = computed(() => {
  return customerList.value.map(c => ({
    id: c.id,
    name: c.name,
    industry: c.industry,
    recentBehavior: c.recentBehavior,
    assetTier: c.assetTier,
    products: c.products,
    activityScore: c.activityScore
  }));
});

// 模拟加载客户数据（实际应调用 API）
const loadCustomers = async () => {
  // TODO: 替换为真实后端接口
  // 模拟数据
  const mockData: CustomerProfile[] = [
    {
      id: '1',
      name: '云创科技',
      industry: '金融科技',
      recentBehavior: '近7天查看“企业理财”产品3次, 咨询客服1次',
      assetTier: 'high',
      products: ['企业存款', '现金管理'],
      activityScore: 9.2
    },
    {
      id: '2',
      name: '智造集团',
      industry: '制造业',
      recentBehavior: '近30天无登录行为',
      assetTier: 'medium',
      products: ['流动资金贷款'],
      activityScore: 2.5
    },
    {
      id: '3',
      name: '健宁医药',
      industry: '医疗健康',
      recentBehavior: '近7天浏览“供应链金融”方案2次',
      assetTier: 'high',
      products: [],
      activityScore: 7.8
    }
  ];
  
  // 模拟筛选（实际应交给后端）
  let filtered = mockData;
  if (searchKeyword.value) {
    filtered = filtered.filter(c => c.name.includes(searchKeyword.value));
  }
  if (selectedIndustry.value) {
    filtered = filtered.filter(c => c.industry === selectedIndustry.value);
  }
  customerList.value = filtered;
  ElMessage.success('客户列表已更新');
};

// 重置筛选条件
const resetFilter = () => {
  searchKeyword.value = '';
  selectedIndustry.value = '';
  loadCustomers();
};

// 查看客户详情
const viewDetail = (id: string) => {
  // TODO 跳转到详情页
};

// 初始化加载
onMounted(() => {
  loadCustomers();
});
</script>

<style lang="scss" scoped>
.customer-management {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;

  // 筛选条件栏
  .filter-section {
    display: flex;
    flex-direction: column;
    gap: 1em;
    margin-bottom: 24px;
    padding: 16px 20px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    .section-item {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1em;
    }
  }

  // AI 推荐面板自带外边距，不再额外添加

  // 普通客户列表区域
  .customer-list-section {
    margin-top: 24px;
    background: #ffffff;
    border-radius: 12px;
    padding: 0 20px 20px 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0 12px 0;
      border-bottom: 1px solid #ebeef5;
      margin-bottom: 16px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1f2d3d;
      }

      .total-count {
        font-size: 13px;
        color: #909399;
      }
    }

    // 表格样式微调
    :deep(.el-table) {
      border-radius: 8px;
      overflow: hidden;

      th.el-table__cell {
        background-color: #fafbfc;
        color: #4e5a6e;
        font-weight: 500;
      }
    }
  }

  // 响应式调整
  @media (max-width: 768px) {
    padding: 12px;

    .filter-section {
      padding: 12px;
      gap: 8px;
    }

    .customer-list-section {
      padding: 0 12px 12px 12px;
    }
  }
}
</style>