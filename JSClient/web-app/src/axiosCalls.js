import axios, {AxiosError} from 'axios';

const userData = axios.create();


//REGISTER AXIOS CALL
userData.createUser = async function(user){
    const response = {
        errors: "",
        created: false,
    }
    try{
    const userCreate = await axios.post('http://127.0.0.1:5000/new', user);
    if(userCreate.data.response === "you have successfully added an account to the db"){
        response.created = true;
    }
}
    catch(err){
        if(err.toString().includes('400')) {
        response.errors = "Username already exists!"
        }
        else{
            response.errors = "Lol idk what happened"
        }
        }
    return response;
}


//LOGIN AXIOS CALL
userData.loginUser = async function(credentials) {
    const response = {
        errors: "",
        loggedIn: false,
    }
    console.log(credentials);
    try{
        const userLogin = await axios.post('http://127.0.0.1:5000/auth', credentials);
        if(userLogin.data.response === "True"){
            response.loggedIn = true;
        }
    }
    catch(err) {
        if (err.toString().includes('403')){
            response.errors = "Username/Password do not match!"
        }
        else if(err.toString().includes('404')){
            response.errors = "Username/Password does not exist!"
        }
        else{
            response.errors = "bruh idk what happened"
        }
    }
    return response;
}


//RESET PASSWORD AXIOS CALL
userData.resetPass = async function(reset) {
    const response = {
        errors: "",
        isReset: false,
    }
    try{
        const userReset = await axios.patch('http://127.0.0.1:5000/change_password', reset);
        if(userReset.data.response === "Your password has been updated!"){
            response.isReset = true;
        }
    }
    catch(err){
        if (err.toString().includes('403')){
            response.errors = "Username/Old password do not match!"
        }
        else if(err.toString().includes('404')){
            response.errors = "Username does not exist!"
        }
        else{
            response.errors = "bruh idk what happened"
        }
    }
    return response;
}


export default userData;