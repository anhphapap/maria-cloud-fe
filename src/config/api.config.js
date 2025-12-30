import axios from "axios";

import cookie from "react-cookies";

const BASE_URL = "http://localhost:8080/mariadb/api";

export const endpoints = {
  login: "/auth/login",
  register: "/auth/register",
  dashboard: "/dashboard",
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
  databaseBackups: (dbId) => `/dbs/${dbId}/backups`,
  createBackup: (dbId) => `/dbs/${dbId}/backups`,
  downloadBackup: (dbId, backupId) =>
    `/dbs/${dbId}/backups/${backupId}/download`,
  restoreBackup: (dbId, backupId) => `/dbs/${dbId}/backups/${backupId}`,
  databaseTables: (dbId) => `/dbs/${dbId}/tables`,
  createTable: (dbId) => `/dbs/${dbId}/tables`,
  deleteTable: (dbId, tableName) => `/dbs/${dbId}/tables/${tableName}`,
  importSqlFile: (dbId) => `/dbs/${dbId}/import`,
  getTableData: (dbId, tableName) => `/dbs/${dbId}/tables/${tableName}/data`,
  getTableStructure: (dbId, tableName) =>
    `/dbs/${dbId}/tables/${tableName}/structure`,
  updateTableStructure: (dbId, tableName) => `/dbs/${dbId}/tables/${tableName}`,
  addTableRows: (dbId, tableName) => `/dbs/${dbId}/tables/${tableName}/rows`,
  updateTableRows: (dbId, tableName) => `/dbs/${dbId}/tables/${tableName}/rows`,
  deleteTableRows: (dbId, tableName) => `/dbs/${dbId}/tables/${tableName}/rows`,
  getTableColumns: (dbId, tableName) =>
    `/dbs/${dbId}/tables/${tableName}/columns`,
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
