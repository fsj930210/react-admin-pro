import { Outlet } from '@tanstack/react-router';
import { Footer } from '../footer';



export const Content = () => {
  return (
    <div className="flex flex-col flex-1 bg-muted overflow-y-auto overflow-x-hidden">
      <div className="flex-1">
        <Outlet />
      </div>
        <Footer />
    </div>
  );
};
