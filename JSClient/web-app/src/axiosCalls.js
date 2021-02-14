import axios, {AxiosError} from 'axios';

const userData = axios.create();

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
        if(err.toString().includes('500')){
            response.errors = "Lol idk what happened"
        }
        }
    return response;
}


export default userData;