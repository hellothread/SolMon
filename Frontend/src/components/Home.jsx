import { useState } from 'react';
import { 
  Paper, 
  Grid, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown,
  North,
  South
} from '@mui/icons-material';

const Home = () => {
  // 模拟数据
  const recentBuys = [
    { coin: 'BTC', amount: '0.5', cost: '$20,000', time: '2024-03-20 10:30' },
    { coin: 'ETH', amount: '2.0', cost: '$3,000', time: '2024-03-19 15:45' },
    { coin: 'SOL', amount: '15', cost: '$1,500', time: '2024-03-18 12:20' },
    { coin: 'DOT', amount: '100', cost: '$800', time: '2024-03-17 09:15' },
    { coin: 'AVAX', amount: '20', cost: '$500', time: '2024-03-16 16:40' },
  ];

  const recentSells = [
    { coin: 'SOL', amount: '10', cost: '$8,000', time: '2024-03-18 09:15' },
    { coin: 'AVAX', amount: '5', cost: '$2,500', time: '2024-03-17 14:20' },
    { coin: 'BNB', amount: '3', cost: '$900', time: '2024-03-16 11:30' },
    { coin: 'ADA', amount: '1000', cost: '$400', time: '2024-03-15 15:45' },
    { coin: 'MATIC', amount: '500', cost: '$300', time: '2024-03-14 10:20' },
  ];

  const addressActivities = [
    { name: '钱包1', type: 'buy', coin: 'pnut', amount: '2342343', cost: '23', time: '2024-03-20 11:30' },
    { name: '钱包2', type: 'sell', coin: 'doge', amount: '334352', cost: '3', time: '2024-03-20 10:15' },
    { name: '钱包3', type: 'buy', coin: 'pepe', amount: '134234345', cost: '534', time: '2024-03-19 15:45' },
    // ... 更多数据
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* 最近交易概览 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 最近买入 */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2,
              height: '100%',
              background: (theme) => theme.palette.mode === 'dark' 
                ? 'rgb(31 41 55 / 0.5)' 
                : '#fff'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">最近买入</Typography>
            </Box>
            <List>
              {recentBuys.map((item, index) => (
                <ListItem
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <North color="success" sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {item.coin}
                    </Typography>
                  </Box>
                  <Typography>{item.amount}</Typography>
                  <Typography color="success.main">{item.cost}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.time}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* 最近卖出 */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2,
              height: '100%',
              background: (theme) => theme.palette.mode === 'dark' 
                ? 'rgb(31 41 55 / 0.5)' 
                : '#fff'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingDown color="error" sx={{ mr: 1 }} />
              <Typography variant="h6">最近卖出</Typography>
            </Box>
            <List>
              {recentSells.map((item, index) => (
                <ListItem
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <South color="error" sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {item.coin}
                    </Typography>
                  </Box>
                  <Typography>{item.amount}</Typography>
                  <Typography color="error.main">{item.cost}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.time}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* 地址动态 */}
      <Paper 
        elevation={3}
        sx={{ 
          width: '100%',
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'rgb(31 41 55 / 0.5)' 
            : '#fff'
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>地址动态</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                    <TableCell width="20%">名称</TableCell>
                    <TableCell width="12%">花费</TableCell>
                    <TableCell width="10%">类型</TableCell>
                    <TableCell width="25%">币种</TableCell>
                    <TableCell width="13%">数量</TableCell>
                    <TableCell width="20%">时间</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {addressActivities.map((activity, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {activity.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{activity.cost} sol</TableCell>
                    <TableCell>
                        <Chip 
                            label={activity.type}
                            color={activity.type === 'buy' ? 'success' : 'error'}
                            size="small"
                        />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {activity.coin}
                      </Typography>
                    </TableCell>
                    <TableCell>{activity.amount}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {activity.time}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default Home; 