import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Home from '../components/Home';
import Address from '../components/Address';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/address',
        element: <Address />
      }
    ]
  }
]);

export default router; 