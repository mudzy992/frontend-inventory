import React, { useEffect, useState } from "react";
import api, { ApiResponse } from '../../../API/api';
import { useNavigate, useParams } from 'react-router-dom';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import UserType from "../../../types/UserType";
import { useUserContext } from "../../UserContext/UserContext";
import { UserRole } from "../../../types/UserRoleType";
import UserDetails from "./components/UserDetails";
import ResponsibilityArticles from "./components/ResponsibilityArticles";
import { Card, CardBody, Tab, Tabs } from "@nextui-org/react";

const AdminUserProfilePage: React.FC = () => {
    const { userID } = useParams();
    const { role } = useUserContext()
    const [user, setUser] = useState<UserType>({})


    const navigate = useNavigate();
    const getUserData = async () => {
        try {
          const res: ApiResponse = await api('api/user/' + userID, 'get', {}, role as UserRole);
      
          if (res.status === 'error') {
            return navigate('/login');
          }
      
          if (res.status === 'login') {
            return navigate('/login');
          }
      
          const data: UserType = res.data;
          setUser(data);      
          return data;
        } catch (error) {
          console.error('Greška prilikom dohvatanja korisničkih podataka:', error);
          throw error;
        }
      };     

      useEffect(() => {
        getUserData();
      }, []);

    return (
        <>
          <RoledMainMenu/>
            <div className="container mx-auto mt-3 h-max">
                <Tabs id="left-tabs-example" aria-label="Options" className="mr-1 ml-1">
                    <Tab key='profile' title='Profil'>
                        <Card>
                            <CardBody>
                              <UserDetails data={user} />
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key='zaduzeni-artikli' title='Zaduženi artikli'>
                      <ResponsibilityArticles data={user} />
                    </Tab>
                </Tabs>
          </div>
      </>            
    )     
}
export default AdminUserProfilePage;