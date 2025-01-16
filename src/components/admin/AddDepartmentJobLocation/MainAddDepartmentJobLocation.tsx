import { Card } from "antd";
import React from "react";
import AddDepartment from "./AddDepartment/AddDepartment";
import AddJob from "./AddJob/AddJob";
import AddLocation from "./AddLocation/AddLocation";
import ConnectDepartmentJobLocation from "./ConnectDepartmentJobLocation/Connect";

const MainAddDepartmentJobLocation: React.FC = () => {
  return (
    <div className="flex flex-col gap-3">
      <Card>
        <AddDepartment />
      </Card>
      <Card>
        <AddJob />
      </Card>
      <Card>
        <AddLocation />
      </Card>
      <Card>
        <ConnectDepartmentJobLocation />
      </Card>

    </div>
  );
};
export default MainAddDepartmentJobLocation;
