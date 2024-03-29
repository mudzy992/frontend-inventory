import React, { useState } from "react";
import api, { ApiResponse, saveRefreshToken, saveToken } from "../../API/api";
import { useNavigate } from "react-router-dom";
import { Button, Divider, Input } from "@nextui-org/react";
import { saveIdentity, useUserContext } from "../UserContext/UserContext";
import Toast from "../custom/Toast";

interface UserLoginPageState {
  email: string;
  password: string;
  userID: number;
  errorMessage: {message: string, variant: string};
  isLoggedIn: boolean;
  isAlertClosed: boolean;
}

const UserLoginPage: React.FC = () => {
  const [state, setState] = useState<UserLoginPageState>({
    email: "",
    password: "",
    userID: 0,
    errorMessage: {message:"", variant: ""},
    isLoggedIn: false,
    isAlertClosed: false,
  });

  const navigate = useNavigate();
  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const { setUserId, setRole } = useUserContext();

  const formInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.id]: event.target.value });
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      doLogin();
    }
  };

  const setLogginState = (isLoggedIn: boolean) => {
    setState({
      ...state,
      isLoggedIn: isLoggedIn,
    });
  };

  const setUserID = (userID: number) => {
    setState({
      ...state,
      userID: userID,
    });
  };

  const setErrorMessage = (message: string, variant: string) => {
    setState((prev) => ({
      ...prev,
      errorMessage: { message, variant },
    }));
  };

  const resetMessage = () => {
    setState((prev) => ({
      ...prev,
      errorMessage: { message: "", variant: "" },
    }));
  };


  const doLogin = async () => {
    api("auth/login", "post", {
      email: state.email,
      password: state.password,
    }).then(async (res: ApiResponse) => {
      if (res.status === "error") {
        setErrorMessage("Sistemska greška.. Pokušajte ponovo!", "danger");
        return;
      }

      if (res.status === "ok") {
        if (res.data.statusCode !== undefined) {
          let message = "";

          switch (res.data.statusCode) {
            case -3001:
            case -3002:
              message = "Neispravni korisnički podaci!";
              break;
          }

          setErrorMessage(message, "danger");
          return;
        }
        if (res.status === "ok") {
          await setLogginState(true);
          await saveIdentity(res.data.role, res.data.id, setRole, setUserId);
          await setUserID(res.data.id);
          await saveToken(res.data.token);
          await saveRefreshToken(res.data.refreshToken);

          if (res.data.role === "user") {
            navigate(`/user/profile/${res.data.id}`);
            await setErrorMessage("Dobrodošli nazad", "success")
          } else if (res.data.role === "administrator" || "moderator") {
            navigate(`/`);
            await setErrorMessage("Dobrodošli nazad", "success")
          }
        }
      }
    });
  };

  return (
    <div className="grid gap-3">
      <div className="mb-2 rounded-xl bg-default-100 p-2 text-left text-lg">
        <p className="">
          <i className="bi bi-person-fill text-xl text-default-500" />{" "}
          Korisnička prijava
        </p>
      </div>
      <Input
        type="text"
        id="email"
        label="Email"
        placeholder="Unesite email"
        variant="flat"
        labelPlacement="outside"
        value={state.email}
        onChange={(event) => formInputChanged(event as any)}
        onKeyDown={(event) => handleKeyPress(event as any)}
        startContent={
          <i className="bi bi-envelope-at-fill pointer-events-none text-2xl text-default-400"></i>
        }
      />
      <Input
        id="password"
        label="Lozinka"
        variant="flat"
        labelPlacement="outside"
        placeholder="Unesite lozinku"
        endContent={
          <button
            className="focus:outline-none"
            type="button"
            onClick={toggleVisibility}
          >
            {isVisible ? (
              <i className="bi bi-eye-fill pointer-events-none text-2xl text-default-400" />
            ) : (
              <i className="bi bi-eye-slash-fill pointer-events-none text-2xl text-default-400" />
            )}
          </button>
        }
        type={isVisible ? "text" : "password"}
        value={state.password}
        onChange={(event) => formInputChanged(event as any)}
        onKeyDown={(event) => handleKeyPress(event as any)}
        startContent={
          <i className="bi bi-key-fill pointer-events-none text-2xl text-default-400"></i>
        }
      />
      <Divider className="my-2" />
      <Button
        size="lg"
        variant="solid"
        color="default"
        onClick={() => doLogin()}
      >
        <i className="bi bi-box-arrow-in-right text-xl text-default-500" />{" "}
        Prijava
      </Button>
      <Toast variant={state.errorMessage.variant} message={state.errorMessage.message} onClose={resetMessage} />
    </div>
  );
};

export default UserLoginPage;
