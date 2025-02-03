import React, { ReactNode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap-icons/font/bootstrap-icons.css";
import reportWebVitals from "./reportWebVitals";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import { Layout, ConfigProvider, theme, Menu, Button } from "antd";
import 'antd/dist/reset.css';
import hrHR from "antd/lib/locale/hr_HR";
import { NextUIProvider } from "@nextui-org/react";
import { UserContextProvider, useUserContext } from "./components/Contexts/UserContext/UserContext";
import CategoryPage from "./components/APP/Categories/Categories";
import HomePage from "./components/APP/Home/HomePage";
import ArticleOnUserPage from "./components/APP/ArticleOnUser/ArticleOnUserPage";
import AdminArticleOnUserPage from "./components/admin/ArticleOnUser/ArticleOnUserPage";
import AdminUserProfilePage from "./components/APP/UserProfile/UserProfilePage";
import AddArticlePage from "./components/admin/AddArticle/AddArticlePage";
import AddUserPage from "./components/admin/AddUser/AddUserPage";
import AddFeaturePage from "./components/admin/AddFeature/AddFeaturePage";
import AddNewCategoryPage from "./components/admin/AddCategory/AddCategoryPage";
import AddDepartmentAndJob from "./components/admin/AddDepartmentJobLocation/MainAddDepartmentJobLocation";
import StockPage from "./components/APP/Stock/StockPage";
import AdminDocumentsPage from "./components/admin/Documents/AdminDocumentsPage";
import LoginPage from "./components/Login/LoginPage";
import AdminDashboardPage from "./components/admin/Dashboard/DashboardPage";
import HelpdeskTicketPage from "./components/admin/HelpDesk/main/HelpdeskTicketPage";
import ArticlePage from "./components/admin/Dashboard/Article/ArticlePage";
import TelecomInvoice from "./components/APP/TelecomInvoices/TelecomInvoice";
import InvoiceList from "./components/admin/Invoices/InvoiceList";
import Printers from "./components/admin/Invoices/Printers";
import { NotificationProvider } from "./components/Contexts/Notification/NotificationContext";
import { Header } from "antd/es/layout/layout";

import { MenuFoldOutlined, MenuUnfoldOutlined, } from '@ant-design/icons';
import SiderNavigationMenu from "./components/SiderNavigationMenu/SiderNavigationMenu";
import UserDropdown from "./components/SiderNavigationMenu/UserDropDownMenu";
import ArticleComponent from "./components/admin/Article/ArticleComponent";

const { Content, Footer, Sider } = Layout;

interface AppLayoutProps {
  children: ReactNode;
}

const siderStyle: React.CSSProperties = {
  overflow: 'auto',
  height: '100vh',
  position: 'sticky',
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable',
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const curentYear = new Date().getFullYear();
  const {isAuthenticated, role} = useUserContext()
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  

  return (
  
  <Layout className="min-h-screen ">
    {isAuthenticated && (
      <div>
        <Sider
          collapsible
          collapsed={collapsed}
          trigger={null}
          style={siderStyle}
          className={`bg-[#141414] transition-all duration-300 ${isMobile && "fixed top-0 left-0 h-full z-50"}`}
          breakpoint="lg"
          collapsedWidth={isMobile ? 0 : 70}
          onBreakpoint={(broken) => {
            setCollapsed(true)
          }}
          onCollapse={(collapsed, type) => {
            setCollapsed(collapsed);
          }}
          onMouseEnter={() => {
            if (!isMobile) setCollapsed(false);
          }}
          onMouseLeave={() => {
            if (!isMobile) setCollapsed(true);
          }}
          width={250}
        >
          <SiderNavigationMenu collapsed={collapsed} setCollapsed={setCollapsed}/>
        </Sider>

        {isMobile && !collapsed && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40" 
              onClick={() => setCollapsed(true)}
            />
          )}
      </div>
    )}
    <Layout>
      <Header className={`h-14 sticky-header flex flex-row justify-between items-center transition-all duration-300 ${isAuthenticated ? "block" : 'hidden'} ${isAuthenticated && isMobile && !collapsed ? "blur-sm" : ""}`}>
        <div>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className={isAuthenticated && isMobile ? 'flex items-center font-lg' : 'hidden' }
            style={{
              fontSize: '16px',
            }}
          />
        
        </div>
        <span className="font-bold text-xl"><Link to='/'>Inventory database</Link></span>
        <div>
          <UserDropdown />
        </div>
      </Header>
    
      <Content className={`container mx-auto px-4 py-4 transition-all duration-300 ${isAuthenticated && isMobile && !collapsed ? "blur-sm" : ""}`}>
        {children}
      </Content>

    
    <Footer className={`text-center text-gray-400 z-10 transition-all duration-300 ${isAuthenticated && isMobile && !collapsed ? "blur-sm" : ""}`}>Inventory Database v1.3.6 ©{curentYear} Created by Mudžahid Cerić </Footer>
  </Layout>
  </Layout>
)};

const App = () => {
  return (
    <React.StrictMode>
      <NextUIProvider>
        
      <ConfigProvider
          locale={hrHR}
          theme={{
            "token": {
              "colorPrimary": "#33bcb7",
              "colorInfo": "#1668dc",
              "colorSuccess": "#3c8618",
              "colorLink": "#b2f1e8",
              "wireframe": false
            },
            "components": {
              "Button": {
                "borderRadius": 15,
                "controlHeight": 40
              },
              "Input": {
                "borderRadius": 12,
                "controlHeight": 44,
              },
              "Select": {
                "borderRadius": 12,
                "controlHeight": 44,
              },
              "Tag": {
                "borderRadius":20
              },
              "Card": {
                "padding": 5,
                "paddingLG": 14
              }
            },
            "algorithm": theme.darkAlgorithm
          }}
        >

            <HashRouter>
            <UserContextProvider>
              <NotificationProvider>
              <AppLayout>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/user/article/:serial" element={<ArticleOnUserPage />} />
                  <Route path="/admin/article/s/:serial" element={<AdminArticleOnUserPage />} />
                  <Route path="/user/profile/:userID" element={<AdminUserProfilePage />} />
                  <Route path="/" element={<HomePage />} />
                  <Route path="/category/:categoryID" element={<CategoryPage />} />
                  <Route path="/admin/article/" element={<ArticlePage />} />
                  <Route path="/admin/article/add" element={<AddArticlePage />} />
                  <Route path="/admin/user/" element={<AddUserPage />} />
                  <Route path="/admin/feature/" element={<AddFeaturePage />} />
                  <Route path="/admin/category/" element={<AddNewCategoryPage />} />
                  <Route path="/admin/department/" element={<AddDepartmentAndJob />} />
                  <Route path="/admin/documents/" element={<AdminDocumentsPage />} />
                  <Route path="/admin/stock/:stockID" element={<StockPage />} />
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/helpdesk" element={<HelpdeskTicketPage />} />
                  <Route path="/admin/invoices" element={<InvoiceList />} />
                  <Route path="/admin/invoices/:invoiceId/printers" element={<Printers />} />
                  <Route path="/admin/telecom" element={<TelecomInvoice />} />
                  <Route path="/admin/article/:serial" element={<ArticleComponent />} />
                </Routes>
              </AppLayout>
              </NotificationProvider>
              </UserContextProvider>
            </HashRouter>
          </ConfigProvider>
      </NextUIProvider>
    </React.StrictMode>
  );
};

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error("Element with id 'root' not found.");
}

reportWebVitals();
