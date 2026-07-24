import { combineReducers } from "@reduxjs/toolkit"

import authReducer from "../slices/authSlice"
import cartReducer from "../slices/cartSlice"
import courseReducer from "../slices/courseSlice"
import profileReducer from "../slices/profileSlice"
import viewCourseReducer from "../slices/viewCourseSlice"
import classroomReducer from "../slices/classroomSlice"

import sidebarSlice from "../slices/sidebarSlice"
import themeReducer from "../slices/themeSlice"

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  course: courseReducer,
  cart: cartReducer,
  viewCourse: viewCourseReducer,
  sidebar: sidebarSlice,
  classroom: classroomReducer,
  theme: themeReducer,
})

export default rootReducer
