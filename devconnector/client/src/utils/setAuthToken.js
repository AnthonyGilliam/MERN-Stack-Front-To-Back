import axios from "axios";

const setAuthToken = token => {
    if (token) {
        // Set default request header for all requests only if user logs in
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete axios.defaults.headers.common['x-auth-token'];
    }
}

export default setAuthToken;