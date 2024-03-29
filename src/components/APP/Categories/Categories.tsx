import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../API/api";
import StockType from "../../../types/UserArticleType";
import RoledMainMenu from "../../RoledMainMenu/RoledMainMenu";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Spinner,
} from "@nextui-org/react";
import Tabela from "./TableFunction";
import { Alert } from "../../custom/Alert";

interface CategoryPageState {
  category?: CategoryType;
  subCategory: CategoryType[];
  message: string;
  stocks: StockType[];
}

interface CategoryDto {
  categoryId: number;
  name: string;
  imagePath: string;
  stocks: {
    stockId: number;
    name: string;
    excerpt: string;
    description: string;
    concract: string;
    categoryId: number;
    sapNumber: string;
    valueOnContract: number;
    valueAvailable: number;
    timestamp: string;
  }[];
}

interface CategoryType {
  categoryId?: number;
  name?: string;
  imagePath?: string;
  stocks?: {
    stockId: number;
    name: string;
    excerpt: string;
    description: string;
    concract: string;
    categoryId: number;
    sapNumber: string;
    valueOnContract: number;
    valueAvailable: number;
    timestamp: string;
  }[];
}

const CategoryPage: React.FC = () => {
  const { categoryID } = useParams<{ categoryID: string }>();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<CategoryPageState>({
    subCategory: [],
    message: "",
    stocks: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const getCategoriesData = async () => {
      setLoading(true);
      try {
        const response = await api(
          `api/category/${categoryID}`,
          "get",
          {},
          "administrator",
        );
        if (response.status === "login") {
          navigate("/login");
          return;
        }

        if (response.status === "error") {
          return setErrorMessage(
            "Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije",
          );
        }

        const categoryData: CategoryType = {
          categoryId: response.data.categoryId,
          name: response.data.name,
          imagePath: response.data.imagePath,
          stocks: response.data.stocks,
        };

        setCategoryData(categoryData);

        const subcategories: CategoryType[] = response.data.categories.map(
          (category: CategoryDto) => ({
            categoryId: category.categoryId,
            name: category.name,
            imagePath: category.imagePath,
            stocks: category.stocks,
          }),
        );
        setSubcategories(subcategories);
        setLoading(false);
      } catch (error) {
        return setErrorMessage(
          "Greška prilikom učitavanja pod-kategorije. Osvježite ili pokušajte ponovo kasnije. Greška: " +
            error,
        );
      }
    };

    getCategoriesData();
  }, [categoryID]);

  const setErrorMessage = (message: string) => {
    setState((prevState) => ({ ...prevState, message }));
  };

  const setCategoryData = (category: CategoryType) => {
    setState((prevState) => ({ ...prevState, category }));
  };

  const setSubcategories = (subcategories: CategoryType[]) => {
    setState((prevState) => ({ ...prevState, subCategory: subcategories }));
  };

  const printErrorMessage = () => {
    if (!state.message) {
      return null;
    }
    return <Alert variant="warning" title="Upozorenje!" body={state.message} />;
  };

  const showSubcategories = () => {
    if (state.subCategory.length === 0) {
      return (
        <div className="mb-4 mt-4">
          <Alert variant="info" body="Nema podkategorija" />
        </div>
      );
    }

    return (
      <div className="ml-2 mr-2">
        <h5 style={{ color: "white" }}>
          <i className="bi bi-list-nested" /> Podkategorije
        </h5>
        {printErrorMessage()}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-3 lg:grid-cols-5 lg:gap-3">
          {state.subCategory.map(singleCategory)}
        </div>
      </div>
    );
  };

  const singleCategory = (category: CategoryType) => (
    <Card
      className="mt-3"
      key={category.categoryId}
      isPressable
      onPress={() =>
        (window.location.href = `#/category/${category.categoryId}`)
      }
    >
      <CardHeader>{category.name}</CardHeader>
      <CardBody>
        <i
          className={`bg-gradient-to-r from-teal-400 to-yellow-200 bg-clip-text text-transparent ${category.imagePath}`}
          style={{ fontSize: 60, display: "flex", justifyContent: "center" }}
        />
      </CardBody>
      <CardFooter className="flex justify-center"></CardFooter>
    </Card>
  );

  const showArticles = () => {
    if (!state.category || state.category.stocks?.length === 0) {
      return (
        <Alert
          variant="info"
          title="Info!"
          body="Nema opreme definisane za ovu kategoriju"
        />
      );
    }

    return <Tabela categoryId={categoryID} />;
  };

  return (
    <div>
      <RoledMainMenu />
      <div className="container mx-auto mt-3 h-max lg:px-4">
        {loading ? (
          <div className="flex items-center justify-center">
            <Spinner
              label="Učitavanje..."
              labelColor="warning"
              color="warning"
            />
          </div>
        ) : (
          <>
            <div
              className={
                state.category?.stocks?.length &&
                state.category.stocks.length > 0
                  ? "mt-3"
                  : "hidden"
              }
            >
              <h5 style={{ color: "white" }}>
                <i className="bi bi-list" />
                {state.category?.name}
              </h5>
              <div>{showArticles()}</div>
            </div>
            <div>{showSubcategories()}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
