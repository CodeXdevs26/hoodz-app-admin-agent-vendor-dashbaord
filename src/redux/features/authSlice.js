import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, token } = action.payload;

      state.user = user;
      state.token = token;

      // Token is also mirrored into a cookie so the edge middleware (which
      // can't read Redux/localStorage) can check auth + role on every
      // request. NOTE: this cookie is not httpOnly (it's set from client
      // JS), so it — like the token already kept in Redux/localStorage via
      // redux-persist — is readable by any script on the page and is
      // therefore exposed if the app is ever hit by an XSS bug. The
      // durable fix is for the backend to issue the session as an
      // httpOnly, Secure, SameSite cookie instead of a bearer token; until
      // then this at least stops the cookie from being sent over plain
      // HTTP or leaking cross-site.
      Cookies.set("hoodz_Dahboard_token", token, {
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
    },

    logout: (state) => {
      // Remove token for cookies
      Cookies.remove("hoodz_Dahboard_token", { path: "/" });
      state.user = null;
      state.token = null;
    },
  },
});

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;

export const { setUser, logout } = authSlice.actions;

export default authSlice.reducer;
