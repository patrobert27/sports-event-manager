import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  teams: [],
  currentTeam: null,
  isLoadingTeams: false,
  error: null,
  success: null,
};

const teamSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    setIsLoadingTeams(state, action) {
      state.isLoadingTeams = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setSuccess(state, action) {
      state.success = action.payload;
    },
    setTeams(state, action) {
      state.teams = action.payload || [];
    },
    setTeam(state, action) {
      state.currentTeam = action.payload;
    },
  },
});

export const {
  setIsLoadingTeams,
  setError,
  setSuccess,
  setTeams,
  setTeam,
} = teamSlice.actions;

export default teamSlice.reducer;
