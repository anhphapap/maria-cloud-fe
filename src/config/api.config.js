import axios from "axios";

import cookie from "react-cookies";

const BASE_URL = "http://localhost:8080/mariadb/api";

export const endpoints = {
  login: "/auth/login",
  register: "/auth/register",
  getProjects: "/projects",
  createProject: "/projects",
  deleteProject: (id) => `/projects/${id}`,
  getDatabases: "/dbs",
  createDatabase: "/dbs",
  getDatabasesByProjectId: (projectId) => `/projects/${projectId}/dbs`,
  deleteDatabase: (id) => `/dbs/${id}`,
};

export const authApis = () =>
  axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${cookie.load("token")}`,
    },
  });

export default axios.create({
  baseURL: BASE_URL,
});
