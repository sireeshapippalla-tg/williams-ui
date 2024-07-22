export const BASE_API_URL = 'http://15.206.179.26:8084/iassure/api/';
// export const METERSLIS = BASE_API_URL +
export const fetchIncidentDetailsDashboard = BASE_API_URL + 'incident/fetchIncidentDetailsDashboard'   //{"orgId":1,"incidentStatusId":34,"userId":1}
export const getMastersListByType = BASE_API_URL + 'incident/getMastersListByType'   //{"sourceName":"Incident Status / Incident Source / Incident Category / Incident Severity"}
export const getIncidentCountDetails = BASE_API_URL + 'incident/getIncidentCountDetails'   //{"orgId":1,"userId":1}
export const addIncident = BASE_API_URL + 'incident/addIncident'     //{"orgId": 1,"sourceId": 1,"categoryId": 5, "caseSummary": "This is test summary", "caseDescription": "This is test description", "severityId": 9, "attachmentUrl": "this is test url","assignedUserID": 2, "incidentStatusID": 34,"incidentId":31}
export const savePreventiveAction = BASE_API_URL + 'incident/savePreventiveAction'  //{ "orgId":1,"userId":1,"incidentID":4,//"preventiveID":3,While Updating only "findings":"This is preventive action test for 4th incidentID update"}
export const addMasterByType = BASE_API_URL + 'incident/addMasterByType'  //{ "sourceType":"Test Category", "sourceName":"Incident Category"}
export const getIncidentDetailsById = BASE_API_URL + 'incident/getIncidentDetailsById'  //{"orgId":1, "incidentId":3,"userId":0}
export const getAllUsers = BASE_API_URL + 'incident/getAllUsers'  //{"orgId":1}
export const getPreventiveActionDetails = BASE_API_URL + 'incident/getPreventiveActionDetails' //{"orgId":1, "incidentId":3, "userId":0}
export const saveIncidentInterim = BASE_API_URL + 'incident/saveIncidentInterim'  //{"findings":"This intermin Incident from postman", "interimId":1, "incidentId":3, "userId":1}
export const getIncidentInterimDetails = BASE_API_URL + 'incident/getIncidentInterimDetails'


export const config = 'IAssure'