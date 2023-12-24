import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import reportWebVitals from './reportWebVitals';
import { HashRouter, Routes, Route } from 'react-router-dom';
import CategoryPage from './components/admin/Categories/Categories';
import HomePage from './components/admin/HomePage/HomePage';
import UserProfilePage from './components/user/UserProfilePage/UserProfilePage';
import ArticleOnUserPage from './components/user/ArticleOnUser/ArticleOnUserPage';
import AdminArticleOnUserPage from './components/admin/ArticleOnUser/ArticleOnUserPage';
import AdminUserProfilePage from './components/admin/UserProfilePage/UserProfilePage';
import AddArticlePage from './components/admin/AddArticle/AddArticlePage';
import AddUserPage from './components/admin/AddUser/AddUserPage';
import AddFeaturePage from './components/admin/AddFeature/AddFeaturePage';
import AddNewCategoryPage from './components/admin/AddCategory/AddCategoryPage';
import AddDepartmentAndJob from './components/admin/AddDepartmentAndJob/AddDepartmetAndJob';
import { NextUIProvider } from '@nextui-org/react';
import StockPage from './components/admin/StockPage/StockPage';
import DocumentsPage from './components/admin/DocumentsPage/DocumentPage';
import LoginPage from './components/Login/LoginPage';
import LogOutPage from './components/Logout/LogoutPage';
import { UserContextProvider } from './components/UserContext/UserContext';
import AdminDashboardPage from './components/admin/DashboardPage/DashboardPage';
import HelpdeskTicketPage from './components/admin/HelpDesk/main/HelpdeskTicketPage';

const rootElement = document.getElementById('root');

const App = () => {
  return (
    <React.StrictMode>
    <NextUIProvider>
      <UserContextProvider>
        <main className='dark text-foreground bg-background min-h-screen min-w-screen pb-4'>
        {/* mehanizam rutiranja */}
            <HashRouter>
              <Routes>
                {/* master login */}
                <Route path='/login/' element={<LoginPage />} />
                <Route path='/logout/' element={<LogOutPage />} />
                <Route path="/user/profile/:userID" element={<UserProfilePage />} />
                <Route path="/user/article/:serial" element={<ArticleOnUserPage />} />
                <Route path="/admin/article/:serial" element={<AdminArticleOnUserPage />} />
                <Route path="/admin/user/:userID" element={<AdminUserProfilePage />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/category/:categoryID" element={<CategoryPage />} />
                <Route path="/admin/article/" element={<AddArticlePage />} />
                <Route path="/admin/user/" element={<AddUserPage />} />
                <Route path="/admin/feature/" element={<AddFeaturePage />} />
                <Route path="/admin/category/" element={<AddNewCategoryPage />} />
                <Route path="/admin/department/" element={<AddDepartmentAndJob />} />
                <Route path="/admin/document/" element={<DocumentsPage />} />
                <Route path="/admin/stock/:stockID" element={<StockPage />} /> 
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/helpdesk" element={<HelpdeskTicketPage />} />
              </Routes>
              
        </HashRouter>
        </main>
      </UserContextProvider>  
      </NextUIProvider>
  </React.StrictMode>
  )
}


if(rootElement) {
  createRoot(rootElement).render( <App /> );
} else {
  console.error("Element with id 'root' not found.");
}
reportWebVitals();
