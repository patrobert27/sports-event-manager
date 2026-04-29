import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  loading: false,
  error: null,
  activities: [],
  fields: [],
};

const competitionSlice = createSlice({
  name: "competition",
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setList(state, action) {
      state.list = action.payload || [];
    },
    addCompetition(state, action) {
      state.list.unshift(action.payload);
    },
    updateCompetition(state, action) {
      const idx = state.list.findIndex((c) => c.id === action.payload.id);
      if (idx >= 0) state.list[idx] = action.payload;
    },
    removeCompetition(state, action) {
      state.list = state.list.filter((c) => c.id !== action.payload);
    },
    setActivities(state, action) {
      state.activities = action.payload || [];
    },
    setFields(state, action) {
      state.fields = action.payload || [];
    },
  },
});

export const {
  setLoading,
  setError,
  setList,
  addCompetition,
  updateCompetition,
  removeCompetition,
  setActivities,
  setFields,
} = competitionSlice.actions;

export default competitionSlice.reducer;
