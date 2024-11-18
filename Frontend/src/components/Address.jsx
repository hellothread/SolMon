import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { Plus, Upload } from 'lucide-react';

import api from '../api/axios';
import CreateWalletDialog from './dialogs/CreateWalletDialog.jsx';
import EditWalletDialog from './dialogs/EditWalletDialog.jsx';
import WalletRow from './WalletRow.jsx';
import ImportWalletDialog from './dialogs/ImportWalletDialog';

const Address = () => {
  // 合并所有状态到一个 state 对象
  const [state, setState] = useState({
    wallets: [],
    loading: false,
    createDialog: {
      open: false,
      data: { name: '', address: '', note: '' }
    },
    editDialog: {
      open: false,
      data: { name: '', address: '', note: '' }
    },
    importDialog: {
      open: false,
      text: ''
    },
    message: {
      type: 'success',
      content: '',
      open: false
    }
  });

  // 消息提示处理
  const showMessage = useCallback((content, type = 'success') => {
    setState(prev => ({
      ...prev,
      message: { type, content, open: true }
    }));
  }, []);

  // API 操作集合
  const apiActions = {
    // 获取钱包列表
    fetchWallets: useCallback(async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        const list = await api.get('/wallets/');
        setState(prev => ({ 
          ...prev, 
          wallets: list,
          loading: false 
        }));
      } catch (error) {
        showMessage('获取钱包列表失败', 'error');
        setState(prev => ({ ...prev, loading: false }));
      }
    }, [showMessage]),

    // 创建钱包
    createWallet: useCallback(async (walletData) => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        const walletList = await api.post('/wallets/', walletData);
        setState(prev => ({ 
          ...prev,
          wallets: [...prev.wallets, walletList],
          createDialog: { open: false, data: { name: '', address: '', note: '' } },
          loading: false
        }));
        showMessage('创建成功');
      } catch (error) {
        showMessage(error.response?.data?.detail || '创建失败', 'error');
        setState(prev => ({ ...prev, loading: false }));
      }
    }, [showMessage]),

    // 更新钱包
    updateWallet: useCallback(async (id, walletData) => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        const walletList = await api.put(`/wallets/${id}`, walletData);
        setState(prev => ({
          ...prev,
          wallets: prev.wallets.map(w => w.id === id ? walletList: w),
          editDialog: { open: false, data: { name: '', address: '', note: '' } },
          loading: false
        }));
        showMessage('更新成功');
      } catch (error) {
        showMessage('更新失败', 'error');
        setState(prev => ({ ...prev, loading: false }));
      }
    }, [showMessage]),

    // 删除钱包
    deleteWallet: useCallback(async (id) => {
      if (!window.confirm('确定要删除这个钱包吗？')) return;

      try {
        setState(prev => ({ ...prev, loading: true }));
        await api.delete(`/wallets/${id}`);
        setState(prev => ({
          ...prev,
          wallets: prev.wallets.filter(w => w.id !== id),
          loading: false
        }));
        showMessage('删除成功');
      } catch (error) {
        showMessage('删除失败', 'error');
        setState(prev => ({ ...prev, loading: false }));
      }
    }, [showMessage]),

    batchCreateWallets: useCallback(async (wallets) => {
      try {
        const response = await api.post('/wallets/batch', wallets);
        await apiActions.fetchWallets();  // 刷新钱包列表
        return response;
      } catch (error) {
        console.error('批量创建钱包失败:', error);
        throw error;
      }
    }, []),
  };

  // 对话框处理函数
  const dialogActions = {
    handleCreateDialog: (open, data = { name: '', address: '', note: '' }) => {
      setState(prev => ({
        ...prev,
        createDialog: { 
          open, 
          data: open ? data : { name: '', address: '', note: '' }
        }
      }));
    },

    handleEditDialog: (open, data = { name: '', address: '', note: '' }) => {
      setState(prev => ({
        ...prev,
        editDialog: { 
          open, 
          data: open ? data : { name: '', address: '', note: '' }
        }
      }));
    },

    handleImportDialog: (open, text = '') => {
      setState(prev => ({
        ...prev,
        importDialog: { open, text }
      }));
    }
  };

  // 批量导入处理函数
  const handleBatchImport = async (importText) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // 解析导入文本
      const wallets = importText
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [name, address, note] = line.split(',').map(item => item.trim());
          return { name: name || address, address, note: note || '' };
        });

      // 批量创建钱包
      const result = await apiActions.batchCreateWallets(wallets);
      
      // 关闭对话框
      dialogActions.handleImportDialog(false);

      // 构建结果消息
      const buildMessage = (result) => {
        const messages = [];
        
        // 添加成功信息
        if (result.total_success > 0) {
          messages.push(`✅ 成功导入 ${result.total_success} 个钱包`);
        }
        
        // 添加失败信息
        if (result.total_errors > 0) {
          messages.push(`❌ 失败 ${result.total_errors} 个,可能存在重复地址`);
        }
        
        return messages.join('\n');
      };

      // 确定消息类型
      const getMessageType = (result) => {
        if (result.total_errors === 0) return 'success';
        if (result.total_success === 0) return 'error';
        return 'warning';
      };

      // 显示消息
      showMessage(
        buildMessage(result),
        getMessageType(result)
      );

    } catch (error) {
      showMessage(error.message || '批量导入失败', 'error');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // 初始化加载数据
  useEffect(() => {
    apiActions.fetchWallets();
  }, [apiActions.fetchWallets]);

  const {
    wallets,
    loading,
    createDialog,
    editDialog,
    message
  } = state;

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* 标题和操作按钮 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            钱包管理
          </Typography>
          <ButtonGroup>
            <Button
              variant="contained"
              startIcon={<Upload size={18} />}
              onClick={() => dialogActions.handleImportDialog(true)}
            >
              批量导入
            </Button>
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => dialogActions.handleCreateDialog(true)}
            >
              添加钱包
            </Button>
          </ButtonGroup>
        </Box>

        {/* 钱包列表 */}
        {loading ? (
          <LoadingState />
        ) : wallets.length > 0 ? (
          <WalletList 
            wallets={wallets}
            onEdit={(wallet) => dialogActions.handleEditDialog(true, wallet)}
            onDelete={apiActions.deleteWallet}
            onMessage={showMessage}
          />
        ) : (
          <EmptyState />
        )}
      </Paper>

      {/* 创建钱包对话框 */}
      <CreateWalletDialog
        open={createDialog.open}
        data={createDialog.data}
        loading={loading}
        onClose={() => dialogActions.handleCreateDialog(false)}
        onSubmit={apiActions.createWallet}
      />

      {/* 编辑钱包对话框 */}
      <EditWalletDialog
        open={editDialog.open}
        data={editDialog.data}
        loading={loading}
        onClose={() => dialogActions.handleEditDialog(false)}
        onSubmit={(data) => apiActions.updateWallet(editDialog.data.id, data)}
      />

      <ImportWalletDialog
        open={state.importDialog.open}
        loading={state.loading}
        onClose={() => dialogActions.handleImportDialog(false)}
        onSubmit={handleBatchImport}
      />

      {/* 消息提示 */}
      <Snackbar
        open={message.open}
        autoHideDuration={3000}
        onClose={() => setState(prev => ({ ...prev, message: { ...prev.message, open: false } }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          severity={message.type}
          onClose={() => setState(prev => ({ ...prev, message: { ...prev.message, open: false } }))}
        >
          {message.content}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// 子组件
const LoadingState = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
    <CircularProgress />
  </Box>
);

const EmptyState = () => (
  <Box sx={{ textAlign: 'center', py: 8 }}>
    <Typography color="text.secondary">暂无钱包数据</Typography>
  </Box>
);

const WalletList = ({ wallets, onEdit, onDelete, onMessage }) => (
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>序号</TableCell>
          <TableCell>名称</TableCell>
          <TableCell>地址</TableCell>
          <TableCell>备注</TableCell>
          <TableCell>操作</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {wallets && wallets.map((wallet, index) => (
          <WalletRow 
            key={wallet?.id}
            wallet={wallet}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
            onMessage={onMessage}
          />
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default Address; 