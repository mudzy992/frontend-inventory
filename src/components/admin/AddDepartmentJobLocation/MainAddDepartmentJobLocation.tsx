import { Card, Tabs } from "antd";
import React from "react";
import AddDepartment from "./AddDepartment/AddDepartment";
import AddJob from "./AddJob/AddJob";
import AddLocation from "./AddLocation/AddLocation";
import ConnectDepartmentJobLocation from "./ConnectDepartmentJobLocation/Connect";

const { Tab } = Tabs;

const MainAddDepartmentJobLocation: React.FC = () => {
  return (
    <Card title="Dodaj novi sektor/odjeljenj/službu, radno mjesto ili lokaciju">
      <Tabs defaultActiveKey="1">
        <Tab key="1" tab="Sektor/odjeljenje/slućba">
          <AddDepartment />
        </Tab>
        <Tab key="2" tab="Radno mjesto">
          <AddJob />
        </Tab>
        <Tab key="3" tab="Lokacija">
          <AddLocation />
        </Tab>
        <Tab key="4" tab="Poveži sektor/odjeljenje/služba, radno mjesto i lokaciju">
          <ConnectDepartmentJobLocation />
        </Tab>
      </Tabs>
    </Card>
  );
};

export default MainAddDepartmentJobLocation;
