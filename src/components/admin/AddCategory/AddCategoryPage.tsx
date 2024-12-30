import React, { useEffect, useState } from "react";
import { ApiResponse, useApi } from "../../../API/api";
import RoledMainMenu from "../../RoledMainMenu/RoledMainMenu";
import CategoryType from "../../../types/CategoryType";
import AdminMenu from "../AdminMenu/AdminMenu";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Spinner,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import Toast from "../../custom/Toast";

interface AddCategoryPageState {
  categories: CategoryType[];
  message: { message: string; variant: string };
  isLoggedIn: boolean;
  addNewCategory: {
    name: string;
    parentCategoryId: number;
    imagePath: string;
  };
}

const AddNewCategoryPage: React.FC = () => {
  const { api } = useApi();
  const [state, setState] = useState<AddCategoryPageState>({
    categories: [],
    message: { message: "", variant: "" },
    isLoggedIn: true,
    addNewCategory: {
      name: "",
      imagePath: "",
      parentCategoryId: 0,
    },
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    getCategories();
  }, []);

  const setAddNewCategoryStringState = (
    fieldName: string,
    newValue: string,
  ) => {
    setState((prev) => ({
      ...prev,
      addNewCategory: { ...prev.addNewCategory, [fieldName]: newValue },
    }));
  };

  const setAddNewCategoryNumberState = (fieldName: string, newValue: any) => {
    setState((prev) => ({
      ...prev,
      addNewCategory: {
        ...prev.addNewCategory,
        [fieldName]: newValue === "null" ? null : Number(newValue),
      },
    }));
  };

  const setErrorMessage = (message: string, variant: string) => {
    setState((prev) => ({
      ...prev,
      message: { message, variant },
    }));
  };

  const setIsLoggedInStatus = (isLoggedIn: boolean) => {
    setState((prev) => ({ ...prev, isLoggedIn: isLoggedIn }));

    if (isLoggedIn === false) {
      navigate("/login/");
    }
  };

  const setCategoryData = (category: CategoryType) => {
    setState(
      Object.assign(state, {
        categories: category,
      }),
    );
  };

  /* GET */

  const getCategories = async () => {
    try {
      setLoading(true);

      const res = await api("api/category/", "get", {}, "administrator");

      if (res.status === "login") {
        setIsLoggedInStatus(false);
        return;
      }

      if (res.status === "error") {
        setErrorMessage(
          "Greška prilikom učitavanja kategorija, osvježite stranicu i pokušajte ponovo.",
          "danger",
        );
        return;
      }

      setCategoryData(res.data);
      setLoading(false);
    } catch (error) {
      setErrorMessage(
        "Došlo je do greške prilikom učitavanja kategorija, osvježite stranicu i pokušajte ponovo.",
        "danger",
      );
      setLoading(false);
    }
  };

  const doAddCategory = () => {
    api("api/category/", "post", state.addNewCategory, "administrator").then(
      (res: ApiResponse) => {
        if (res.status === "login") {
          setIsLoggedInStatus(false);
          return;
        }
        if (res.status === "error") {
          setErrorMessage(
            "Greška prilikom dodavanja kategorije, pokušajte ponovo.",
            "danger",
          );
          return;
        }
        setErrorMessage("Kategorija je uspješno dodana.", "success");
      },
    );
  };

  const addForm = () => {
    return (
      <div>
        {loading ? (
          <div className="flex h-screen items-center justify-center">
            <Spinner color="success" />
          </div>
        ) : (
          <Card className="mb-3">
            <CardHeader>Detalji kategorije</CardHeader>
            <CardBody>
              <div className="flex flex-col">
                <div className="mb-3 mr-3 w-full">
                  <Input
                    id="name"
                    type="text"
                    label="Nova kategorija (naziv)"
                    labelPlacement="inside"
                    value={state.addNewCategory.name}
                    onChange={(e) =>
                      setAddNewCategoryStringState("name", e.target.value)
                    }
                  ></Input>
                </div>
                <div className="mb-3 mr-3 w-full">
                  <Input
                    id="imagePath"
                    type="text"
                    label="Ikona kategorije"
                    labelPlacement="inside"
                    value={state.addNewCategory.imagePath}
                    onChange={(e) =>
                      setAddNewCategoryStringState("imagePath", e.target.value)
                    }
                  ></Input>
                  <p className="pl-3 pt-3 text-sm text-default-500">
                    Ikonu kategorije pronaći{" "}
                    <a
                      href="https://icons.getbootstrap.com/"
                      target={"_blank"}
                      rel={"noreferrer"}
                    >
                      ovjde
                    </a>{" "}
                    te kopirati class. Primjer{" "}
                    <i style={{ color: "red" }}>"bi bi-align-center"</i>
                  </p>
                </div>
                <div className="w-full lg:flex">
                  <Select
                    id="categoryId"
                    label="Podkategorija"
                    placeholder="Odaberite podkategoriju"
                    onChange={(e) =>
                      setAddNewCategoryNumberState(
                        "parentCategoryId",
                        e.target.value,
                      )
                    }
                  >
                    {state.categories.map((category, index) => (
                      <SelectItem
                        key={category.categoryId || index}
                        textValue={`${category.categoryId} - ${category.name}`}
                        value={Number(category.categoryId)}
                      >
                        {category.categoryId} - {category.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            </CardBody>
            <CardFooter className={state.addNewCategory.name ? "" : "hidden"}>
              <div style={{ alignItems: "end" }}>
                <Button onClick={() => doAddCategory()} color="success">
                  <i className="bi bi-plus-circle" /> Dodaj kategoriju
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div>
      <RoledMainMenu />
      <div className="container mx-auto mt-3 h-max lg:px-4">
        {addForm()}
        <Toast
          variant={state.message.variant}
          message={state.message.message}
        />
        <AdminMenu />
      </div>
    </div>
  );
};

export default AddNewCategoryPage;
