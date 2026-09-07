import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { login } from "../store/authSlice";

function Login() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
