import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fields: [],
  isLoading: false,
  error: null,
};

const fieldSlice = createSlice({
  name: 'field',
  initialState,
  reducers: {
    setFields: (state, action) => {
      state.fields = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setFields, setIsLoading, setError } = fieldSlice.actions;
export default fieldSlice.reducer;
