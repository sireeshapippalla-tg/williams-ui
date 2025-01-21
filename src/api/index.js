// export const BASE_API_URL = 'http://3.27.226.110:8084/iassure/api/';
export const BASE_API_URL = 'http://13.236.54.105:8084/iassure/api/';
// export const METERSLIS = BASE_API_URL +
export const fetchIncidentDetailsDashboard = BASE_API_URL + 'incident/fetchIncidentDetailsDashboard'   //{"orgId":1,"incidentStatusId":34,"userId":1}
export const getMastersListByType = BASE_API_URL + 'incident/getMastersListByType'   //{"sourceName":"Incident Status / Incident Source / Incident Category / Incident Severity"}
export const getIncidentCountDetails1 = BASE_API_URL + 'incident/getIncidentCountDetails'   //{"orgId":1,"userId":1}
export const addIncident = BASE_API_URL + 'incident/addIncident'     //{"orgId": 1,"sourceId": 1,"categoryId": 5, "caseSummary": "This is test summary", "caseDescription": "This is test description", "severityId": 9, "attachmentUrl": "this is test url","assignedUserID": 2, "incidentStatusID": 34,"incidentId":31}
export const savePreventiveAction = BASE_API_URL + 'incident/savePreventiveAction'  //{ "orgId":1,"userId":1,"incidentID":4,//"preventiveID":3,While Updating only "findings":"This is preventive action test for 4th incidentID update"}
export const addMasterByType = BASE_API_URL + 'incident/addMasterByType'  //{ "sourceType":"Test Category", "sourceName":"Incident Category"}
export const getIncidentDetailsById = BASE_API_URL + 'incident/getIncidentDetailsById'  //{"orgId":1, "incidentId":3,"userId":0}
export const getAllUsers = BASE_API_URL + 'users/getAllUsers'  //{"orgId":1}
export const getPreventiveActionDetails = BASE_API_URL + 'incident/getPreventiveActionDetails' //{"orgId":1, "incidentId":3, "userId":0}
export const saveIncidentInterim = BASE_API_URL + 'incident/saveIncidentInterim'  //{"findings":"This intermin Incident from postman", "interimId":1, "incidentId":3, "userId":1}
export const getIncidentInterimDetails = BASE_API_URL + 'incident/getIncidentInterimDetails'
export const getAllDepartments = BASE_API_URL + 'users/getAllDepartments'
export const getAllUserByDepartment = BASE_API_URL + 'users/getUsersByDepartment'
export const addIncidentWithAI = BASE_API_URL + 'incident/addIncidentWithAI'
export const getEmployeesAndManager = BASE_API_URL + 'users/getEmployeesAndManager'
export const createUser = BASE_API_URL + 'users/createUser'
export const getIncidentChats = BASE_API_URL + 'incident/getIncidentChats'
export const saveIncidentChart = BASE_API_URL + 'incident/saveIncidentChats'
export const getUserTypes = BASE_API_URL + 'users/getUserTypes'
export const uploadDocuments = BASE_API_URL + 'incident/uploadDocuments'
export const deleteUser = BASE_API_URL + 'users/deleteUser'
export const getUsersById = BASE_API_URL + 'users/getUsersById'
export const saveRootCause = BASE_API_URL + 'incident/saveRootCause'
export const getRootCauseDetails = BASE_API_URL + 'incident/getRootCauseDetails'
export const saveIncidentAssign = BASE_API_URL + 'incident/saveIncidentAssign';
export const getIncidentAssignDetails = BASE_API_URL + 'incident/getIncidentAssignDetails';
export const saveTasksForCap = BASE_API_URL + 'incident/saveTasksForCap'
export const getIncidentHistory = BASE_API_URL + 'incident/getIncidentHistory'
export const login = BASE_API_URL + 'users/login'
export const getTasksForIncident = BASE_API_URL + 'incident/getTasksForIncident'
export const saveCorrectiveAction = BASE_API_URL + 'incident/saveCorrectiveAction'
export const getIncidentCAPDetails = BASE_API_URL + 'incident/getIncidentCAPDetails'
export const downloadFile = BASE_API_URL + 'incident/downloadFile'
export const deleteFile = BASE_API_URL + 'incident/deleteFile'
export const getNotifications = BASE_API_URL + 'incident/getNotifications'
export const closeIncident = BASE_API_URL + 'incident/closeIncident'
export const addTasksWithAI = BASE_API_URL + 'incident/addTasksWithAI'
export const deleteProblemRootCause = BASE_API_URL + 'incident/deleteProblemRootCause'
export const addDashboardWithAI = BASE_API_URL + 'incident/addDashboardWithAI'
export const getSuggestions = BASE_API_URL + 'incident/getSuggestions'
export const getTasksByDepartment = BASE_API_URL + 'incident/getTasksByDepartment'
export const saveTasksForDepartment = BASE_API_URL + 'incident/saveTasksForDepartment'
export const createFields = BASE_API_URL + 'incident/createFields'
export const getIncidentFields = BASE_API_URL + 'incident/getIncidentFields'
export const getAllFields = BASE_API_URL + 'incident/getAllFields'
export const deleteIncidentField = BASE_API_URL + 'incident/deleteIncidentField'
export const deleteField = BASE_API_URL + 'incident/deleteField'
export const submitFields = BASE_API_URL + 'incident/submitFields'
export const saveDepartment = BASE_API_URL + 'users/saveDepartment'
export const forgotPassword = BASE_API_URL + 'users/forgotPassword'

export const config = 'IAssure'