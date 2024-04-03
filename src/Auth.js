import axios from 'axios';
export const tokenKey='new_token';
export const setLocalStorage=(key,token)=>{
    localStorage.setItem(key,token);
}
export const  deleteLocalStorage=(key)=>{
    localStorage.removeItem(key);
}
export const getToken=(key)=>{
    return localStorage.getItem(key);
}

export let httpRequest=(config)=>{
    return axios({
        ...config,
        headesr:{
            Authorization:getToken(tokenKey)?'Bearer '+getToken(tokenKey):''
        }
    })
}
export let signin=(object)=>{
    let config={
        url:`https://autoapi.dezinfeksiyatashkent.uz/api/auth/signin`,
        method:'post',
        data:object
    }
    return httpRequest(config);
}