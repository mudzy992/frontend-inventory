import { Card, Tabs } from "antd";
import React from "react";
import AddDepartment from "./AddDepartment/AddDepartment";
import AddJob from "./AddJob/AddJob";
import AddLocation from "./AddLocation/AddLocation";
import ConnectDepartmentJobLocation from "./ConnectDepartmentJobLocation/Connect";

const { Tab } = Tabs;

const MainAddDepartmentJobLocation: React.FC = () => {
  return (
    <Card title="Dodaj novi sektor/odjeljenje/službu, radno mjesto ili lokaciju">
      <Tabs defaultActiveKey="1">
        <Tab key="1" tab="Sektor/odjeljenje/služba">
          <p>
            Ovdje možete dodati novi sektor, odjeljenje ili službu. Obavezna
            polja uključuju naziv, opis i šifru organizacijske jedinice. Ako
            služba ili odjeljenje pripadaju nekom sektoru, odaberite odgovarajući
            sektor u polju "Pripada sektoru/službi".
          </p>
          <AddDepartment />
        </Tab>
        <Tab key="2" tab="Radno mjesto">
          <p>
            Ovdje možete dodati novo radno mjesto. Unesite naziv, opis i šifru
            radnog mjesta kako bi se dodalo u aplikaciju.
          </p>
          <AddJob />
        </Tab>
        <Tab key="3" tab="Lokacija">
          <p>
            Ovdje možete dodati novu lokaciju ako još nije dodana. Unesite
            naziv, šifru lokacije, a ako lokacija pripada glavnoj lokaciji,
            odaberite je u odgovarajućem polju.
          </p>
          <AddLocation />
        </Tab>
        <Tab key="4" tab="Poveži sektor/odjeljenje/služba, radno mjesto i lokaciju">
          <p>
            Ovdje možete povezati sektor/odjeljenje/službu sa radnim
            mjestom i lokacijom. Svako radno mjesto treba biti povezano s
            odgovarajućim sektorom/odjeljenjem/službom i lokacijom kojoj to
            radno mjesto pripada.
          </p>
          <ConnectDepartmentJobLocation />
        </Tab>
      </Tabs>
    </Card>
  );
};

export default MainAddDepartmentJobLocation;
