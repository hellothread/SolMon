import {
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
  Box,
  Typography
} from '@mui/material';
import { Edit, Trash2, Copy, ExternalLink } from 'lucide-react';

const WalletRow = ({ wallet, index, onEdit, onDelete, onMessage }) => {
  // 复制地址
  const handleCopy = async (address) => {
    try {
      await navigator.clipboard.writeText(address);
      onMessage('地址已复制到剪贴板', 'success');  // 显示成功提示
    } catch (error) {
      onMessage('复制失败', 'error');  // 显示错误提示
    }
  };

  // 打开 Solscan
  const handleOpenSolscan = (address) => {
    window.open(`https://solscan.io/account/${address}`, '_blank');
  };

  return (
    <TableRow>
      <TableCell>{index + 1}</TableCell>
      <TableCell>{wallet.name}</TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ flex: 1 }}>{wallet.address}</Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="复制地址">
              <IconButton 
                size="small" 
                onClick={() => handleCopy(wallet.address)}
              >
                <Copy size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title="在 Solscan 中查看">
              <IconButton 
                size="small" 
                onClick={() => handleOpenSolscan(wallet.address)}
              >
                <ExternalLink size={16} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </TableCell>
      <TableCell>{wallet.note}</TableCell>
      <TableCell>
        <Tooltip title="编辑">
          <IconButton size="small" onClick={() => onEdit(wallet)}>
            <Edit size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title="删除">
          <IconButton size="small" onClick={() => onDelete(wallet.id)}>
            <Trash2 size={18} />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default WalletRow; 