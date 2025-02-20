import React, { useEffect, useState } from "react";
import { ApiResponse, useApi } from "../../../API/api";
import { useNavigate, useParams } from "react-router-dom";
import UserType from "../../../types/UserType";
import { useUserContext } from "../../Contexts/UserContext/UserContext";
import { UserRole } from "../../../types/UserRoleType";
import ResponsibilityArticles from "./components/ResponsibilityArticles";
import UserTickets from "./components/UserTickets";
import UserDetails from "./components/UserDetails";
import { Tabs, Spin, Card } from "antd";

const { TabPane } = Tabs;

const AdminUserProfilePage: React.FC = () => {
  const { api } = useApi();
  const { userID } = useParams();
  const { role, userId } = useUserContext();
  const [user, setUser] = useState<UserType>({});
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const getUserData = async () => {
    try {
      setLoading(true);

      const res: ApiResponse = await api(
        `api/user/${userID}`,
        "get",
        {},
        role as UserRole
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
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Spin size="large" tip="Učitavanje..." />
        </div>
      ) : (
        <Card>
            <Tabs defaultActiveKey="profile" >
              <TabPane tab="Profil" key="profile">
                  <UserDetails data={user} />
              </TabPane>
              <TabPane tab="Zaduženi artikli" key="zaduzeni-artikli">
                <ResponsibilityArticles userID={Number(userID)} />
              </TabPane>
              {user.userId === userId && (
                <TabPane tab="Helpdesk" key="tiketi" >
                  <UserTickets userID={Number(userID)} />
                </TabPane>
              )}
            </Tabs>

        </Card>
      )}
    </>
  );
};

export default AdminUserProfilePage;
