import { ACCOUNT_TYPE } from './../src/utils/constants';

export const sidebarLinks = [
  {
    id: 1,
    name: "Dashboard",
    path: "/dashboard/instructor",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscDashboard",
  },
  {
    id: 1.1,
    name: "Dashboard",
    path: "/dashboard/student",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscDashboard",
  },
  {
    id: 2,
    name: "My Profile",
    path: "/dashboard/my-profile",
    icon: "VscAccount",
  },
  {
    id: 3,
    name: "My Courses",
    path: "/dashboard/my-courses",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscVm",
  },
  {
    id: 5,
    name: "My Classrooms",
    path: "/dashboard/my-classrooms",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscCommentDiscussion",
  },
  {
    id: 7,
    name: "Enrolled Courses",
    path: "/dashboard/enrolled-courses",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscMortarBoard",
  },
  {
    id: 9,
    name: "Joined Classrooms",
    path: "/dashboard/joined-classrooms",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscCommentDiscussion",
  },
  {
    id: 10,
    name: "Admin Console",
    path: "/admin/dashboard",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "VscShield",
  },
];

