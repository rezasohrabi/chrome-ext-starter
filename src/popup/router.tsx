import React from 'react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';

import CustomSnoozeView from './views/CustomSnoozeView';
import MainView from './views/MainView';
import NotFoundView from './views/NotFoundView';
import RecurringSnoozeView from './views/RecurringSnoozeView';

// Define the root route
const rootRoute = createRootRoute({
  notFoundComponent: NotFoundView,
});

// Define the routes
const mainRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MainView,
});

const customSnoozeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/custom-snooze',
  component: CustomSnoozeView,
});

const recurringSnoozeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recurring-snooze',
  component: RecurringSnoozeView,
});

// Create the route tree using the routes
const routeTree = rootRoute.addChildren([
  mainRoute,
  customSnoozeRoute,
  recurringSnoozeRoute,
]);

// Create a memory history instance for Chrome extension environment
const memoryHistory = createMemoryHistory({
  initialEntries: ['/'], // Start at the main view
});

// Create the router using the route tree and memory history
const router = createRouter({
  routeTree,
  history: memoryHistory,
  defaultPreload: 'render',
  defaultViewTransition: true,
});

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Create and export the router provider component
export default function Router() {
  return <RouterProvider router={router} />;
}
