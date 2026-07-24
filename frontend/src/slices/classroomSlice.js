import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  classrooms: [],           // list of classrooms (my classrooms or enrolled)
  currentClassroom: null,   // full detail of a single classroom
  loading: false,
};

const classroomSlice = createSlice({
  name: "classroom",
  initialState,
  reducers: {
    setClassrooms(state, action) {
      state.classrooms = action.payload;
    },
    setCurrentClassroom(state, action) {
      state.currentClassroom = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    clearClassroom(state) {
      state.currentClassroom = null;
    },
  },
});

export const { setClassrooms, setCurrentClassroom, setLoading, clearClassroom } =
  classroomSlice.actions;

export default classroomSlice.reducer;
