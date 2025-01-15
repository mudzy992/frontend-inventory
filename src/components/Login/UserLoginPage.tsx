import React, { useState } from "react";
import { ApiResponse, saveRefreshToken, saveToken, useApi } from "../../API/api";
import { useNavigate } from "react-router-dom";
import { Button, Divider, Input } from "antd";
import { saveIdentity, useUserContext } from "../UserContext/UserContext";
import { useNotificationContext } from "../Notification/NotificationContext";

interface UserLoginPageState {
  email: string;
  password: string;
  userID: number;
}

const UserLoginPage: React.FC = () => {
  const { api } = useApi();
  const { success, error, warning } = useNotificationContext();
  const [state, setState] = useState<UserLoginPageState>({
    email: "",
    password: "",
    userID: 0,
  });

  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
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

  const setUserID = (userID: number) => {
    setState({
      ...state,
      userID: userID,
    });
  };

  const doLogin = async () => {
    api("auth/login", "post", {
      email: state.email,
      password: state.password,
    }).then(async (res: ApiResponse) => {
      if (res.status === "error") {
        error.notification(res.data.message);
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

          warning.notification(message);
          return;
        }
        if (res.status === "ok") {
          await saveIdentity(res.data.role, res.data.id, setRole, setUserId, setIsAuthenticated);
          await setUserID(res.data.id);
          await saveToken(res.data.token);
          await saveRefreshToken(res.data.refreshToken);

          if (res.data.role === "user") {
            navigate(`/user/profile/${res.data.id}`);
            success.message('Dobrodošli nazad!')
          } else if (res.data.role === "administrator" || "moderator") {
            navigate(`/`);
            success.message('Dobrodošli nazad!');
          }
        }
      }
    });
  };

  return (
    <div className="grid gap-3">
      <div className="mb-2 rounded-xl p-2 text-left text-lg h-12 border-1">
        <p>
          <i className="bi bi-person-fill text-xl" /> Korisnička prijava
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
