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
import { MainMenu, MainMenuItem } from './components/MainMenu/MainMenu';
import { HashRouter, Route, Switch } from 'react-router-dom';
import CategoryPage from './components/Categories/Categories';
import HomePage from './components/HomePage/HomePage';
import ArticlePage from './components/ArticlePage/ArticlePage';
import UserPage from './components/UserPage/UserPage';
import UserProfilePage from './components/UserProfilePage/UserProfilePage';
import ArticleOnUserPage from './components/ArticlePage/ArticleOnUserPage';

const menuItems = [
  new MainMenuItem("Naslovna", "/"),
  new MainMenuItem("Korisnici", "/user"),
  new MainMenuItem("Contact", "/contact/"),
  new MainMenuItem("Log in", "/user/login/"),
  new MainMenuItem("Register", "/user/register/"),
]

ReactDOM.render( 
  <React.StrictMode>
    <MainMenu items= {menuItems} />
    {/* mehanizam rutiranja */}
    <HashRouter>
      <Switch>
        <Route exact path="/" component={ HomePage }  />
        <Route path="/user/" component={ UserPage }/>
        <Route path="/userProfile/:userID" component={ UserProfilePage }/>
        <Route path="/category/:categoryID" component={ CategoryPage }/>
        <Route path="/article/:articleID" component={ ArticlePage }/>
        <Route path="/article/:articleID/:serialNumber" component={ ArticleOnUserPage }/>
      </Switch>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
reportWebVitals();
