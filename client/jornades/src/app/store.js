import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import competitionReducer from "../features/competition/competitionSlice";
import teamReducer from "../features/teams/teamSlice";

import userReducer from "../features/user/userSlice";
import activityReducer from "../features/activity/activitySlice";
import fieldReducer from "../features/field/fieldSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    competition: competitionReducer,
    teams: teamReducer,
    user: userReducer,
    activity: activityReducer,
    field: fieldReducer,
  },
});
