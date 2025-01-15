import React, { useEffect } from "react";
import UserLoginPage from "./UserLoginPage";
import { Card } from "antd";
import { useUserContext } from "../UserContext/UserContext";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const {isAuthenticated} = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    if(isAuthenticated){
      navigate('/')
    }
  },[])
  return (
    <>
    {!isAuthenticated && (
      <div className="flex flex-col items-center justify-center px-6 py-8">
        <div className="col-span-4 col-start-5 w-full sm:max-w-md md:mt-0 xl:p-0">
          <div className="mb-3 text-xs lg:text-sm">
            <span className="text-5xl lg:text-6xl bg-gradient-to-r from-teal-400 to-yellow-200 bg-clip-text text-transparent">
              {" "}
              <i className="bi bi-incognito incognito-icon" />
              Inventory
            </span>{" "}
            DB
          </div>
          <Card className="shadow-2xl shadow-teal-900 rounded-2xl">
            <UserLoginPage />
          </Card>
        </div>
      </div>
      )}
    </>
    
  );
};

export default LoginPage;
