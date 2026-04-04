import api from "./client"

export const fetchLocations = async (queryParams = {}) => {
    const response = await api.get('/location', {params:queryParams});
    return response.data;
}

