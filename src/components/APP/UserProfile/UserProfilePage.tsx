import React, { useEffect, useState } from "react";
import api, { ApiResponse } from "../../../API/api";
import { useNavigate, useParams } from "react-router-dom";
import RoledMainMenu from "../../RoledMainMenu/RoledMainMenu";
import UserType from "../../../types/UserType";
import { useUserContext } from "../../UserContext/UserContext";
import { UserRole } from "../../../types/UserRoleType";
import UserDetails from "./components/UserDetails";
import ResponsibilityArticles from "./components/ResponsibilityArticles";
import { Card, CardBody, Spinner, Tab, Tabs } from "@nextui-org/react";
import UserTickets from "./components/UserTickets";

const AdminUserProfilePage: React.FC = () => {
  const { userID } = useParams();
  const { role, userId } = useUserContext();
  const [user, setUser] = useState<UserType>({});
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const getUserData = async () => {
    try {
      setLoading(true);

      const res: ApiResponse = await api(
        "api/user/" + userID,
        "get",
        {},
        role as UserRole,
      );

      if (res.status === "error" || res.status === "login") {
        return navigate("/login");
      }

      const data: UserType = res.data;
      setUser(data);

      return data;
    } catch (error) {
      console.error("Greška prilikom dohvatanja korisničkih podataka:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <>
      <RoledMainMenu />
      {loading ? (
        <div className="container mx-auto flex items-center justify-center">
          <Spinner label="Učitavanje..." labelColor="warning" color="warning" />
        </div>
      ) : (
        <div className="container mx-auto mt-3 h-max">
          <Tabs
            id="left-tabs-example"
            aria-label="Options"
            className="ml-1 mr-1"
          >
            <Tab key="profile" title="Profil">
              <Card>
                <CardBody>
                  <UserDetails data={user} />
                </CardBody>
              </Card>
            </Tab>
            <Tab key="zaduzeni-artikli" title="Zaduženi artikli">
              <ResponsibilityArticles data={user} />
            </Tab>
            <Tab className={user.userId !== userId ? "hidden" : "block"} key="tiketi" title="Helpdesk">
              <UserTickets data={user} />
            </Tab>
          </Tabs>
        </div>
      )}
    </>
  );
};
export default AdminUserProfilePage;
