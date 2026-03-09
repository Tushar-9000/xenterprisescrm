import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import HistorySidebar from './HistorySidebar';

const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
      <HistorySidebar />
    </div>
  );
};

export default AppLayout;
