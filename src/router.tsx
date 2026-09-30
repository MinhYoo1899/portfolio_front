import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout'
import RouteError from './components/RouteError'
import NotFoundPage from './pages/NotFoundPage'
import BoardListPage from './features/posts/pages/BoardListPage'
import PostDetailPage from './features/posts/pages/PostDetailPage'
import PostCreatePage from './features/posts/pages/PostCreatePage'
import PostEditPage from './features/posts/pages/PostEditPage'
import { LoginPage } from './features/auth/LoginPage'
import { RequireAuth } from './features/auth/RequireAuth'

// Data router with no loaders/actions: react-query owns all data fetching.
// The root errorElement catches render/route errors (AC13).
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <BoardListPage /> },
      { path: 'posts/:id', element: <PostDetailPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: 'posts/new', element: <PostCreatePage /> },
          { path: 'posts/:id/edit', element: <PostEditPage /> },
        ],
      },
      { path: 'login', element: <LoginPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
