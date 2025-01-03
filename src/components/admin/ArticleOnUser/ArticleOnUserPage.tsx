import React, { Key, useCallback, useEffect, useState } from "react";
import { ApiResponse, useApi } from "../../../API/api";
import { useNavigate, useParams } from "react-router-dom";
import Moment from "moment";
import UserArticleDto from "../../../dtos/UserArticleDto";
import RoledMainMenu from "../../RoledMainMenu/RoledMainMenu";
import { ApiConfig } from "../../../config/api.config";
import saveAs from "file-saver";
import { LangBa } from "../../../config/lang.ba";
import UserType from "../../../types/UserType";
import ArticleType from "../../../types/ArticleType";
import {
  Autocomplete,
  AutocompleteItem,
  Card,
  CardBody,
  CardHeader,
  Link,
  Listbox,
  ListboxItem,
  Popover,
  PopoverContent,
  Button,
  PopoverTrigger,
  ScrollShadow,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalContent,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  Tabs,
  Tab,
  Tooltip,
  Spinner,
  Accordion,
  AccordionItem,
  Alert,
} from "@nextui-org/react";
import { useAsyncList } from "@react-stately/data";
import { useUserContext } from "../../UserContext/UserContext";
import { UserRole } from "../../../types/UserRoleType";
import NewTicketByArticleModal from "../HelpDesk/new/ByArticle/NewTicketByArticleModal";
import ViewSingleTicketModal from "../HelpDesk/view/ViewSingleTicket";
import Toast from "../../custom/Toast";
import ArticleFeatureType from "../../../types/ArticleFeatureType";

interface upgradeFeaturesType {
  upgradeFeatureId: number;
  name: string;
  value: string;
  serialNumber: string;
  comment: string;
  timestamp: string;
}
interface articleFeatureBaseType {
  articleFeatureId?: number;
  articleId?: number;
  featureId?: number;
  featureValue?: string;
  feature?: {
    name?: string;
    featureId?: number;
  };
  use:number;
}

interface FeatureBaseType {
  featureId?: number;
  name: string;
  articleFeatureId: number;
  value: string;
};

type UserTypeBase = {
  userId: string;
  fullname: string;
};

interface AdminArticleOnUserPageState {
  userArticle: UserArticleDto[];
  message: { message: string; variant: string };
  article: ArticleType;
  users: UserType[];
  expandedCards: boolean[];
  changeStatus: {
    visible: boolean;
    userId: number | null;
    articleId: number | null;
    comment: string;
    serialNumber: string;
    invNumber: string;
    status: string;
  };
  upgradeFeature: upgradeFeaturesType[];
  upgradeFeatureAdd: {
    visible: boolean;
    name: string;
    value: string;
    comment: string;
  };
  editArticleFeatures: {
    visible: boolean;
    articleFeatures: articleFeatureBaseType[];
  };
}

