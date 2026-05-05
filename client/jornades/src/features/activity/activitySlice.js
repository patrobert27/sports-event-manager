import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  isLoading: false,
  error: null,
  success: null,
};

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    setIsLoading(state, action) {
      state.isLoading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setSuccess(state, action) {
      state.success = action.payload;
    },
    setActivities(state, action) {
      state.list = action.payload || [];
    },
  },
});

export const {
  setIsLoading,
  setError,
  setSuccess,
  setActivities,
} = activitySlice.actions;

export default activitySlice.reducer;
