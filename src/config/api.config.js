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
  inviteDatabaseMember: (id) => `/dbs/${id}/invite`,
  getDatabaseMembers: (id) => `/dbs/${id}/members`,
  updateDatabaseMember: (dbId, memberId) => `/dbs/${dbId}/members/${memberId}`,
  deleteDatabaseMember: (dbId, memberId) => `/dbs/${dbId}/members/${memberId}`,
  getDatabaseLogs: (id) => `/dbs/${id}/logs`,
  getDatabaseById: (id) => `/dbs/${id}`,
  getProjectById: (id) => `/projects/${id}`,
  getDatabasesByProjectId: (projectId) => `/projects/${projectId}/dbs`,
  deleteDatabase: (id) => `/dbs/${id}`,
  acceptInvitation: "/dbs/invitations/accept",
  databaseAuditLogs: (dbId) => `/dbs/${dbId}/logs`,
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
