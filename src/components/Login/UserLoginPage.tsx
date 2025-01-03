import React, { useState } from "react";
import { ApiResponse, saveRefreshToken, saveToken, useApi } from "../../API/api";
import { useNavigate } from "react-router-dom";
import { Button, Divider, Input, notification } from "antd";
import { saveIdentity, useUserContext } from "../UserContext/UserContext";

interface UserLoginPageState {
  email: string;
  password: string;
  userID: number;
  errorMessage: { message: string; variant: string };
  isLoggedIn: boolean;
  isAlertClosed: boolean;
}

const UserLoginPage: React.FC = () => {
  const { api } = useApi();
  const [state, setState] = useState<UserLoginPageState>({
    email: "",
    password: "",
    userID: 0,
    errorMessage: { message: "", variant: "" },
    isLoggedIn: false,
    isAlertClosed: false,
  });

  const navigate = useNavigate();
  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const { setUserId, setRole, setIsAuthenticated } = useUserContext();

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
          await saveIdentity(res.data.role, res.data.id, setRole, setUserId, setIsAuthenticated);
          await setUserID(res.data.id);
          await saveToken(res.data.token);
          await saveRefreshToken(res.data.refreshToken);

          if (res.data.role === "user") {
            navigate(`/user/profile/${res.data.id}`);
            await setErrorMessage("Dobrodošli nazad", "success");
          } else if (res.data.role === "administrator" || "moderator") {
            navigate(`/`);
            await setErrorMessage("Dobrodošli nazad", "success");
          }
        }
      }
    });
  };

  // Display notification on error or success
  const showNotification = (message: string, description: string, type: "success" | "error") => {
    notification[type]({
      message,
      description,
    });
  };

  if (state.errorMessage.message) {
    showNotification(state.errorMessage.variant, state.errorMessage.message, state.errorMessage.variant === "success" ? "success" : "error");
    resetMessage();
  }

  return (
    <div className="grid gap-3">
      <div className="mb-2 rounded-xl bg-content1 p-2 text-left text-lg h-12 text-black">
        <p>
          <i className="bi bi-person-fill text-xl text-black" /> Korisnička prijava
        </p> 
      </div>
      <Input
        className="rounded-xl h-12"
        type="text"
        id="email"
        placeholder="Unesite email"
        value={state.email}
        onChange={(event) => formInputChanged(event as any)}
        onKeyDown={(event) => handleKeyPress(event as any)}
        prefix={<i className="bi bi-envelope-at-fill text-2xl text-default-400" />}
      />
      <Input
        className="rounded-xl h-12"
        id="password"
        placeholder="Unesite lozinku"
        type={isVisible ? "text" : "password"}
        value={state.password}
        onChange={(event) => formInputChanged(event as any)}
        onKeyDown={(event) => handleKeyPress(event as any)}
        prefix={<i className="bi bi-key-fill text-2xl text-default-400" />}
        suffix={
          <button
            type="button"
            onClick={toggleVisibility}
            style={{ background: "none", border: "none" }}
          >
            {isVisible ? (
              <i className="bi bi-eye-fill text-2xl text-default-400" />
            ) : (
              <i className="bi bi-eye-slash-fill text-2xl text-default-400" />
            )}
          </button>
        }
      />
      <Divider className="my-2" />
      <Button
        className="rounded-xl h-12"
        size="large"
        type="primary"
        onClick={() => doLogin()}
        icon={<i className="bi bi-box-arrow-in-right text-xl " />}
      >
        Prijava
      </Button>
    </div>
  );
};

export default UserLoginPage;
