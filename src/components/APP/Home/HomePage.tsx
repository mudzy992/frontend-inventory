import React, { useEffect, useState } from "react";
import { ApiResponse, useApi } from "../../../API/api";
import CategoryType from "../../../types/CategoryType";
import { Card, Row, Col, Typography } from "antd";
import AllUsersTable from "../Users/AllUsersTable";
import { UserRole } from "../../../types/UserRoleType";
import { useUserContext } from "../../Contexts/UserContext/UserContext";
import { useNotificationContext } from "../../Contexts/Notification/NotificationContext";

const { Title } = Typography;

interface HomePageState {
  categories?: CategoryType[];
}

interface CategoryDto {
  categoryId: number;
  name: string;
  imagePath: string;
}

const HomePage: React.FC<HomePageState> = () => {
  const { api } = useApi();
  const {warning} = useNotificationContext();
  const { role, isAuthenticated } = useUserContext();
  const [categories, setCategories] = useState<CategoryType[]>([]);

  const putCategoriesInState = (data: CategoryDto[]) => {
    const categories: CategoryType[] = data.map((category) => {
      return {
        categoryId: category.categoryId,
        name: category.name,
        imagePath: category.imagePath,
      };
    });
    setCategories(categories)
  };

  useEffect(() => {
    api(
      "api/category/?filter=parentCategoryId||$eq||null",
      "get",
      {},
      role as UserRole
    )
      .then((res: ApiResponse) => {
        if(res.status === 'ok'){
          const filteredCategories: CategoryDto[] = res.data.filter(
            (category: any) => category.parentCategoryId === null
          );
          putCategoriesInState(filteredCategories);
          return;
        }
      })
      .catch((err) => {
        warning.notification('Greška prilikom dohvaćanja podataka');
      });
  }, []);

  return (
    <>
      {isAuthenticated && (
        <>
            <div className="">
              <div>
                {<AllUsersTable />}
              </div>

              <Title level={5} className="ml-2 mt-3">
                <i className="bi bi-card-list" /> Kategorije artikala
              </Title>

              <Row gutter={[16, 16]} className="ml-2 mr-2">
                {categories &&
                  categories.map((category) => (
                    <Col xs={12} sm={8} md={6} lg={4} key={category.categoryId}>
                      <Card
                        className="pt-7"

                        hoverable
                        cover={
                          <i
                            className={`bg-gradient-to-r from-teal-400 to-yellow-200 bg-clip-text text-transparent ${category.imagePath}`}
                            style={{
                              fontSize: 60,
                              display: "flex",
                              justifyContent: "center",
                            }}
                          />
                        }
                        onClick={() =>
                          (window.location.href = `#/category/${category.categoryId}`)
                        }
                      >
                        <Card.Meta title={category.name} />
                      </Card>
                    </Col>
                  ))}
              </Row>
            </div>
        </>
      )}
    </>
  );

};

export default HomePage;
