// When REACT_APP_API_URL is empty string, all calls become relative (e.g. /items/)
// and Nginx proxies them to the backend container.
// When not set, falls back to the hosted pythonanywhere instance.
const API_BASE = process.env.REACT_APP_API_URL !== undefined
  ? process.env.REACT_APP_API_URL
  : 'https://Drakon4ik.pythonanywhere.com';

export default API_BASE;
