import React from 'react';
import { Skeleton } from '@mui/material';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>出错了，请刷新页面重试</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 