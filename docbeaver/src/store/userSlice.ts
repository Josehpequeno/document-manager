import { User } from "./../Interfaces/User";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

let userFromLocalStorage;

userFromLocalStorage = localStorage.getItem("user");

const storedUser = userFromLocalStorage
  ? (JSON.parse(userFromLocalStorage) as User)
  : null;

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
      localStorage.setItem("user", JSON.stringify(action.payload));
    }
  }
});

export default userSlice.reducer;

export const { logout, setUser } = userSlice.actions;
