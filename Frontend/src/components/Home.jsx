import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip
} from '@mui/material';
import { format } from 'date-fns';
import transactionService from '../services/transactionService';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import TokenSummaryCard from './TokenSummaryCard';

const Home = () => {
  const [state, setState] = useState({
    transactions: [],  // 改为 items
    loading: false,
    error: null,
    page: 0,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });

  const theme = useTheme();

  // 获取交易列表
  const fetchTransactions = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const response = await transactionService.getMonitoringTransactions({
        page: state.page + 1,  // 后端从1开始计数
        size: state.pageSize
      });

      setState(prev => ({
        ...prev,
        transactions: response.items,
        total: response.total,
        totalPages: response.total_pages,
        loading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
      console.error('获取交易列表失败:', error);
    }
  }, [state.page, state.pageSize]);

  // 页面加载时获取数据
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // 处理分页变化
  const handlePageChange = (event, newPage) => {
    setState(prev => ({ ...prev, page: newPage }));
  };

  // 处理每页数量变化
  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setState(prev => ({
      ...prev,
      pageSize: newSize,
      page: 0  // 重置到第一页
    }));
  };

  // 格式化数字
  const formatNumber = (value, decimals = 2) => {
    return new Intl.NumberFormat('zh-CN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    }).format(value);
  };



  // 获取交易类型样式
  const getTransactionTypeStyle = (type) => {
    const isLight = theme.palette.mode === 'light';
    
    if (type === 'buy') {
      return {
        backgroundColor: isLight 
          ? alpha(theme.palette.success.main, 0.08)
          : alpha(theme.palette.success.main, 0.15),
        color: isLight 
          ? theme.palette.success.dark
          : theme.palette.success.light,
        border: `1px solid ${
          isLight 
            ? alpha(theme.palette.success.main, 0.3)
            : alpha(theme.palette.success.main, 0.2)
        }`,
        '& .MuiChip-label': {
          fontWeight: 600,
          px: 1
        },
        height: 24,
        borderRadius: 1.5
      };
    }
    return {
      backgroundColor: isLight 
        ? alpha(theme.palette.error.main, 0.08)
        : alpha(theme.palette.error.main, 0.15),
      color: isLight 
        ? theme.palette.error.dark
        : theme.palette.error.light,
      border: `1px solid ${
        isLight 
          ? alpha(theme.palette.error.main, 0.3)
          : alpha(theme.palette.error.main, 0.2)
      }`,
      '& .MuiChip-label': {
        fontWeight: 600,
        px: 1
      },
      height: 24,
      borderRadius: 1.5
    };
  };

  // 获取最近的买入和卖出交易
  const getRecentTransactions = (transactions, type, limit = 5) => {
    return transactions
      .filter(tx => tx.tx_type === type)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  };

  return (
    <Box 
      sx={{ 
        height: 'calc(100vh - 64px)', // 减去部导航栏高度
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        overflow: 'hidden' // 防止出现滚动条
      }}
    >
      {/* 买入和卖出区块 */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: 3,
          height: '30%', // 占据顶部30%的高度
          minHeight: '200px'
        }}
      >
        <TokenSummaryCard 
          title="最近买入" 
          transactions={getRecentTransactions(state.transactions, 'buy')}
          type="buy"
        />
        <TokenSummaryCard 
          title="最近卖出" 
          transactions={getRecentTransactions(state.transactions, 'sell')}
          type="sell"
        />
      </Box>

      {/* 交易监控表格 */}
      <Paper 
        elevation={3}
        sx={{ 
          flex: 1, // 占据剩余空间
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            交易监控
          </Typography>

          <TableContainer sx={{ flex: 1 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>钱包名称</TableCell>
                  <TableCell>交易信息</TableCell>
                  <TableCell>时间</TableCell>
                  <TableCell>交易哈希</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {state.transactions.map((tx) => (
                  <TableRow key={tx.id} hover>
                    <TableCell>
                      <Typography>{tx.wallet.name}</Typography>
                    </TableCell>   
                    <TableCell>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        '& .MuiChip-root': {
                          minWidth: '52px'
                        }
                      }}>
                        <Chip 
                          label={tx.tx_type === 'buy' ? '买入' : '卖出'}
                          size="small"
                          sx={{
                            ...getTransactionTypeStyle(tx.tx_type),
                            fontWeight: 500
                          }}
                        />
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'baseline',
                          gap: 0.5,
                          backgroundColor: theme.palette.mode === 'light' 
                            ? alpha(theme.palette.primary.main, 0.08)
                            : alpha(theme.palette.primary.main, 0.15),
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1
                        }}>
                          <Typography sx={{ 
                            fontWeight: 600, 
                            fontSize: '0.95rem',
                            color: theme.palette.primary.main
                          }}>
                            {formatNumber(tx.quantity, tx.token.decimals)}
                          </Typography>
                          <Typography sx={{ 
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            color: theme.palette.primary.main
                          }}>
                            {tx.token.symbol}
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 0.5,
                          color: 'text.secondary'
                        }}>
                          <Typography sx={{ fontSize: '0.9rem' }}>
                            {tx.tx_type === 'buy' ? '花费' : '获得'}
                          </Typography>
                          <Typography sx={{ 
                            fontWeight: 500, 
                            fontSize: '0.95rem',
                            color: 'text.primary'
                          }}>
                            {tx.amount}
                          </Typography>
                          <Typography sx={{ fontSize: '0.9rem' }}>
                            SOL
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {format(new Date(tx.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 120,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer',
                          '&:hover': {
                            color: 'primary.main'
                          }
                        }}
                        onClick={() => window.open(`https://solscan.io/tx/${tx.tx_hash}`, '_blank')}
                      >
                        {tx.tx_hash}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={state.total}
            page={state.page}
            onPageChange={handlePageChange}
            rowsPerPage={state.pageSize}
            onRowsPerPageChange={handlePageSizeChange}
            rowsPerPageOptions={[12, 20, 50]}
            labelRowsPerPage="每页行数"
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default Home; 