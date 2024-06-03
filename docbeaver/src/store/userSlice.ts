import { getItem } from "../utils/localStorageWithExpiry";
import { User } from "./../Interfaces/User";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

let userFromLocalStorage;

userFromLocalStorage = getItem("user");

const storedUser = userFromLocalStorage ? (userFromLocalStorage as User) : null;

interface UserState {
  user: User | null;
}

const initialState: UserState = {
  user: storedUser || null
};

const removeState: UserState = {
  user: null
};

export const userSlice = createSlice({
  initialState,
  name: "userSlice",
  reducers: {
    logout: () => {
      localStorage.removeItem("user");
      return removeState;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      const now = new Date();
      const item = {
        user: action.payload,
        expiry: now.getTime() + 24 * 60 * 60 * 1000 // one day in milliseconds
      };
      localStorage.setItem("user", JSON.stringify(item));
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      if (!state.user) return state;
      state.user.access_token = action.payload;
      const now = new Date();
      const item = {
        user: action.payload,
        expiry: now.getTime() + 24 * 60 * 60 * 1000 // one day in milliseconds
      };
      localStorage.setItem("user", JSON.stringify(item));
      return state;
    }
  }
});

export default userSlice.reducer;

export const { logout, setUser, updateAccessToken } = userSlice.actions;
