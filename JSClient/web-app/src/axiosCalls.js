import axios, {AxiosError} from 'axios';

const userData = axios.create();


//REGISTER AXIOS CALL
userData.createUser = async function(user){
    const response = {
        errors: "",
        created: false,
    }
    try{
    const userCreate = await axios.post('http://abaig.pythonanywhere.com/new', user);
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
        const userLogin = await axios.post('http://abaig.pythonanywhere.com/auth', credentials);
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
        const userReset = await axios.patch('http://abaig.pythonanywhere.com/forgot_password/change_password', reset);
        if(userReset.data.response === "Your password has been updated!"){
            response.isReset = true;
        }
    }
    catch(err){
        if (err.toString().includes('403')){
            response.errors = "You have already used this password before, please choose a different password!"
        }
        else if(err.toString().includes('404')){
            response.errors = "Username/Email does not exist!"
        }
        else if (err.toString().includes('500')){
            response.errors = "bruh idk what happened"
        }
        else{
            response.errors = "The Password Reset link has expired!"
        }
    }
    return response;
}

//SEND PASSWORD RESET LINK AXIOS CALL
userData.resetPassEmail = async function(email){
    const response = {
        errors: "",
        isSent: false,
    }
    try{
        const userReset = await axios.patch('http://abaig.pythonanywhere.com/forgot_password', email);
        console.log(userReset.data.response);
        if(userReset.data.response.toString().includes('UTC')){
            response.isSent = true;
        }
    }
    catch(err) {
        if(err.toString().includes('404')){
            response.errors = "Email does not exist!"
        }
    }
    return response;
}

//PLAYER BALANCE AXIOS CALL
userData.getBalance = async function(username) {
        const userBalance = await axios.get('http://abaig.pythonanywhere.com/users/find/' + username + '/balance');
        if(userBalance.data.balance != null){
            return userBalance.data.balance
        }
        else{
            return "Balance not found"
        }
}

//SET BALANCE AXIOS CALL
userData.setBalance = async function(info){
    const response = {
        errors: "",
        isChanged: false,
    }
    const userBalance = await axios.patch('http://abaig.pythonanywhere.com/change_balance', info);
    try{
        if(userBalance.data.response === "Balance has been updated to ") {
            response.isChanged = true;
        }
    }
    catch(err){
        if(err.toString().includes('404')){
            response.errors = "ID does not exist!";
        }
        else{
            response.errors = "bruh idk what happened";
        }
    }
    return response;
}

//PLAYER ID AXIOS CALL
userData.getID = async function(username) {
    const userID = await axios.get('http://abaig.pythonanywhere.com/users/find/' + username);;
        return userID.data.id;

}


//ACCOUNT VERIFICATION CHECKER AXIOS CALL
userData.verifiedOrNot = async function(username) {
    const userVerified = await axios.get('http://abaig.pythonanywhere.com/users/find/' + username);
    return userVerified.data.email_verified;
}


export default userData;