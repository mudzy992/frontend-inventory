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

ReactDOM.render(
  <React.StrictMode>
    {/* mehanizam rutiranja */}
    <HashRouter>
      <Switch>
        <Route exact path="/user/login" component={UserLoginPage} />
        <Route path="/userProfile/:userID" component={UserProfilePage} />
        <Route path="/userArticle/:userID/:articleId/:serial" component={ArticleOnUserPage} />

        <Route exact path="/admin/login" component={AdministratorLoginPage} />
        <Route exact path="/user/" component={UserPage} />
        <Route path="/admin/userArticle/:userID/:articleId/:serial" component={AdminArticleOnUserPage} />
        <Route path="/admin/userProfile/:userID" component={AdminUserProfilePage} />
        <Route exact path="/" component={HomePage} />
        <Route path="/category/:categoryID" component={CategoryPage} />
        <Route path="/article/:articleID" component={ArticlePage} />
      </Switch>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
reportWebVitals();
