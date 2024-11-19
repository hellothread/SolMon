import { Box, Paper, Typography, Drawer, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';

const TokenSummaryCard = ({ title, transactions, type }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const [selectedToken, setSelectedToken] = useState(null);
  
  // 获取卡片背景样式
  const getCardStyle = () => {
    if (type === 'buy') {
      return {
        backgroundColor: isLight 
          ? alpha(theme.palette.success.main, 0.04)
          : alpha(theme.palette.success.main, 0.1),
        borderLeft: `4px solid ${theme.palette.success.main}`,
      };
    }
    return {
      backgroundColor: isLight 
        ? alpha(theme.palette.error.main, 0.04)
        : alpha(theme.palette.error.main, 0.1),
      borderLeft: `4px solid ${theme.palette.error.main}`,
    };
  };
  
  // 按代币分组并统计钱包数
  const getTokenGroups = () => {
    const tokenGroups = new Map();
    
    transactions.forEach(tx => {
      const tokenSymbol = tx.token.symbol;
      if (!tokenGroups.has(tokenSymbol)) {
        tokenGroups.set(tokenSymbol, {
          token: tx.token,
          wallets: new Set(),
          transactions: []
        });
      }
      const group = tokenGroups.get(tokenSymbol);
      group.wallets.add(tx.wallet.id);
      group.transactions.push(tx);
    });
    
    return Array.from(tokenGroups.values())
      .sort((a, b) => b.transactions[0].timestamp.localeCompare(a.transactions[0].timestamp))
      .slice(0, 5);
  };

  const displayItems = Array(5).fill(null).map((_, index) => {
    const groups = getTokenGroups();
    return groups[index] || null;
  });

  return (
    <>
      <Paper 
        elevation={isLight ? 1 : 2}
        sx={{ 
          p: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          ...getCardStyle(),
          transition: 'all 0.3s'
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 1,
            color: type === 'buy' 
              ? theme.palette.success.main
              : theme.palette.error.main,
            fontWeight: 500
          }}
        >
          {title}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {displayItems.map((item, index) => (
            <Box 
              key={index}
              onClick={() => item && setSelectedToken(item)}
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1.5,
                borderRadius: 1,
                backgroundColor: isLight 
                  ? theme.palette.background.paper
                  : alpha(theme.palette.background.paper, 0.06),
                border: `1px solid ${
                  isLight 
                    ? theme.palette.divider
                    : alpha(theme.palette.divider, 0.1)
                }`,
                opacity: item ? 1 : 0.5,
                cursor: item ? 'pointer' : 'default',
                '&:hover': {
                  backgroundColor: item && (isLight 
                    ? theme.palette.action.hover 
                    : alpha(theme.palette.action.hover, 0.1))
                }
              }}
            >
              {item ? (
                <>
                  <Typography>{item.token.symbol}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography color="text.secondary">
                      {item.wallets.size} 个钱包
                    </Typography>
                    <ChevronRightIcon color="action" />
                  </Box>
                </>
              ) : (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ width: '100%', textAlign: 'center', fontStyle: 'italic' }}
                >
                  coin
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Paper>

      <Drawer
        anchor="right"
        open={!!selectedToken}
        onClose={() => setSelectedToken(null)}
        PaperProps={{
          sx: { width: '500px' }
        }}
      >
        {selectedToken && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                {selectedToken.token.symbol} 交易详情
              </Typography>
              <IconButton onClick={() => setSelectedToken(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            {selectedToken.transactions.map((tx, idx) => (
              <Box 
                key={idx}
                sx={{ 
                  p: 2,
                  mb: 1,
                  borderRadius: 1,
                  backgroundColor: theme.palette.action.hover
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">{tx.wallet.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(tx.timestamp).toLocaleString()}
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                  onClick={() => window.open(`https://solscan.io/account/${tx.wallet.address}`, '_blank')}
                >
                  {tx.wallet.address}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: alpha(
                    tx.tx_type === 'buy' 
                      ? theme.palette.success.main 
                      : theme.palette.error.main,
                    0.1
                  ),
                  p: 1,
                  borderRadius: 1
                }}>
                  <Box>
                    <Typography 
                      variant="body2" 
                      color={tx.tx_type === 'buy' ? 'success.main' : 'error.main'}
                      sx={{ fontWeight: 500 }}
                    >
                      {tx.tx_type === 'buy' ? '花费' : '获得'}
                    </Typography>
                    <Typography variant="body2">
                      {tx.amount} SOL
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography 
                      variant="body2" 
                      color={tx.tx_type === 'buy' ? 'success.main' : 'error.main'}
                      sx={{ fontWeight: 500 }}
                    >
                      {tx.tx_type === 'buy' ? '获得' : '卖出'}
                    </Typography>
                    <Typography variant="body2">
                      {tx.quantity.toFixed(tx.token.decimals)} {tx.token.symbol}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Drawer>
    </>
  );
};

export default TokenSummaryCard;