const AdminArticleOnUserPage: React.FC = () => {
  const { api } = useApi();
  const { serial } = useParams();
  const { role } = useUserContext();
  const [selectedUserIsDisabled, setSelectedUserIdDisabled] = useState<boolean>(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("articles");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [state, setState] = useState<AdminArticleOnUserPageState>({
    message: { message: "", variant: "" },
    users: [],
    article: {},
    expandedCards: new Array(2).fill(false),
    changeStatus: {
      userId: Number(),
      articleId: 0,
      comment: "",
      serialNumber: "",
      invNumber: "",
      status: "",
      visible: false,
    },
    upgradeFeature: [],
    upgradeFeatureAdd: {
      visible: false,
      name: "",
      value: "",
      comment: "",
    },
    userArticle: [],
    editArticleFeatures: {
      visible: false,
      articleFeatures: [],
    },
  });

  const onInputChange = (value: string) => {
    const selectedUser = state.users.find((user) => user.fullname === value);
    if (selectedUser) {
      const userId = selectedUser.userId;
      setChangeStatusNumberFieldState("userId", userId || null);
    }
  };

  const isDisabled = () => {
    if (state.changeStatus.status === "razduženo" || "otpisano") {
      setSelectedUserIdDisabled(true);
      setChangeStatusNumberFieldState("userId", Number());
    }
    if (state.changeStatus.status === "zaduženo") {
      setSelectedUserIdDisabled(false);
    }
  };

  useEffect(() => {
    isDisabled();
  }, [state.changeStatus.status]);

  const setChangeStatusStringFieldState = (
    fieldName: string,
    newValue: string,
  ) => {
    setState((prev) => ({
      ...prev,
      changeStatus: {
        ...prev.changeStatus,
        [fieldName]: newValue,
      },
    }));
  };

  const setChangeStatusNumberFieldState = (
    fieldName: string,
    newValue: any,
  ) => {
    setState((prev) => ({
      ...prev,
      changeStatus: {
        ...prev.changeStatus,
        [fieldName]: newValue === "null" ? null : Number(newValue),
      },
    }));
  };

  const setChangeStatusVisibleState = (newState: boolean) => {
    setState((prev) => ({
      ...prev,
      changeStatus: {
        ...prev.changeStatus,
        visible: newState,
      },
    }));
  };

  const setUpgradeFeatureStringFieldState = (
    fieldName: string,
    newValue: string,
  ) => {
    setState((prev) => ({
      ...prev,
      upgradeFeatureAdd: {
        ...prev.upgradeFeatureAdd,
        [fieldName]: newValue,
      },
    }));
  };

  const setUpgradeModalVisibleState = (newState: boolean) => {
    setState((prev) => ({
      ...prev,
      upgradeFeatureAdd: {
        ...prev.upgradeFeatureAdd,
        visible: newState,
      },
    }));
  };

  const setUpgradeFeature = (upgradeFeatureData: upgradeFeaturesType[]) => {
    setState((prev) => ({
      ...prev,
      upgradeFeature: upgradeFeatureData,
    }));
  };

  const setErrorMessage = (message: string, variant: string) => {
    setState((prev) => ({
      ...prev,
      message: { message, variant },
    }));
  };

  const navigate = useNavigate();

  const setArticle = (articleData: ArticleType) => {
    setState((prev) => ({
      ...prev,
      article: articleData,
    }));
  };

  const setUsers = (usersData: UserType[]) => {
    setState((prev) => ({
      ...prev,
      users: usersData,
    }));
  };

  const setShowEditArticleFeaturesModal = (newState: boolean) => {
    setState((prev) => ({
      ...prev,
      editArticleFeatures: {
        ...prev.editArticleFeatures,
        visible: newState,
      },
    }));
  };

  const showEditArticleFeaturesModal = () => {
    setShowEditArticleFeaturesModal(true);
  };

  const putArticleDetailsInState = async (article: ArticleType) => {
    try {
      const features = await getFeaturesByCategoryId(article.category?.categoryId!);
      const articleFeatures: articleFeatureBaseType[] = (article.articleFeatures ? article.articleFeatures : []).map(feature => ({
        ...feature,
        use: feature.featureValue ? 1 : 0  // Postavite use na 1 ako featureValue postoji, inače 0
      }));

      // First, set existing feature values
      articleFeatures.forEach((af) => {
        const feature = features.find(f => f.featureId === af.featureId);
        if (feature) {
          af.featureValue = af.featureValue ?? "";
          af.articleFeatureId = af.articleFeatureId ?? undefined;
          af.articleId = article.articleId;
          af.feature = {
            name: feature.name ?? "",
            featureId: feature.featureId
          };
        }
      });
  
      // Then, add missing features from the category features
      features.forEach((feature) => {
        const existingFeature = articleFeatures.find(
          (f) => f.featureId === feature.featureId,
        );
  
        if (!existingFeature) {
          articleFeatures.push({
            featureId: feature.featureId,
            featureValue: "",
            use: 0,
            articleId: article.articleId,
            feature: {
              name: feature.name ?? "",
              featureId: feature.featureId
            }
          });
        }
      });
      // Postavite ažurirane osobine u state
      setState((prev) => ({
        ...prev,
        editArticleFeatures: {
          ...prev.editArticleFeatures,
          articleFeatures: articleFeatures
        }
      }));
    } catch (error) {
      // Obrada greške
      console.error(error);
    }
  };
  
  const getFeaturesByCategoryId = async (categoryId: number): Promise<FeatureBaseType[]> => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await api(
          `/api/feature/cat/${categoryId}`,
          "get",
          {},
          "administrator"
        );
  
        const features: FeatureBaseType[] = res.data.map((item: any) => ({
          featureId: item.featureId,
          name: item.name,
          value: item.articleFeatures.length > 0 ? item.articleFeatures[0].featureValue : "",
          articleFeatureId: item.articleFeatures.length > 0 ? item.articleFeatures[0].articleFeatureId : null,
        }));
  
        resolve(features);
      } catch (error) {
        reject(new Error("Greška prilikom dohvatanja osobina po kategoriji. Greška: " + error));
      }
    });
  };
  
  const setEditArticleFeatureValue = (featureId: number, value: string) => {
    setState((prevState) => ({
      ...prevState,
      editArticleFeatures: {
        ...prevState.editArticleFeatures,
        articleFeatures: prevState.editArticleFeatures.articleFeatures.map((feature) =>
          feature.featureId === featureId
            ? { ...feature, featureValue: value, use: value ? 1 : 0 }
            : feature
        ),
      },
    }));
  };

  const editArticleFeatures = () => {
    return (
      <div>
        <ScrollShadow hideScrollBar className="h-max-[250px] w-full">
          <Listbox
          variant="bordered"
          aria-label="box-dodatne-specifikacije"
          >
              {state.editArticleFeatures.articleFeatures
                .filter((feature) => feature.featureValue)
                .map((feature) => (
                  <ListboxItem key={feature.featureId!}>
                    <span className="text-bold text-small text-default-400">
                    {feature.feature?.name}:{" "}
                        </span> {feature.featureValue}
                  </ListboxItem>
                ))}
          </Listbox>
        </ScrollShadow>
        <div className="flex justify-end mr-3">
        <Button
          className="text-sm"
          color="success"
          variant="shadow"
          size="sm"
          onClick={() => showEditArticleFeaturesModal()}
          startContent={<i className="bi bi-node-plus text-base"></i>}
        >
          Izmjeni
        </Button>
        </div>
        <Modal
          size="lg"
          backdrop="blur"
          scrollBehavior={"inside"}
          isOpen={state.editArticleFeatures.visible}
          onClose={() => setShowEditArticleFeaturesModal(false)}
        >
          <ModalContent>
            <ModalHeader>
              Dodatne specifikacije
            </ModalHeader>
            <ModalBody>

              {state.editArticleFeatures.articleFeatures.map((feature, index) => (
                  <Input
                    key={feature.articleFeatureId! + feature.featureId!}
                    type="text"
                    variant="bordered"
                    aria-label={feature.feature?.name}
                    label={feature.feature?.name}
                    placeholder={feature.feature?.name}
                    value={feature.featureValue}
                    labelPlacement="inside"
                    onChange={(e) =>
                      setEditArticleFeatureValue(feature.featureId!, e.target.value)
                    }
                    className="mb-3 flex-grow"
                  />
              ))}
              </ModalBody>  
              <ModalFooter>
                <Button
                  color="success"
                  variant="shadow"
                  onClick={() => handleSaveArticleFeatures()}
                >
                  {LangBa.ARTICLE_ON_USER.BTN_SAVE}
                </Button>
              </ModalFooter>
            
          </ModalContent>
        </Modal>
      </div>
      
    );
  };

  const handleSaveArticleFeatures = async () => {
    const dataToSend = {
      features: state.editArticleFeatures.articleFeatures
        .filter(feature => feature.use === 1)  // Filtriramo samo one koje imaju use: 1
        .map(feature => ({
          articleId: feature.articleId,
          featureId: feature.featureId,
          featureValue: feature.featureValue
        }))
    };

    const featuresToDelete = state.editArticleFeatures.articleFeatures
    .filter(feature => feature.use === 0 && feature.articleFeatureId)
    .map(feature => feature.articleFeatureId);

    const deleteDataToSend = { articleFeatureIds: featuresToDelete };
  
    try {
      await api('api/article-features', "put", dataToSend, role)
      .then((res: ApiResponse) => {
        if (res.status === "ok"){
          setErrorMessage("Izmjena na dodatnoj specifikaciju uspješno izvršena", "success");
        }
        if (res.status === "forbidden"){
          setErrorMessage("Nemate prava za ovu akciju", "warning");
        }
        if (res.status === "error"){
          setErrorMessage("Greška prilikom izmjene na dodatnoj specifikaciji!", "danger");
        }
      })
      
      // Obriši features
      if (featuresToDelete.length > 0) {
        await api('api/article-features', "delete", deleteDataToSend, role)
      .then((res: ApiResponse) => {
        if (res.status === "ok"){
          setErrorMessage("Dodatna specifikacija ID:" + deleteDataToSend + " uspješno obrisana!", "success");
        }
        if (res.status === "forbidden"){
          setErrorMessage("Nemate prava za ovu akciju", "warning");
        }
        if (res.status === "error"){
          setErrorMessage("Greška prilikom brisanja dodatne specifikacije ID:" + deleteDataToSend, "danger");
        }
      })
        
      }
    } catch (error) {
      setErrorMessage("Greška prilikom snimanja dodatnih specifikacija:" + error, "danger");
    }
  };
  
  const getArticleData = useCallback(async () => {
    try {
      await api(`api/article/sb/${serial}`, "get", {}, "administrator").then(
        (res: ApiResponse) => {
          if (res.status === "error") {
            setErrorMessage(
              "Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije",
              "danger",
            );
            return;
          }
          if (res.status === "login") {
            return navigate("/login");
          }
          const data: ArticleType = res.data;
          setArticle(data);
          if(data){
            putArticleDetailsInState(data)
          }
        },
      );
    } catch (err) {
      setErrorMessage(
        "Greška prilikom dohvaćanja podataka za artikle. Greška: " + err,
        "danger",
      );
    }
  }, [serial]);

  const getUserData = useCallback(async () => {
    try {
      await api("/api/user/?sort=forname,ASC", "get", {}, "administrator").then(
        (res: ApiResponse) => {
          if (res.status === "login") {
            return navigate("/login");
          }

          setUsers(res.data);
        },
      );
    } catch (err) {
      setErrorMessage(
        "Greška prilikom dohvaćanja podataka o korisnicima (AdminArticleOnUserPage). Greška: " +
          err,
        "danger",
      );
    }
  }, [serial]);

  const userList = useAsyncList<UserTypeBase>({
    async load() {
      try {
        const res = await api(
          `/api/user/?sort=forname,ASC`,
          "get",
          {},
          "administrator",
        );
        if (res.status === "login") {
          navigate("/login");
          return { items: [] };
        }
        return { items: res.data };
      } catch (err) {
        setErrorMessage(
          "Greška prilikom dohvaćanja podataka o korisnicima (AdminArticleOnUserPage). Greška: " +
            err,
          "danger",
        );
        return { items: [] };
      }
    },
  });

  const getUpgradeFeature = useCallback(async () => {
    try {
      await api(
        `api/upgradeFeature/get/${serial}`,
        "get",
        {},
        role as UserRole,
      ).then((res: ApiResponse) => {
        if (res.status === "login") {
          return navigate("/login");
        }
        setUpgradeFeature(res.data);
      });
    } catch (err) {
      setErrorMessage(
        "Greška prilikom dohvaćanja dodataka (AdminArticleOnUserPage). Greška: " +
          err,
        "danger",
      );
    }
  }, [serial]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await getArticleData();
        await getUserData();
        await getUpgradeFeature();
        
        setLoading(false);
      } catch (err) {
        setLoading(true);
        setErrorMessage("Error fetching data:" + err, "danger");
      }
    };

    fetchData();
  }, [serial, getArticleData, getUserData, getUpgradeFeature]);

  const addNewUpgradeFeature = () => {
    api(
      "api/upgradeFeature/add/" + serial,
      "post",
      {
        name: state.upgradeFeatureAdd.name,
        value: state.upgradeFeatureAdd.value,
        comment: state.upgradeFeatureAdd.comment,
        articleId: state.article.articleId,
      },
      "administrator",
    ).then((res: ApiResponse) => {
      if (res.status === "login") {
        return navigate("/login");
      }
      getUpgradeFeature();

      setState((prev) => ({
        ...prev,
        upgradeFeatureAdd: {
          visible: false,
          name: "",
          value: "",
          comment: "",
        },
      }));
    });
  };

  const showAddUpgradeFeatureModal = () => {
    setUpgradeModalVisibleState(true);
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleHideModal = () => {
    setShowModal(false);
  };

  const openModalWithArticle = () => {
    handleShowModal();
  };

  const handleShowViewModal = () => {
    setShowViewModal(true);
  };

  const handleHideViewModal = () => {
    setShowViewModal(false);
  };

  const openViewModalWithArticle = (ticketId: number) => {
    setSelectedTicketId(ticketId);
    handleShowViewModal();
  };

  const addNewUpgradeFeatureButton = () => {
    return (
      <div>
        <Button
          className="text-sm"
          color="success"
          variant="shadow"
          size="sm"
          onClick={() => showAddUpgradeFeatureModal()}
          startContent={<i className="bi bi-node-plus text-base"></i>}
        >
          {LangBa.ARTICLE_ON_USER.BTN_UPGRADE}
        </Button>
        <Modal
          size="lg"
          backdrop="blur"
          isOpen={state.upgradeFeatureAdd.visible}
          onClose={() => setUpgradeModalVisibleState(false)}
        >
          <ModalContent>
            <ModalHeader>
              {LangBa.ARTICLE_ON_USER.MODAL_HEADER_TEXT}
            </ModalHeader>
            <ModalBody>
              <div className="flex w-full flex-col gap-4">
                <Input
                  type="text"
                  variant="bordered"
                  label="Naziv"
                  key={"name"}
                  labelPlacement="inside"
                  onChange={(e) =>
                    setUpgradeFeatureStringFieldState("name", e.target.value)
                  }
                  description="Unesite naziv nadogradnje. Npr. SSD, RAM "
                />
                <Input
                  type="text"
                  variant="bordered"
                  label="Vrijednost"
                  key={"value"}
                  labelPlacement="inside"
                  onChange={(e) =>
                    setUpgradeFeatureStringFieldState("value", e.target.value)
                  }
                  description="Unesite vrijednost nadogradnje. Npr. 256GB, 8GB "
                />
                <Textarea
                  label="Opis"
                  placeholder="Upišite razlog nadogradnje"
                  key={"description"}
                  variant="bordered"
                  onChange={(e) =>
                    setUpgradeFeatureStringFieldState("comment", e.target.value)
                  }
                />
              </div>
              <ModalFooter>
                <Button
                  color="success"
                  variant="shadow"
                  onClick={() => addNewUpgradeFeature()}
                >
                  {LangBa.ARTICLE_ON_USER.BTN_SAVE}
                </Button>
              </ModalFooter>
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
    );
  };

  const changeStatus = () => {
    api(
      "api/article/status/" + state.article.articleId,
      "patch",
      {
        userId: state.changeStatus.userId,
        comment: state.changeStatus.comment,
        status: state.changeStatus.status,
        invNumber: state.changeStatus.invNumber,
      },
      "administrator",
    ).then((res: ApiResponse) => {
      if (res.status === "login") {
        navigate("/login");
        return;
      }
      setChangeStatusVisibleState(false);
      setErrorMessage("Prenos opreme uspješno izvršen!", "success");
      getArticleData();

      setState((prev) => ({
        ...prev,
        changeStatus: {
          userId: Number(),
          articleId: Number(),
          comment: "",
          serialNumber: "",
          invNumber: "",
          status: "",
          visible: false,
        },
      }));
    });
  };


  function showChangeStatusModal(article: ArticleType) {
    const sb: any = article.serialNumber;
    const inv: any = article.invNumber;
    setChangeStatusVisibleState(true);
    setChangeStatusStringFieldState("serialNumber", sb);
    setChangeStatusStringFieldState("invNumber", inv);
  }

  function changeStatusButton(article: ArticleType) {
    let stat = article.status;
    if (stat !== LangBa.ARTICLE_ON_USER.STATUS_DESTROY) {
      return (
        <div className="xs:w-1/4 flex items-center justify-end sm:w-1/4 md:w-1/4 lg:w-1/4">
          <Button
            color="success"
            size="sm"
            variant="shadow"
            startContent={<i className="bi bi-pencil-square"></i>}
            onClick={() => showChangeStatusModal(state.article)}
          >
            {LangBa.ARTICLE_ON_USER.BTN_EDIT}
          </Button>
          <Modal
            size="lg"
            backdrop="blur"
            isOpen={state.changeStatus.visible}
            onClose={() => setChangeStatusVisibleState(false)}
          >
            <ModalContent>
              <ModalHeader>
                {LangBa.ARTICLE_ON_USER.MODAL_HEADER_CHANGE_STATUS}
              </ModalHeader>
              <ModalBody>
                <div className="flex w-full flex-col gap-4">
                  <Select
                    variant="bordered"
                    label="Status"
                    placeholder="Odaberite status"
                    onChange={(e) => {
                      setChangeStatusStringFieldState("status", e.target.value);
                      isDisabled();
                    }}
                  >
                    <SelectItem
                      key={LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE}
                      value={LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE}
                    >
                      {LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE}
                    </SelectItem>
                    <SelectItem
                      key={LangBa.ARTICLE_ON_USER.STATUS_DEBT}
                      value={LangBa.ARTICLE_ON_USER.STATUS_DEBT}
                    >
                      {LangBa.ARTICLE_ON_USER.STATUS_DEBT}
                    </SelectItem>
                    <SelectItem
                      key={LangBa.ARTICLE_ON_USER.STATUS_DESTROY}
                      value={LangBa.ARTICLE_ON_USER.STATUS_DESTROY}
                    >
                      {LangBa.ARTICLE_ON_USER.STATUS_DESTROY}
                    </SelectItem>
                  </Select>
                  <Autocomplete
                    label="Odaberi korisnika"
                    id="pick-the-user"
                    isDisabled={selectedUserIsDisabled}
                    onInputChange={onInputChange}
                    isLoading={userList.isLoading}
                    isClearable
                  >
                    {state.users.map((option) => (
                      <AutocompleteItem
                        key={
                          option.userId !== undefined
                            ? option.userId
                            : "defaultKey"
                        }
                        value={""}
                      >
                        {option.fullname}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>
                  <Input
                    type="text"
                    variant="bordered"
                    label="Serijski broj"
                    key={"serial-number"}
                    labelPlacement="inside"
                    isDisabled
                    value={state.changeStatus.serialNumber}
                    onChange={(e) =>
                      setChangeStatusStringFieldState(
                        "serialNumber",
                        e.target.value,
                      )
                    }
                    description={
                      LangBa.ARTICLE_ON_USER.TOOLTIP_MSG_SERIALNUMBER
                    }
                  />
                  <Input
                    type="text"
                    variant="bordered"
                    label="Inventurni broj"
                    key={"inventurni-broj"}
                    labelPlacement="inside"
                    isDisabled
                    value={state.changeStatus.invNumber}
                    onChange={(e) =>
                      setChangeStatusStringFieldState(
                        "invNumber",
                        e.target.value,
                      )
                    }
                    description={LangBa.ARTICLE_ON_USER.TOOLTIP_MSG_INV_NUMBER}
                  />
                  <Textarea
                    label="Opis"
                    placeholder="Upišite razlog zaduženja/razduženja/otpisa"
                    key={"description"}
                    variant="bordered"
                    onChange={(e) =>
                      setChangeStatusStringFieldState("comment", e.target.value)
                    }
                  />
                </div>
                <ModalFooter>
                  <Button
                    color="success"
                    variant="shadow"
                    startContent={<i className="bi bi-save"></i>}
                    onClick={() => changeStatus()}
                  >
                    {LangBa.ARTICLE_ON_USER.BTN_SAVE}
                  </Button>
                </ModalFooter>
              </ModalBody>
            </ModalContent>
          </Modal>
        </div>
      );
    }
  }

  return (
    <div>
      <RoledMainMenu />
      <div className="container mx-auto mt-2 lg:mt-4 h-max px-2 lg:px-4">
        {loading ? (
          <div className="flex items-center justify-center min-h-[70vh]">
            <Spinner
              label="Učitavanje..."
              labelColor="warning"
              color="warning"
            />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex w-full items-center justify-between rounded-xl bg-default-100 p-2">
                <div className="flex items-center">
                  <div>
                    <i
                      className={state.article.category?.imagePath?.toString()}
                      style={{ fontSize: 20 }}
                    />
                  </div>
                  <div className="pl-2 text-left">
                    {state.article.stock?.name}
                  </div>
                </div>
                <div className="flex items-center">
                  {badgeStatus(state.article)}
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {state.article ? renderArticleData(state.article) : ""}
            </CardBody>
          </Card>
        )}
      </div>
      <NewTicketByArticleModal
        show={showModal}
        onHide={handleHideModal}
        data={state.article}
      />
      <Toast
        variant={state.message.variant}
        message={state.message.message}
      />
    </div>
  );

  function badgeStatus(article: ArticleType) {
    let stat: any = article.status;
    let color: any;
    if (stat === LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE) {
      color = "success";
    } else if (stat === LangBa.ARTICLE_ON_USER.STATUS_DEBT) {
      color = "warning";
    } else {
      color = "danger";
    }

    return <Chip color={color}>{stat}</Chip>;
  }

  function userDetails(userDet: ArticleType) {
    let stat = userDet.status;
    if (stat === LangBa.ARTICLE_ON_USER.STATUS_DEBT) {
      return (
        <div className="mb-3">
        <Alert  color="warning" title={LangBa.ARTICLE_ON_USER.OBLIGATE_ALERT_INFO}  description/></div>
      );
    }
    if (stat === LangBa.ARTICLE_ON_USER.STATUS_DESTROY) {
      return (
        <div className="mb-3">
        <Alert  color="danger" title={LangBa.ARTICLE_ON_USER.DESTROY_ALERT_WARNING} description/></div>
      );
    }
    if (stat === LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE) {
      return (
        <Card className="mb-3 text-sm shadow">
          <CardHeader className="bg-default-100">Detalji korisnika</CardHeader>
          <CardBody>
            <Listbox aria-label="Detalji korisnika">
              <ListboxItem
                key={"userDet-ime"}
                textValue="ime"
                aria-label="Ime korisnika"
              >
                {"Korisnik: " +
                  userDet.user?.fullname}{" "}
              </ListboxItem>
              <ListboxItem
                key={"userDet-email"}
                textValue="email"
                aria-label="Email korisnika"
              >
                {LangBa.ARTICLE_ON_USER.USER_DETAILS.EMAIL +
                  userDet.user?.email}{" "}
              </ListboxItem>
              <ListboxItem
                key={"userDet-organization"}
                textValue="organization"
                aria-label="Organizacija korisnika"
              >
                {"Organizacija: " +
                  userDet.user?.organization?.name}{" "}
              </ListboxItem>
              <ListboxItem
                key={"userDet-sektor"}
                textValue="sektor ili odjeljenje"
                aria-label="Sektor ili odjeljenje korisnika"
              >
                {LangBa.ARTICLE_ON_USER.USER_DETAILS.DEPARTMENT +
                  userDet.user?.department?.title}{" "}
              </ListboxItem>
              <ListboxItem
                key={"userDet-radno-mjesto"}
                textValue="radno mjesto"
                aria-label="Radno mjesto korisnika"
              >
                {LangBa.ARTICLE_ON_USER.USER_DETAILS.JOBNAME +
                  userDet.user?.job?.title}{" "}
              </ListboxItem>
            </Listbox>
          </CardBody>
        </Card>
      );
    }
  }

  function saveFile(docPath: any) {
    if (!docPath) {
      return (
        <div>
          <Popover placement="right">
            <PopoverTrigger>
              <Button size="sm" variant="shadow" color="danger">
                <i
                  className="bi bi-file-earmark-text"
                  style={{ fontSize: 20 }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent>Prenosnica nije generisana</PopoverContent>
          </Popover>
        </div>
      );
    }
    if (docPath) {
      const savedFile = (docPath: any) => {
        saveAs(ApiConfig.TEMPLATE_PATH + docPath, docPath);
      };
      return (
        <Button
          size="sm"
          variant="shadow"
          color="success"
          onClick={() => savedFile(docPath)}
        >
          <i className="bi bi-file-earmark-text" style={{ fontSize: 20 }} />
        </Button>
      );
    }
  }

  function doDeleteUpgradeFeature(upgradeFeatureId: number) {
    api(
      "api/upgradeFeature/delete/" + upgradeFeatureId,
      "delete",
      {},
      "administrator",
    ).then((res: ApiResponse) => {
      if (res.status === "login") {
        navigate("/login");
        return;
      }
      getUpgradeFeature();
    });
  }

  function upgradeFeature(this: any) {
    if (state.upgradeFeature.length === 0) {
      return (
        <Card className="mb-3 shadow">
          <CardHeader
            className="grid grid-cols-6 gap-4"
            style={{ backgroundColor: "#00695C", color: "white" }}
          >
            <div className="col-span-5 text-sm">
              {LangBa.ARTICLE_ON_USER.UPGRADE_FEATURE.CARD_HEADER}
            </div>
            <div className="col-end-7 flex justify-end">
              {addNewUpgradeFeatureButton()}
            </div>
          </CardHeader>
        </Card>
      );
    }

    if (state.upgradeFeature.length !== 0) {
      return (
        <Card className="mb-3 shadow">
          <CardHeader
            className="grid grid-cols-6 gap-4"
            style={{ backgroundColor: "#00695C" }}
          >
            <div className="col-span-5 text-sm">
              {LangBa.ARTICLE_ON_USER.UPGRADE_FEATURE.CARD_HEADER2}
            </div>
            <div className="col-end-7 flex justify-end">
              {addNewUpgradeFeatureButton()}
            </div>
          </CardHeader>
          <Listbox aria-label="Box nadogradnje">
            {state.upgradeFeature.map(
              (uf, index) => (
                <ListboxItem
                  key={index}
                  aria-label={`nadogradnja-${index}`}
                  textValue={`${index} + nadogradnja`}
                >
                  <div className="grid-cols grid gap-2">
                    <div className="col-span-4 flex flex-nowrap">
                      <div>
                        <Popover placement="top" showArrow backdrop="blur">
                          <PopoverTrigger>
                            <i
                              style={{ color: "darkgray" }}
                              className="bi bi-info-circle-fill"
                            />
                          </PopoverTrigger>
                          <PopoverContent>
                            {uf.comment}{" "}
                            <b>{LangBa.ARTICLE_ON_USER.UPGRADE_FEATURE.DATE}</b>{" "}
                            {Moment(uf.timestamp).format("DD.MM.YYYY - HH:mm")}
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="pl-2">
                        <b>{uf.name}: </b> {uf.value}
                      </div>
                    </div>
                    <div className="justify-content-end col-end-7 flex">
                      <Link
                        onClick={(e) =>
                          doDeleteUpgradeFeature(uf.upgradeFeatureId)
                        }
                      >
                        {" "}
                        <i
                          style={{ color: "red" }}
                          className="bi bi-trash3-fill"
                        />
                      </Link>
                    </div>
                  </div>
                </ListboxItem>
              ),
              this,
            )}
          </Listbox>
        </Card>
      );
    }
  }

  function actions(ticketId: number) {
    return (
      <div className="relative flex items-center gap-2">
        <Tooltip content="Pregledaj" showArrow>
          <span
            className="cursor-pointer p-1 text-lg text-default-600 active:opacity-50"
            onClick={() => openViewModalWithArticle(ticketId)}
          >
            <i className="bi bi-eye" />
          </span>
        </Tooltip>
      </div>
    );
  }

  function renderArticleData(article: ArticleType) {
    const mappedStockFeatures =
      state.article.stock?.stockFeatures?.map((stockFeature) => ({
        featureId: stockFeature.feature?.featureId || null,
        name: stockFeature.feature?.name || "",
        value: stockFeature.value || "",
      })) || [];

    if (state.article.serialNumber) {
      mappedStockFeatures.push({
        featureId: null,
        name: "Serijski broj",
        value: state.article.serialNumber,
      });
    }

    if (state.article.invNumber) {
      mappedStockFeatures.push({
        featureId: null,
        name: "Inventurni broj",
        value: state.article.invNumber,
      });
    }

    return (
      <div className="lg:flex">
        <div className="xs:w-full lg:mr-5 lg:w-8/12">
          <Button
            size="sm"
            color="danger"
            className="absolute"
            variant="flat"
            onClick={() => openModalWithArticle()}
          >
            {" "}
            Prijavi problem
          </Button>
          <div className="lg:flex">
            <div className="xs:w-full flex items-center justify-center lg:w-4/12">
              <i
                className={`${article.category?.imagePath}`}
                style={{ fontSize: 150 }}
              ></i>
            </div>
            <div className="xs:w-full lg:w-8/12">
            <Accordion
            showDivider={true}
            defaultExpandedKeys={["1"]}
            >
              <AccordionItem 
              startContent={<i className="bi bi-cpu text-primary text-xl" />}
              key="1" 
              title={"Tehničke specifikacije"}>
                <ScrollShadow hideScrollBar className="h-[250px] w-full">
                <Listbox
                  items={mappedStockFeatures}
                  variant="bordered"
                  aria-label="box-specifikacije"
                >
                  {(item) => (
                    <ListboxItem
                      key={item.value}
                      aria-label={`specifikacija-${item.featureId}`}
                      textValue={`Item-${item.name}`}
                    >
                      <span className="text-bold text-small text-default-400">
                        {item.name}:{" "}
                      </span>
                      {item.value}
                    </ListboxItem>
                  )}
                </Listbox>
              </ScrollShadow>
              </AccordionItem>
              <AccordionItem 
              startContent={<i className="bi bi-gear text-warning text-xl" />}
              key="2" 
              title={(<div className="flex gap-2"><span>Dodatne specifikacije</span></div>)}>
                {editArticleFeatures()}
              </AccordionItem>
              <AccordionItem 
              startContent={<i className="bi bi-wrench-adjustable-circle text-success text-xl" />}
              key="3" 
              title={(<div className="flex gap-2"><span>Nadogradnja</span> <Chip size="sm" color="success">{state.upgradeFeature.length}</Chip></div>)}>
                {upgradeFeature()}
              </AccordionItem>
            </Accordion>
              
              
            </div>
          </div>

          <div className="lg:flex">
            <div className="lg:w-12/12 sm:w-12/12 w-full">
              <Card className="mb-3 shadow">
                <CardHeader className="text-sm">
                  {LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.DESCRIPTION}
                </CardHeader>
                <CardBody>
                  <ScrollShadow
                    size={100}
                    hideScrollBar
                    className="max-h-[250px] w-full text-sm"
                  >
                    {article.stock?.description}
                  </ScrollShadow>
                </CardBody>
              </Card>
            </div>
          </div>

          <div className="mb-3">
            <Tabs
              aria-label="Opcije"
              color="primary"
              radius="full"
              selectedKey={selectedTab}
              onSelectionChange={(key: Key) => setSelectedTab(key as string)}
              size="sm"
            >
              <Tab key="articles" title="Kretanje opreme">
                <div className="overflow-hidden overflow-x-auto">
                  <Table
                    aria-label="tabela-zaduzenja"
                    removeWrapper
                    className="rounded-xl p-2 shadow-md"
                  >
                    <TableHeader>
                      <TableColumn
                        key={"korisnik"}
                        aria-label="Naziv korisnika"
                      >
                        {LangBa.ARTICLE_ON_USER.TABLE.USER}
                      </TableColumn>
                      <TableColumn key={"status"} aria-label="status artikla">
                        {LangBa.ARTICLE_ON_USER.TABLE.STATUS}
                      </TableColumn>
                      <TableColumn
                        key={"komentar"}
                        aria-label="Komentar akcije"
                      >
                        {LangBa.ARTICLE_ON_USER.TABLE.COMMENT}
                      </TableColumn>
                      <TableColumn
                        key={"datum-vrijeme"}
                        aria-label="Datum i vrijeme akcije"
                      >
                        {LangBa.ARTICLE_ON_USER.TABLE.DATE_AND_TIME_ACTION}
                      </TableColumn>
                      <TableColumn
                        className="w-min-[150px]"
                        key={"dokument"}
                        aria-label="Prateci dokument"
                      >
                        #
                      </TableColumn>
                    </TableHeader>
                    <TableBody>
                      {article.articleTimelines?.map((timeline, index) => (
                        <TableRow key={timeline.articleTimelineId}>
                          <TableCell
                            className="min-w-fit whitespace-nowrap"
                            key={`korisnik-${timeline.user?.fullname}-${index}`}
                            aria-label="naziv-korisnika"
                          >
                            <Link
                              className="text-sm"
                              isBlock
                              showAnchorIcon
                              color="primary"
                              href={`#/user/profile/${timeline.userId}`}
                            >
                              {timeline.user?.fullname}
                            </Link>
                          </TableCell>
                          <TableCell
                            className="min-w-fit whitespace-nowrap"
                            key={`status-${timeline.status}-${index}`}
                            aria-label="Status artikla"
                          >
                            {timeline.status}
                          </TableCell>
                          <TableCell
                            className="min-w-fit whitespace-nowrap"
                            key={`korisnik-${timeline.comment}-${index}`}
                            aria-label="Komentar"
                          >
                            {timeline.comment}
                          </TableCell>
                          <TableCell
                            className="min-w-fit whitespace-nowrap"
                            key={`datum-vrijeme-${index}`}
                            aria-label="Vrijeme i datum akcije"
                          >
                            {Moment(timeline.timestamp).format(
                              "DD.MM.YYYY. - HH:mm",
                            )}
                          </TableCell>
                          <TableCell
                            className="min-w-fit whitespace-nowrap"
                            key={`dokument-${index}`}
                            aria-label="DOkument"
                          >
                            {saveFile(timeline.document?.path)}
                          </TableCell>
                        </TableRow>
                      )) ?? []}
                    </TableBody>
                  </Table>
                </div>
              </Tab>
              <Tab key="tickets" title="Tiketi">
                <div className="overflow-hidden overflow-x-auto">
                  <Table
                    aria-label="tabela-zaduzenja"
                    removeWrapper
                    className="rounded-xl p-2 shadow-md"
                    isCompact
                    isStriped
                  >
                    <TableHeader>
                      <TableColumn key={"opis"} aria-label="Opis tiketa">
                        Opis tiketa
                      </TableColumn>
                      <TableColumn
                        key={"datum-vrijeme-prijave"}
                        aria-label="Datum prijave"
                      >
                        Datum prijave
                      </TableColumn>
                      <TableColumn key={"status"} aria-label="status tiketa">
                        Status tiketa
                      </TableColumn>
                      <TableColumn key={"action"} aria-label="akcija">
                        Akcija
                      </TableColumn>
                    </TableHeader>
                    <TableBody>
                      {article.helpdeskTickets?.map((ticket, index) => (
                        <TableRow key={ticket.ticketId}>
                          <TableCell
                            className="max-w-[400px] overflow-hidden text-ellipsis whitespace-nowrap"
                            key={`opis-${ticket.description}-${index}`}
                            aria-label="opis-tiketa"
                          >
                            {ticket.description}
                          </TableCell>
                          <TableCell
                            className="min-w-fit whitespace-nowrap"
                            key={`datum-vrijeme-${index}`}
                            aria-label="Datum i vrijeme prijave"
                          >
                            {Moment(ticket.createdAt).format(
                              "DD.MM.YYYY. - HH:mm",
                            )}
                          </TableCell>
                          <TableCell
                            className="min-w-fit whitespace-nowrap"
                            key={`status-${ticket.status}-${index}`}
                            aria-label="Status tiketa"
                          >
                            {ticket.status === "zatvoren" ? (
                              <Chip size="sm" variant="flat" color="success">
                                {ticket.status}
                              </Chip>
                            ) : (
                              <Chip size="sm" variant="flat" color="warning">
                                {ticket.status}
                              </Chip>
                            )}
                          </TableCell>
                          <TableCell
                            className="min-w-fit whitespace-nowrap"
                            key={`action-${index}`}
                            aria-label="Akcija"
                          >
                            {actions(ticket.ticketId!)}
                          </TableCell>
                        </TableRow>
                      )) ?? []}
                    </TableBody>
                  </Table>{" "}
                </div>
              </Tab>
            </Tabs>
            <ViewSingleTicketModal
              show={showViewModal}
              onHide={handleHideViewModal}
              ticketId={selectedTicketId!}
              data={state.article.helpdeskTickets!}
            />
          </div>
        </div>

        <div className="w-full sm:w-full lg:w-1/3">
          {userDetails(article)}
          <div>
            <Card className="mb-3 text-sm shadow">
              <CardHeader className="grid grid-cols-6 gap-4 bg-default-100">
                <div className="col-span-5">
                  {LangBa.ARTICLE_ON_USER.STATUS.STATUS}
                </div>
                <div className="col-end-7 flex justify-end">
                  {changeStatusButton(article)}
                </div>
              </CardHeader>
              <CardBody>
                <Listbox variant="flat" aria-label="box-stanja">
                  <ListboxItem
                    key="status"
                    aria-label="status-stanja"
                    textValue={`status-${article.status}`}
                  >
                    Status: <b>{article.status} </b>
                  </ListboxItem>
                  <ListboxItem
                    key="datum-akcije"
                    aria-label="akcije-datum"
                    textValue="Datum i vrijeme akcije"
                  >
                    Datum akcije:{" "}
                    {Moment(article.timestamp).format("DD.MM.YYYY. - HH:mm")}
                  </ListboxItem>
                </Listbox>
              </CardBody>
            </Card>
          </div>
          <Card className="text-sm shadow">
            <CardHeader className="bg-default-100">U skladištu</CardHeader>
            <CardBody>
              <Listbox variant="flat" aria-label="box-skladista">
                <ListboxItem
                  key={"stanje-ugovor"}
                  aria-label="Stanje ugovora"
                  textValue={`status-${article.stock?.valueOnContract}`}
                >
                  {LangBa.ARTICLE_ON_USER.STOCK.VALUE_ON_CONCRACT +
                    article.stock?.valueOnContract}
                </ListboxItem>
                <ListboxItem
                  key={"stanje-trenutno"}
                  aria-label="Trenutno stanje"
                  textValue={`status-${article.stock?.valueAvailable}`}
                >
                  {LangBa.ARTICLE_ON_USER.STOCK.AVAILABLE_VALUE +
                    article.stock?.valueAvailable}
                </ListboxItem>
                <ListboxItem
                  key={"concract"}
                  aria-label="Ugovor:"
                  textValue={`status-${article.stock?.contract}`}
                >
                  {"Ugovor: " + article.stock?.contract}
                </ListboxItem>
                <ListboxItem
                  key={"datum-akcije"}
                  aria-label="Datum i vrijeme akcije"
                  textValue={`vrijeme-akcije`}
                >
                  {LangBa.ARTICLE_ON_USER.STOCK.IN_STOCK_DATE +
                    Moment(article.stock?.timestamp).format(
                      "DD.MM.YYYY. - HH:mm",
                    )}
                </ListboxItem>
              </Listbox>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }
};

export default AdminArticleOnUserPage;
