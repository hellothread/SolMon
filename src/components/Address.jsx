import { useState, useEffect } from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { 
  Copy, 
  ExternalLink,
  MoreHorizontal,
  Upload,
  Plus,
  Trash,
  Edit,
  FileQuestion
} from 'lucide-react';

const Address = () => {
  const [addresses, setAddresses] = useState([]);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [loading, setLoading] = useState(false);

  // 获取地址列表
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/addresses');
      const data = await response.json();
      setAddresses(
        [
            {
                id: 1,
                name: '主钱包',
                address: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
                note: '用于主要交易',
            },
            {
                id: 2,
                name: 'NFT钱包',
                address: '5BZWY6XWPxuWFxs2jagkmUkCoBWmJ6c4YEArr83hYBWk',
                note: '用于NFT交易',
            },
            {
                id: 3,
                name: 'DeFi钱包',
                address: 'BQWWFhzBnqYHx4wvkE5GNxpz5ChknYZqRqJQJqxdcKbJ',
                note: '用于DeFi操作',
            },
        ]
      );
    } catch (error) {
      console.error('获取地址列表失败:', error);
      // 可以添加错误提示
    } finally {
      setLoading(false);
    }
  };

  // 导入地址
  const handleImport = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/addresses/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addresses: importText }),
      });
      
      if (response.ok) {
        setImportDialogOpen(false);
        setImportText('');
        fetchAddresses(); // 重新获取列表
        // 可以添加成功提示
      }
    } catch (error) {
      console.error('导入地址失败:', error);
      // 可以添加错误提示
    } finally {
      setLoading(false);
    }
  };

  // 删除地址
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchAddresses(); // 重新获取列表
        // 可以添加成功提示
      }
    } catch (error) {
      console.error('删除地址失败:', error);
      // 可以添加错误提示
    }
  };

  // 复制地址
  const handleCopyAddress = (address) => {
    navigator.clipboard.writeText(address);
    // 可以添加复制成功提示
  };

  // 在浏览器中查看
  const handleOpenExplorer = (address) => {
    window.open(`https://solscan.io/account/${address}`, '_blank');
  };

  // 组件加载时获取地址列表
  useEffect(() => {
    // fetchAddresses();
    setAddresses(
        [
            {
                id: 1,
                name: '主钱包',
                address: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
                note: '用于主要交易',
            },
            {
                id: 2,
                name: 'NFT钱包',
                address: '5BZWY6XWPxuWFxs2jagkmUkCoBWmJ6c4YEArr83hYBWk',
                note: '用于NFT交易',
            },
            {
                id: 3,
                name: 'DeFi钱包',
                address: 'BQWWFhzBnqYHx4wvkE5GNxpz5ChknYZqRqJQJqxdcKbJ',
                note: '用于DeFi操作',
            },
        ]
      );
  }, []);

  // 空状态展示组件
  const EmptyState = () => (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2
      }}
    >
      <FileQuestion 
        size={64} 
        className="text-gray-400 mb-4" 
      />
      <Typography 
        variant="h6" 
        color="text.secondary" 
        sx={{ mb: 2 }}
      >
        暂无地址
      </Typography>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        align="center" 
        sx={{ mb: 3, maxWidth: 400 }}
      >
        您还没有添加任何地址，可以通过导入地址或手动添加地址来开始管理
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* 标题和操作按钮 - 始终显示 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            地址管理
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Upload size={18} />}
              onClick={() => setImportDialogOpen(true)}
            >
              导入地址
            </Button>
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
            >
              添加地址
            </Button>
          </Box>
        </Box>

        {/* 根据状态显示不同内容 */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <Typography color="text.secondary">加载中...</Typography>
          </Box>
        ) : addresses.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="10%">序号</TableCell>
                  <TableCell width="20%">名称</TableCell>
                  <TableCell width="35%">地址</TableCell>
                  <TableCell width="20%">备注</TableCell>
                  <TableCell width="15%">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {addresses.map((item, index) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace',
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {item.address}
                        </Typography>
                        <Tooltip title="复制地址">
                          <IconButton 
                            size="small"
                            onClick={() => handleCopyAddress(item.address)}
                          >
                            <Copy size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="在浏览器中查看">
                          <IconButton 
                            size="small"
                            onClick={() => handleOpenExplorer(item.address)}
                          >
                            <ExternalLink size={16} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {item.note}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small" 
                        >
                          <Edit size={16} />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash size={16} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <EmptyState />
        )}
      </Paper>

      {/* 导入地址对话框 */}
      <Dialog 
        open={isImportDialogOpen} 
        onClose={() => setImportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>导入地址</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={6}
            fullWidth
            placeholder="请输入要导入的地址，每行一个地址..."
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>取消</Button>
          <Button 
            variant="contained" 
            onClick={handleImport}
            disabled={loading || !importText.trim()}
          >
            导入
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Address; 