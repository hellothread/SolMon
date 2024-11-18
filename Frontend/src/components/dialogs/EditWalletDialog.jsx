import { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';
import BaseDialog from './BaseDialog';  // 使用基础对话框组件

const EditWalletDialog = ({ open, data, loading, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <BaseDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>编辑钱包</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="名称"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="地址"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="备注"
            value={formData.note}
            onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>取消</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            确定
          </Button>
        </DialogActions>
      </form>
    </BaseDialog>
  );
};

export default EditWalletDialog; 