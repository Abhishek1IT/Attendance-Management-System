import api from "./axios";  

export const loginApi = (data) => 
    api.post("/auth/login", data);

export const registerApi = (data) => 
    api.post("/auth/register", data);

export const logoutApi = () =>
    api.post("/auth/logout");

export const myProfileApi = async () => {
    try {
        return await api.get("/user/me");
    } catch (error) {
        if (error.response?.status === 404) {
            return api.get("/auth/me");
        }
        throw error;
    }
};

export const myprofileApi = myProfileApi;