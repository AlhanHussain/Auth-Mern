import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {

const [state, setState] = useState("Sign Up")    

const navigate = useNavigate()

const [name, setName] = useState("")
const [email, setEmail] = useState("")
const [password, setPassword] = useState("")


const {backendUrl, setIsoggedin, getUserData} = useContext(AppContext)


const onSumitHandler = async(e)=>{
    
    
    // const formData = new FormData()
    // formData.append("name", name)
    // formData.append("email", email)
    // formData.append("password", password) 
    e.preventDefault()
    try {
        axios.defaults.withCredentials = true;
        
        if(state === "Sign Up"){
       const {data} =  await axios.post(`${backendUrl}/api/auth/register`, {name,email,password})
       if(data.success){
        setIsoggedin(true)
        getUserData()
           navigate("/")
       }else{
           toast.error(data.message)
       }
        }else{
            const {data} =  await axios.post(`${backendUrl}/api/auth/login`, {email,password})
            if(data.success){
                setIsoggedin(true)
                getUserData()
                navigate("/")
            }else{
                toast.error(data.message)
            } 
        }
    } catch (error) {
        toast.error(error.message)

    }
}


  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
        <img onClick={()=>navigate('/')} src={assets.logo} alt="" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' />

        <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
            <h2 className='text-3xl font-semibold text-white text-center mb-3'>{state === 'Sign Up' ? 'Create  account' : 'Log in '}</h2>
            <p className='text-center text-sm mb-6'>{state === 'Sign Up' ? 'Create your account' : 'Log in to your account'}</p>

       <form onSubmit={onSumitHandler}>

  {state === 'Sign Up' && (

      
      <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.person_icon} alt="" />
            <input onChange={(e)=>setName(e.target.value)} className='bg-transparent outline-none' type="text" placeholder='Full Name' required/>
        </div>
        ) }
        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} alt="" />
            <input onChange={(e=>setEmail(e.target.value))} className='bg-transparent outline-none' type="email" placeholder='Email id' required/>
        </div>
        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} alt="" />
            <input onChange={(e)=>setPassword(e.target.value)} className='bg-transparent outline-none' type="password" placeholder='Password' required/>
        </div>

   <p onClick={()=>navigate('/reset-password')} className='mb-4 text-indigo-500 cursor-pointer'>Forgot password?</p>

   <button className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium'>{state}</button>

       </form>

       {state === 'Sign Up' ? (
       <p className='txt-gray-400 text-center text-xs mt-4'>Already have an account?{' '}
       <span onClick={()=> setState('Login')} className='txt-blue-400 cursor-pointer underline'>Login here</span></p>) 
       : (       <p className='txt-gray-400 text-center text-xs mt-4'>Don't have an account?{' '}
        <span onClick={()=> setState('Sign Up')} className='txt-blue-400 cursor-pointer underline'>Sign Up</span></p>) }



        </div>
    </div>
  )
}

export default Login