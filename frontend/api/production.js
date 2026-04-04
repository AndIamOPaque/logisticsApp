import api from './client';

export const fetchProductions = async (queryParams = {}) => {
    const response = await api.get('/production-order', {params: queryParams});
    if(response.status !== 200){
        throw new Error(response.data.message || 'Could not load Productions');
    }
    return response.data.data;
}

export const fetchProductionById = async (id) => {
    try{
        const response = await api.get(`/production-order/${id}`);
        return response.data.data;
    }catch(err){
        const message = err.response?.data?.message || 'Could not load Prodcution';
        throw new Error(message);
    }
}

export const recordProductionOutput = async (id, quantityProduced) => {
    try{
        console.log('this is the output data', quantityProduced);
        const response = await api.patch(`production-order/${id}/product-output`, quantityProduced);
        return response.data;
    }catch(err){
        const message = err.response?.data?.message || 'Output Log Failed';
        throw new Error(message);
    }
}


export const changeProductionStatus = async (id, status) => {
    try{
        const response = await api.patch(`production-order/${id}/status`, status);
        return response.data;
    }catch(err){
         const message = err.response?.data?.message || 'Status Change Failed';
        throw new Error(message);
    }
}

export const createProductionOrder = async(orderData)=>{
    try{
        const response = await api.push('production-order', orderData);
        return response.data;
    }catch(err){
        const message = err.response?.data?.message || 'Status Change Failed';
        throw new Error(message);
    }
}