import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'jquery/dist/jquery.js';
import 'popper.js/dist/popper.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import "bootstrap/js/src/collapse.js";
import reportWebVitals from './reportWebVitals';
import { MainMenu, MainMenuItem } from './components/MainMenu/MainMenu';
import { HashRouter, Route, Switch } from 'react-router-dom';
import CategoryPage from './components/Categories/Categories';
import HomePage from './components/HomePage/HomePage';
import ArticlePage from './components/ArticlePage/ArticlePage';
import UserPage from './components/UserPage/UserPage';
import UserProfilePage from './components/UserProfilePage/UserProfilePage';

const menuItems = [
  new MainMenuItem("Home", "/"),
  new MainMenuItem("App", "/user"),
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
      </Switch>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
reportWebVitals();
