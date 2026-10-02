import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './index.css';
import { AuthProvider, Guard } from './auth';
import { Layout } from './ui';
import Feed from './pages/Feed';
import PostPage from './pages/PostPage';
import Profile from './pages/Profile';
import { Login, Register } from './pages/Auth';
import Dashboard from './pages/Dashboard';
import PostForm from './pages/PostForm';
import Settings from './pages/Settings';
import Admin from './pages/Admin';

const NotFound = () => <p className="py-16 text-center">Page not found. <Link className="underline" to="/">Go home</Link></p>;

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Feed />} />
          <Route path="/posts/:slug" element={<PostPage />} />
          <Route path="/u/:username" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
          <Route path="/dashboard/new" element={<Guard><PostForm /></Guard>} />
          <Route path="/dashboard/:id/edit" element={<Guard><PostForm /></Guard>} />
          <Route path="/settings" element={<Guard><Settings /></Guard>} />
          <Route path="/admin" element={<Guard admin><Admin /></Guard>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
