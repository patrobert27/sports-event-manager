import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import competitionReducer from "../features/competition/competitionSlice";
import teamReducer from "../features/teams/teamSlice";
import groupReducer from "../features/groups/groupSlice";

import userReducer from "../features/user/userSlice";
import activityReducer from "../features/activity/activitySlice";
import fieldReducer from "../features/field/fieldSlice";
import announcementReducer from "../features/announcement/announcementSlice";
import predictionReducer from "../features/predictions/predictionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    competition: competitionReducer,
    teams: teamReducer,
    group: groupReducer,
    user: userReducer,
    activity: activityReducer,
    field: fieldReducer,
    announcement: announcementReducer,
    predictions: predictionReducer,
  },
});

