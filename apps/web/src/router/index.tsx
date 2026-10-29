import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { appRoutes } from './routeConfig';

export const router = createBrowserRouter(appRoutes);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

