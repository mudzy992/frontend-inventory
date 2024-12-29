import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { ApiResponse } from "../../../API/api";
import CategoryType from "../../../types/CategoryType";
import AdminMenu from "../../admin/AdminMenu/AdminMenu";
import { Card, Row, Col, Typography } from "antd";
import AllUsersTable from "../Users/AllUsersTable";

const { Title } = Typography;

interface HomePageState {
  categories?: CategoryType[];
  isLoggedIn?: boolean;
  message?: string;
}

interface CategoryDto {
  categoryId: number;
  name: string;
  imagePath: string;
}

const HomePage: React.FC<HomePageState> = () => {
  const [state, setState] = useState<HomePageState>({
    categories: [],
    isLoggedIn: true,
    message: "",
  });

  const navigate = useNavigate();

  const setLogginState = (isLoggedIn: boolean) => {
    setState({ ...state, isLoggedIn: isLoggedIn });
    if (isLoggedIn === false) {
      navigate("/login");
    }
  };

  const putCategoriesInState = (data: CategoryDto[]) => {
    const categories: CategoryType[] = data.map((category) => {
      return {
        categoryId: category.categoryId,
        name: category.name,
        imagePath: category.imagePath,
      };
    });
    setState({ ...state, categories: categories });
  };

  useEffect(() => {
    api(
      "api/category/?filter=parentCategoryId||$eq||null",
      "get",
      {},
      "administrator"
    )
      .then((res: ApiResponse) => {
        if (res.status === "login") {
          setLogginState(false);
          return;
        }

        if (res.status === "error") {
          console.error("API error:", res.data);
          setLogginState(false);
          return;
        }

        const filteredCategories: CategoryDto[] = res.data.filter(
          (category: any) => category.parentCategoryId === null
        );

        putCategoriesInState(filteredCategories);
      })
      .catch((error) => {
        console.error("Error during API call:", error);
        setLogginState(false);
      });
  }, []);

  return (
    <>
      <div className="container mx-auto mt-3 h-max lg:px-4">
        <div className="">
          <div className="ml-2 mr-2">{<AllUsersTable />}</div>

          <Title level={5} className="ml-3 mt-3">
            <i className="bi bi-card-list" /> Top level kategorije
          </Title>

          <Row gutter={[16, 16]} className="ml-2 mr-2">
            {state.categories &&
              state.categories.map((category) => (
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
            <p>{state.message}</p>
          </Row>
        </div>
      </div>
      <AdminMenu />
    </>
  );
};

export default HomePage;
