import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext()


const AppContextProvider =(props)=>{

axios.defaults.withCredentials = true    

const  backendUrl = import.meta.env.VITE_BACKEND_URL 
const [isLoggedin, setIsoggedin] = useState(false) 
const [userData, setUserData] = useState(false) 


const getAuthState = async()=>{
    try {
        const {data} = await axios.get(`${backendUrl}/api/auth/is-auth`)
        if(data.success){
            setIsoggedin(true)
            getUserData()
        }
    } catch (error) {
        toast.error(error.message)
    }
}

const getUserData = async()=>{
    try {
        const {data} = await axios.get(`${backendUrl}/api/user/data`)
        data.success ? setUserData(data.userData) : toast.error(data.message)
    } catch (error) {
        toast.error(error.message)
    }
}


useEffect(()=>{
    getAuthState()
},[])



 const  value={
    backendUrl,isLoggedin,setIsoggedin,userData,setUserData,getUserData
  }
    return(
        <AppContext.Provider value={value}>
         {props.children}
        </AppContext.Provider>
    )

}


export default AppContextProvider