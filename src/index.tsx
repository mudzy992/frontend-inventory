import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import reportWebVitals from "./reportWebVitals";
import { HashRouter, Routes, Route } from "react-router-dom";
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
import { NextUIProvider } from "@nextui-org/react";
import StockPage from "./components/APP/Stock/StockPage";
import DocumentsPage from "./components/APP/Documents/DocumentPage";
import LoginPage from "./components/Login/LoginPage";
import LogOutPage from "./components/Logout/LogoutPage";
import { UserContextProvider } from "./components/UserContext/UserContext";
import AdminDashboardPage from "./components/admin/Dashboard/DashboardPage";
import HelpdeskTicketPage from "./components/admin/HelpDesk/main/HelpdeskTicketPage";
import ArticlePage from "./components/admin/Dashboard/Article/ArticlePage";

const rootElement = document.getElementById("root");

const App = () => {
  return (
    <React.StrictMode>
      <NextUIProvider>
        <UserContextProvider>
          <main className="min-w-screen min-h-screen bg-background pb-4 text-foreground dark">
            {/* mehanizam rutiranja */}
            <HashRouter>
              <Routes>
                {/* master login */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/logout" element={<LogOutPage />} />
                <Route path="/user/article/:serial" element={<ArticleOnUserPage />}/>
                <Route path="/admin/article/:serial" element={<AdminArticleOnUserPage />}/>
                <Route path="/user/profile/:userID" element={<AdminUserProfilePage />}/>
                <Route path="/" element={<HomePage />} />
                <Route path="/category/:categoryID" element={<CategoryPage />} />
                <Route path="/admin/article/" element={<ArticlePage />} />
                <Route path="/admin/article/add" element={<AddArticlePage />} />
                <Route path="/admin/user/" element={<AddUserPage />} />
                <Route path="/admin/feature/" element={<AddFeaturePage />} />
                <Route path="/admin/category/" element={<AddNewCategoryPage />}/>
                <Route path="/admin/department/" element={<AddDepartmentAndJob />}/>
                <Route path="/admin/document/" element={<DocumentsPage />} />
                <Route path="/admin/stock/:stockID" element={<StockPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />}/>
                <Route path="/admin/helpdesk" element={<HelpdeskTicketPage />} />
              </Routes>
            </HashRouter>
          </main>
        </UserContextProvider>
      </NextUIProvider>
    </React.StrictMode>
  );
};

if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error("Element with id 'root' not found.");
}
reportWebVitals();
