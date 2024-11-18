import { Dialog } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const BaseDialog = ({ children, ...props }) => {
  const theme = useTheme();
  
  return (
    <Dialog
      {...props}
      PaperProps={{
        elevation: 0,
        sx: {
          bgcolor: theme.palette.mode === 'dark' 
            ? theme.palette.background.default  // 暗色主题使用默认背景色
            : '#fff',  // 亮色主题使用纯白色
          backgroundImage: 'none',
          boxShadow: '0px 8px 10px -5px rgba(0,0,0,0.1)',  // 统一的阴影效果
          '& .MuiDialogTitle-root': {
            bgcolor: theme.palette.mode === 'dark'
              ? theme.palette.background.default
              : '#fff'
          }
        }
      }}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }
      }}
    >
      {children}
    </Dialog>
  );
};

export default BaseDialog; 