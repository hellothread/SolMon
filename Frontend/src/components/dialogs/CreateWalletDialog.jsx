import { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';
import BaseDialog from './BaseDialog';

const CreateWalletDialog = ({ open, data, loading, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    if (!open) {
      setFormData({ name: '', address: '', note: '' });
    }
  }, [open]);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({ name: '', address: '', note: '' });
    onClose();
  };

  return (
    <BaseDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>添加钱包</DialogTitle>
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
          <Button onClick={handleClose}>取消</Button>
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

export default CreateWalletDialog; 