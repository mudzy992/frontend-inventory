import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'jquery/dist/jquery.js';
import 'popper.js/dist/popper.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import "bootstrap/js/src/collapse.js";
import 'bootstrap-icons/font/bootstrap-icons.css';
import reportWebVitals from './reportWebVitals';
import { HashRouter, Route, Switch } from 'react-router-dom';
import CategoryPage from './components/admin/Categories/Categories';
import HomePage from './components/admin/HomePage/HomePage';
import ArticlePage from './components/admin/ArticlePage/ArticlePage';
import UserPage from './components/admin/UserPage/UserPage';
import UserProfilePage from './components/user/UserProfilePage/UserProfilePage';
import ArticleOnUserPage from './components/user/ArticleOnUser/ArticleOnUserPage';
import UserLoginPage from './components/user/UserLogin/UserLoginPage';
import AdministratorLoginPage from './components/admin/AdministratorLoginPage/AdministratorLoginPage';
import AdminArticleOnUserPage from './components/admin/ArticleOnUser/ArticleOnUserPage';
import AdminUserProfilePage from './components/admin/UserProfilePage/UserProfilePage';
import AddArticlePage from './components/admin/AddArticle/AddArticlePage';
import AddUserPage from './components/admin/AddUser/AddUserPage';
import AddFeaturePage from './components/admin/AddFeature/AddFeaturePage';
import AddNewCategoryPage from './components/admin/AddCategory/AddCategoryPage';
import AddDepartmentAndJob from './components/admin/AddDepartmentAndJob/AddDepartmetAndJob';
import StockPage from './components/admin/StockPage/StockPage';
import DocumentsPage from './components/admin/DocumentsPage/DocumentPage';
import AdminDashboardPage from './components/admin/DashboardPage/DashboardPage';

ReactDOM.render(
  <React.StrictMode>
    {/* mehanizam rutiranja */}
    <HashRouter>
      <Switch>
        <Route exact path="/user/login" component={UserLoginPage} />
        <Route path="/user/profile/:userID" component={UserProfilePage} />
        <Route path="/user/article/:serial" component={ArticleOnUserPage} />

        <Route exact path="/admin/login" component={AdministratorLoginPage} />
        <Route exact path="/user/" component={UserPage} />
        <Route path="/admin/user/:serial" component={AdminArticleOnUserPage} />
        <Route path="/admin/userProfile/:userID" component={AdminUserProfilePage} />
        <Route exact path="/" component={HomePage} />
        <Route path="/category/:categoryID" component={CategoryPage} />
        <Route path="/article/:articleID" component={ArticlePage} />
        <Route path="/admin/article/" component={ AddArticlePage } />
        <Route path="/admin/user/" component={ AddUserPage } />
        <Route path="/admin/feature/" component={ AddFeaturePage } />
        <Route path="/admin/category/" component={ AddNewCategoryPage } />
        <Route path="/admin/department/" component={ AddDepartmentAndJob } />
        <Route path="/admin/document/" component={ DocumentsPage } />
        <Route path="/admin/stock/:stockID" component={ StockPage } />
        <Route path="/admin/dashboard" component={ AdminDashboardPage } />
      </Switch>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
reportWebVitals();
