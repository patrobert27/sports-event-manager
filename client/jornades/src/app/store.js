
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import competitionReducer from "../features/competition/competitionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    competition: competitionReducer,
  },
});
