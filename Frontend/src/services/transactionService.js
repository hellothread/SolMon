import api from '../api/axios';

// 交易类型枚举
export const TransactionType = {
  BUY: 'buy',
  SELL: 'sell'
};

export const transactionService = {
  // 获取监控交易列表
  getMonitoringTransactions: async (params = { skip: 0, limit: 20 }) => {
    try {
      const response = await api.get('/transactions/monitoring', { params });
      return response;
    } catch (error) {
      console.error('获取交易列表失败:', error);
      throw error;
    }
  },

  // 格式化交易类型
  formatTransactionType: (type) => {
    return type === TransactionType.BUY ? '买入' : '卖出';
  },

  // 格式化金额
  formatAmount: (amount) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  },

  // 格式化数量
  formatQuantity: (quantity, decimals = 8) => {
    return Number(quantity).toFixed(decimals);
  },

  // 获取交易类型的颜色
  getTransactionTypeColor: (type) => {
    return type === TransactionType.BUY ? 'success' : 'error';
  }
};

export default transactionService; 