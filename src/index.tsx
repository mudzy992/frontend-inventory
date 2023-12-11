import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'jquery/dist/jquery.js';
import 'popper.js/dist/popper.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import "bootstrap/js/src/collapse.js";
import 'bootstrap-icons/font/bootstrap-icons.css';
import reportWebVitals from './reportWebVitals';
import { HashRouter, Routes, Route } from 'react-router-dom';
import CategoryPage from './components/admin/Categories/Categories';
import HomePage from './components/admin/HomePage/HomePage';
/* import ArticlePage from './components/admin/ArticlePage/ArticlePage';*/
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
import { UserContextProvider } from './components/UserContext/UserContext';
/*import AdminDashboardPage from './components/admin/DashboardPage/DashboardPage'; */

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
                <Route path="/user/profile/:userID" element={<UserProfilePage />} />
                <Route path="/user/article/:serial" element={<ArticleOnUserPage />} />

                {/* <Route path="/user/" element={<UserPage />} /> */}
                <Route path="/admin/user/:serial" element={<AdminArticleOnUserPage />} />
                <Route path="/admin/userProfile/:userID" element={<AdminUserProfilePage />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/category/:categoryID" element={<CategoryPage />} />
                {/* <Route path="/article/:articleID" element={<ArticlePage />} /> */}
                <Route path="/admin/article/" element={<AddArticlePage />} />
                <Route path="/admin/user/" element={<AddUserPage />} />
                <Route path="/admin/feature/" element={<AddFeaturePage />} />
                <Route path="/admin/category/" element={<AddNewCategoryPage />} />
                <Route path="/admin/department/" element={<AddDepartmentAndJob />} />
                <Route path="/admin/document/" element={<DocumentsPage />} />
                <Route path="/admin/stock/:stockID" element={<StockPage />} /> 
                {/* <Route path="/admin/dashboard" element={<AdminDashboardPage />} /> */}
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
