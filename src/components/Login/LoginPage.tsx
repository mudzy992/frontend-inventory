import React from "react";
import UserLoginPage from "./UserLoginPage";
import { Card } from "antd";

const LoginPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-8">
      <div className="col-span-4 col-start-5 w-full sm:max-w-md md:mt-0 xl:p-0">
        <div className="mb-2 ">
          <span className="text-5xl lg:text-6xl bg-gradient-to-r from-teal-400 to-yellow-200 bg-clip-text text-transparent">
            {" "}
            <i className="bi bi-incognito incognito-icon" />
            Inventory
          </span>{" "}
          database v1.9.9
        </div>
        <Card>
          <UserLoginPage />
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
