import React from "react";
import { Card, CardBody } from "@nextui-org/react";
import UserLoginPage from "./UserLoginPage";

const LoginPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-8">
      <div className="col-span-4 col-start-5 w-full sm:max-w-md md:mt-0 xl:p-0">
        <div className="mb-2 bg-gradient-to-r from-teal-400 to-yellow-200 bg-clip-text text-transparent">
          <span className="text-5xl lg:text-6xl">
            {" "}
            <i className="bi bi-incognito incognito-icon" />
            Inventory
          </span>{" "}
          database
        </div>
        <Card>
          <CardBody>
            <UserLoginPage />
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
