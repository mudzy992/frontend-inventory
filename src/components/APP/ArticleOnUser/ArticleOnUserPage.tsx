import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Listbox,
  ListboxItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableCell,
  TableRow,
  ScrollShadow,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Chip,
  Alert,
} from "@nextui-org/react";
import { ApiResponse, useApi } from "../../../API/api";
import Moment from "moment";
import RoledMainMenu from "../../RoledMainMenu/RoledMainMenu";
import { useParams, useNavigate } from "react-router-dom";
import { LangBa } from "../../../config/lang.ba";
import ArticleType from "../../../types/ArticleType";
import saveAs from "file-saver";
import { ApiConfig } from "../../../config/api.config";
import { useUserContext } from "../../UserContext/UserContext";
import { UserRole } from "../../../types/UserRoleType";
import NewTicketByArticleModal from "../../admin/HelpDesk/new/ByArticle/NewTicketByArticleModal";

interface UpgradeFeaturesType {
  name: string;
  value: string;
  serialNumber: string;
  comment: string;
  timestamp: string;
}

interface ArticleOnUserPageState {
  message: string;
  article: ArticleType;
  isLoggedIn: boolean;
  errorMessage: string;
  upgradeFeatures: UpgradeFeaturesType[];
}

export default function ArticleOnUserPage() {
  const { api } = useApi();
  const { role } = useUserContext();
  const { serial } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const [state, setState] = useState<ArticleOnUserPageState>({
    message: "",
    article: {} as ArticleType,
    isLoggedIn: true,
    errorMessage: "",
    upgradeFeatures: [],
  });

  const setErrorMessage = (message: string) => {
    setState((prev) => ({ ...prev, message }));
  };

  const setLoggedInState = (isLoggedIn: boolean) => {
    setState((prev) => ({ ...prev, isLoggedIn }));
  };

  const setArticle = (article: ArticleType) => {
    setState((prev) => ({ ...prev, article }));
  };

  const setUpgradeFeatures = (upgradeFeatures: UpgradeFeaturesType[]) => {
    setState((prev) => ({ ...prev, upgradeFeatures }));
  };

  const printOptionalMessage = () => {
    if (state.message === "") {
      return;
    }

    return <Card>{state.message}</Card>;
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleHideModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    if (!serial) {
      return;
    }

    if (state.isLoggedIn === false) {
      return navigate("/login");
    }
    getArticleData(serial as string);
  }, [serial]);

  const getArticleData = (serial: string) => {
    api(`api/article/sb/${serial}`, "get", {}, role as UserRole).then(
      (res: ApiResponse) => {
        if (res.status === "forbidden") {
          setErrorMessage(
            "Korisnik nema dovoljno prava za učitavanje ovih podataka.",
          );
          return;
        }
        if (res.status === "error") {
          setErrorMessage(
            "Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije",
          );
          return;
        }
        if (res.status === "login") {
          setLoggedInState(false);
          return;
        }

        const data: ArticleType = res.data;
        setErrorMessage("");
        setArticle(data);
      },
    );

    api(`api/upgradeFeature/get/${serial}`, "get", {}, role as UserRole).then(
      (res: ApiResponse) => {
        if (res.status === "forbidden") {
          setErrorMessage(
            "Korisnik nema dovoljno prava za učitavanje ovih podataka.",
          );
          return;
        }
        setUpgradeFeatures(res.data);
      },
    );
  };

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

    return <Chip color={color}> {stat} </Chip>;
  }

  function userDetails(userDet: ArticleType) {
    let stat = userDet.status;
    if (stat === LangBa.ARTICLE_ON_USER.STATUS_DEBT) {
      return (
        <div className="mb-3">
        <Alert  color="warning" title={LangBa.ARTICLE_ON_USER.OBLIGATE_ALERT_INFO}  /></div>
      );
    }
    if (stat === LangBa.ARTICLE_ON_USER.STATUS_DESTROY) {
      return (
        <div className="mb-3">
        <Alert  color="danger" title={LangBa.ARTICLE_ON_USER.DESTROY_ALERT_WARNING}/></div>
      );
    }
    if (stat === LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE) {
      return (
        <div className="mb-3">
          <span className="ml-2">Detalji korisnika</span>
          <Listbox
            key={userDet.user?.userId}
            className="mt-2 rounded-2xl bg-default-100 pt-3 shadow-sm"
            aria-label="user-details"
          >
            <ListboxItem
              key={userDet.user?.fullname!}
              description={
                <span className="text-tiny text-gray-400">Naziv korisnika</span>
              }
              textValue={userDet.user?.fullname}
              aria-label={`Naziv korisnika: ${userDet.user?.fullname}`}
            >
              {userDet.user?.fullname}
            </ListboxItem>
            <ListboxItem
              textValue={userDet.user?.email}
              key={userDet.user?.email!}
              description={
                <span className="text-tiny text-gray-400">Email</span>
              }
              aria-label={`Email korisnika: ${userDet.user?.email}`}
            >
              {userDet.user?.email}
            </ListboxItem>
            <ListboxItem
              textValue={userDet.user?.organization?.name}
              key={userDet.user?.organization?.name!}
              description={
                <span className="text-tiny text-gray-400">
                  Naziv organizacije
                </span>
              }
              aria-label={`Organizacija: ${userDet.user?.organization?.name}`}
            >
              {userDet.user?.department?.title}
            </ListboxItem>
            <ListboxItem
              textValue={userDet.user?.department?.title}
              key={userDet.user?.department?.title!}
              description={
                <span className="text-tiny text-gray-400">
                  Naziv sektora/odjeljenja
                </span>
              }
              aria-label={`Sektor korisnika: ${userDet.user?.department?.title}`}
            >
              {userDet.user?.department?.title}
            </ListboxItem>
            <ListboxItem
              textValue={userDet.user?.job?.title}
              key={userDet.user?.job?.title!}
              description={
                <span className="text-tiny text-gray-400">
                  Naziv radnog mjesta
                </span>
              }
              aria-label={`Radno mjesto: ${userDet.user?.job?.title}`}
            >
              {userDet.user?.job?.title}
            </ListboxItem>
            <ListboxItem
              textValue={userDet.user?.location?.name}
              key={userDet.user?.location?.name!}
              description={
                <span className="text-tiny text-gray-400">Lokacija</span>
              }
              aria-label={`Lokacija korisnika: ${userDet.user?.location?.name}`}
            >
              {userDet.user?.location?.name}
            </ListboxItem>
          </Listbox>
        </div>
      );
    }
  }

  function upgradeFeature(this: any) {
    if (state.upgradeFeatures.length === 0) {
      return (
        <Card className="mb-3">
          <CardHeader
            className="grid grid-cols-6 gap-4 bg-warning-100"
            style={{ color: "white" }}
          >
            <div className="col-span-5">
              <i className="bi bi-question-circle" /> Artikal nema nadogradnji
            </div>
          </CardHeader>
        </Card>
      );
    }

    if (state.upgradeFeatures.length !== 0) {
      return (
        <Card className="mb-3 shadow-sm">
          <CardHeader
            className="grid grid-cols-6 gap-4"
            style={{ backgroundColor: "#00695C" }}
          >
            <div className="col-span-5 text-sm">
              {LangBa.ARTICLE_ON_USER.UPGRADE_FEATURE.CARD_HEADER2}
            </div>
          </CardHeader>
          <Listbox key={"upgrade-features"} aria-label={"upgrade-feature"}>
            {state.upgradeFeatures.map(
              (uf, index) => (
                <ListboxItem
                  key={index}
                  textValue={uf.name}
                  className="mt-3 w-[95%]"
                  aria-label={`Feature ${index + 1}`}
                >
                  <div className="grid-cols grid gap-2">
                    <div className="col-span-4 flex flex-nowrap">
                      <div>
                        <Popover
                          placement="top"
                          showArrow
                          backdrop="blur"
                          aria-label="skoc"
                        >
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

  function saveFile(docPath: any) {
    if (!docPath) {
      return (
        <div>
          <Popover
            placement="right"
            showArrow
            backdrop="blur"
            aria-label="skoc2"
          >
            <PopoverTrigger>
              <Button size="sm" style={{ backgroundColor: "#9D5353" }}>
                <i
                  className="bi bi-file-earmark-text"
                  style={{ fontSize: 20, color: "white" }}
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
        <Link onClick={() => savedFile(docPath)}>
          <i
            className="bi bi-file-earmark-text"
            style={{ fontSize: 22, color: "#008b02", cursor: "pointer" }}
          />
        </Link>
      );
    }
  }

  function renderArticleData(article: ArticleType) {
    const mappedStockFeatures =
      state.article.stock?.stockFeatures?.map((stockFeature) => ({
        featureId: stockFeature.feature?.featureId || null,
        name: stockFeature.feature?.name || "",
        value: stockFeature.value || "",
      })) || [];

    return (
      <div className="lg:flex">
        <div className="xs:w-full lg:mr-5 lg:w-8/12">
          <div className="lg:flex">
            <div>
              <Button
                variant="flat"
                color="danger"
                size={"sm"}
                onClick={() => handleShowModal()}
              >
                {" "}
                Prijavi problem
              </Button>
              <NewTicketByArticleModal
                show={showModal}
                onHide={handleHideModal}
                data={state.article}
              />
            </div>
            <div className="xs:w-full flex items-center justify-center lg:w-4/12">
              <i
                className={`${article.category?.imagePath}`}
                style={{ fontSize: 150 }}
              ></i>
            </div>
            <div className="xs:w-full lg:w-8/12">
              <ScrollShadow hideScrollBar className="h-[250px] w-full">
                <Listbox
                  items={mappedStockFeatures}
                  variant="bordered"
                  aria-label={`Feature`}
                >
                  {(item) => (
                    <ListboxItem
                      key={item.value}
                      textValue={item.name}
                      aria-label={`Radno mjesto: ${item.name}`}
                    >
                      <span className="text-bold text-small text-default-400">
                        {item.name}:{" "}
                      </span>
                      {item.value}
                    </ListboxItem>
                  )}
                </Listbox>
              </ScrollShadow>
              {upgradeFeature()}
            </div>
          </div>

          <div className="lg:flex">
            <div className="lg:w-12/12 sm:w-12/12 w-full">
              <Card className="mb-3 shadow-sm">
                <CardHeader>
                  {" "}
                  <span className="w-full rounded-lg bg-default-100 p-2 text-sm">
                    {LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.DESCRIPTION}
                  </span>
                </CardHeader>
                <CardBody>
                  <ScrollShadow
                    size={100}
                    hideScrollBar
                    className="max-h-[250px] w-full"
                  >
                    {article.stock?.description}
                  </ScrollShadow>
                </CardBody>
              </Card>
            </div>
          </div>

          <div className="mb-3 lg:flex">
            <Table className="shadow-sm" aria-label="tabela-artikala">
              <TableHeader>
                <TableColumn>{LangBa.ARTICLE_ON_USER.TABLE.USER}</TableColumn>
                <TableColumn>{LangBa.ARTICLE_ON_USER.TABLE.STATUS}</TableColumn>
                <TableColumn>
                  {LangBa.ARTICLE_ON_USER.TABLE.COMMENT}
                </TableColumn>
                <TableColumn>
                  {LangBa.ARTICLE_ON_USER.TABLE.DATE_AND_TIME_ACTION}
                </TableColumn>
                <TableColumn>#1</TableColumn>
              </TableHeader>
              <TableBody>
                {article.articleTimelines?.map((timeline) => (
                  <TableRow key={timeline.articleTimelineId}>
                    <TableCell textValue={timeline.user?.fullname}>
                      {timeline.user?.fullname}
                    </TableCell>
                    <TableCell textValue={timeline.status}>
                      {timeline.status}
                    </TableCell>
                    <TableCell textValue={timeline.comment}>
                      {timeline.comment}
                    </TableCell>
                    <TableCell
                      textValue={Moment(timeline.timestamp).format(
                        "DD.MM.YYYY. - HH:mm",
                      )}
                    >
                      {Moment(timeline.timestamp).format("DD.MM.YYYY. - HH:mm")}
                    </TableCell>
                    <TableCell textValue={"dokument za snimanje"}>
                      {saveFile(timeline.document?.path)}
                    </TableCell>
                  </TableRow>
                )) ?? []}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="w-full sm:w-full lg:w-1/3">
          {userDetails(article)}
          <div>
            <Card className="mb-3 shadow-sm">
              <CardHeader className="grid grid-cols-6 gap-4">
                <div className="col-span-5">
                  {LangBa.ARTICLE_ON_USER.STATUS.STATUS}
                </div>
              </CardHeader>
              <Listbox variant="flat" aria-label="status-artikla">
                <ListboxItem
                  textValue={article.status}
                  key="status"
                  aria-label={article.status}
                >
                  Status: <b>{article.status} </b>
                </ListboxItem>
                <ListboxItem
                  textValue={"datum-vrijeme"}
                  key="datum-akcije"
                  aria-label={"Datum akcije"}
                >
                  Datum akcije:{" "}
                  {Moment(article.timestamp).format("DD.MM.YYYY. - HH:mm")}
                </ListboxItem>
              </Listbox>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div >
      <RoledMainMenu />
      <div className="container mt-2 lg:mt-4 h-max px-2 lg:px-4 mx-auto">
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
            {printOptionalMessage()}
            {state.article ? renderArticleData(state.article) : ""}
            <Card
              style={{ marginTop: 15 }}
              className={state.errorMessage ? "" : "hidden"}
            >
              <CardBody>
                <i className="bi bi-exclamation-circle-fill"></i>{" "}
                {state.errorMessage}
              </CardBody>
            </Card>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
