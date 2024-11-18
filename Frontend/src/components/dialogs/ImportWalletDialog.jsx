import { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  LinearProgress,
  Box
} from '@mui/material';
import { Upload } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import BaseDialog from './BaseDialog';  // 使用基础对话框组件

const ImportWalletDialog = ({ 
  open, 
  loading, 
  onClose, 
  onSubmit 
}) => {
  const [importText, setImportText] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const theme = useTheme();

  // 重置状态
  useEffect(() => {
    if (!open) {
      setImportText('');
      setImportProgress(0);
    }
  }, [open]);

  // 处理文件上传
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImportText(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  // 处理提交
  const handleSubmit = async () => {
    try {
      await onSubmit(importText, setImportProgress);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  return (
    <BaseDialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>批量导入钱包</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            请按照以下格式输入钱包信息，每行一个：
          </Typography>
          <Typography 
            variant="caption" 
            component="pre"
            sx={{ 
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'grey.900'  // 暗色主题背景
                : 'grey.100', // 亮色主题背景
              color: theme.palette.text.primary,  // 使用主题文字颜色
              p: 2,
              borderRadius: 1,
              whiteSpace: 'pre-wrap',
              border: `1px solid ${
                theme.palette.mode === 'dark' 
                  ? theme.palette.grey[800]  // 暗色主题边框
                  : theme.palette.grey[300]  // 亮色主题边框
              }`
            }}
          >
            名称,地址,备注
            例如：
            我的钱包1,address1,备注1
          </Typography>
        </Box>

        <Button
          component="label"
          variant="outlined"
          startIcon={<Upload size={18} />}
          sx={{ mb: 2 }}
        >
          上传 CSV 文件
          <input
            type="file"
            hidden
            accept=".csv,.txt"
            onChange={handleFileUpload}
          />
        </Button>

        <TextField
          fullWidth
          multiline
          rows={10}
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="名称,地址,备注"
          variant="outlined"
        />

        {importProgress > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              导入进度: {Math.round(importProgress)}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={importProgress} 
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          取消
        </Button>
        <Button 
          variant="contained"
          onClick={handleSubmit}
          disabled={!importText.trim() || loading}
        >
          导入
        </Button>
      </DialogActions>
    </BaseDialog>
  );
};

export default ImportWalletDialog; 