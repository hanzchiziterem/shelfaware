import { createBrowserRouter } from 'react-router-dom';
import { protectedRoutes, publicRoutes } from '@/app/router/routeConfig';

export const appRouter = createBrowserRouter([...publicRoutes, ...protectedRoutes]);
