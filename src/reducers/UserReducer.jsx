import cookie from "react-cookies";
import { jwtDecode } from "jwt-decode";

const UserReducer = (current, action) => {
  switch (action.type) {
    case "login": {
      const { token } = action.payload || {};
      if (!token) return current;

      cookie.save("token", token, {
        path: "/",
        secure: false,
        httpOnly: false,
      });

      try {
        const decoded = jwtDecode(token);
        localStorage.setItem("user", JSON.stringify(decoded));
        return decoded;
      } catch (e) {
        return null;
      }
    }

    case "logout": {
      cookie.remove("token", { path: "/" });
      localStorage.removeItem("user");
      return null;
    }

    case "update": {
      const user = action.payload;
      return user;
    }

    default:
      return current;
  }
};

export default UserReducer;
