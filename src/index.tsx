import React, { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap-icons/font/bootstrap-icons.css";
import reportWebVitals from "./reportWebVitals";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Layout, ConfigProvider, theme } from "antd";
import 'antd/dist/reset.css';
import hrHR from "antd/lib/locale/hr_HR";
import { NextUIProvider } from "@nextui-org/react";
import { UserContextProvider, useUserContext } from "./components/UserContext/UserContext";
import CategoryPage from "./components/APP/Categories/Categories";
import HomePage from "./components/APP/Home/HomePage";
import ArticleOnUserPage from "./components/APP/ArticleOnUser/ArticleOnUserPage";
import AdminArticleOnUserPage from "./components/admin/ArticleOnUser/ArticleOnUserPage";
import AdminUserProfilePage from "./components/APP/UserProfile/UserProfilePage";
import AddArticlePage from "./components/admin/AddArticle/AddArticlePage";
import AddUserPage from "./components/admin/AddUser/AddUserPage";
import AddFeaturePage from "./components/admin/AddFeature/AddFeaturePage";
import AddNewCategoryPage from "./components/admin/AddCategory/AddCategoryPage";
import AddDepartmentAndJob from "./components/admin/AddDepartmentJobLocation/AddDepartmetAndJob";
import StockPage from "./components/APP/Stock/StockPage";
import AdminDocumentsPage from "./components/admin/Documents/AdminDocumentsPage";
import LoginPage from "./components/Login/LoginPage";
import AdminDashboardPage from "./components/admin/Dashboard/DashboardPage";
import HelpdeskTicketPage from "./components/admin/HelpDesk/main/HelpdeskTicketPage";
import ArticlePage from "./components/admin/Dashboard/Article/ArticlePage";
import TelecomInvoice from "./components/APP/TelecomInvoices/TelecomInvoice";
import InvoiceList from "./components/admin/Invoices/InvoiceList";
import Printers from "./components/admin/Invoices/Printers";
import RoledMainMenu from "./components/RoledMainMenu/RoledMainMenu";
import { themeToken } from "./config/theme.token.config";
import { NotificationProvider } from "./components/Notification/NotificationContext";
import SpeedDial from "./components/SpeedDial/SpeedDial";
import BackgroundParticles from "./components/custom/BackgroundParticles";

const { Content, Footer } = Layout;

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const curentYear = new Date().getFullYear();
  const {isAuthenticated, role} = useUserContext()

  return (
  <Layout className="min-h-screen ">
    {isAuthenticated && (
      <div className="sticky-header">
        <RoledMainMenu />
    </div>
    )}
    <Content className="container mx-auto p-4">
      {children}
    </Content>
    
    <Footer className="text-center text-gray-400">Inventory Database v1.3.6 ©{curentYear} Created by Mudžahid Cerić {(isAuthenticated && role !== 'user') && <SpeedDial />} </Footer>
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
                  <Route path="/admin/article/:serial" element={<AdminArticleOnUserPage />} />
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
  createRoot(rootElement).render(<>
  <BackgroundParticles />
  <App />
  </>
);
} else {
  console.error("Element with id 'root' not found.");
}

reportWebVitals();
