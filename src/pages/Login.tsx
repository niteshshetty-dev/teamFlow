import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { login } from "../store/authSlice";
import api from "../services/api";

function Login() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/")
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("API error:", error);
      });
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    dispatch(
      login({
        user: {
          id: "1",
          name: "Nithesh",
          email,
        },
        token: "demo-token",
      }),
    );

    navigate("/dashboard");
  };

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button type="submit">Login</button>
        <p>Authenticated: {auth.isAuthenticated ? "Yes" : "No"}</p>

        <p>User: {auth.user?.name ?? "Not logged in"}</p>
      </form>
    </div>
  );
}

export default Login;
