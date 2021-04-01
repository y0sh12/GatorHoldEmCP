# API Details

###GetUserAPI

#####Api route:
/users/all
#####Type:
GET

#####Possible responses:  
200 OK response:
Returns list of all users and relevant information
Response format:
```json
{
    "id": integer
    "email": string
    "username": string
    "created_on": string 
}
```

#####Api route:
/users/find/{username}
#####Type:
GET
#####Path:
username: user to find


#####Possible responses:  
200 OK response:
Returns user information
Response format:
```json
{
    "balance": integer
    "created_on": string 
    "email": string
    "id": integer
    "username": string
}
```

404 Not Found response:  
Returns when unable to identify user
Response format:
```json
{
    "response": "user not found"
}
```

#####Api route:
/users/find/{username}/balance
#####Type:
GET
#####Path:
username: user to find


#####Possible responses:  
200 OK response:
Returns user balance
Response format:
```json
{
    "balance": integer
}
```

404 Not Found response:  
Returns when unable to identify user
Response format:
```json
{
    "response": "user not found"
}
```
###DeleteUserAPI

#####Api route:
/users/delete/{username}
#####Type:
GET
#####Path:
username: user to find

#####Possible responses:  
200 OK response:
User has been deleted and a confirmation message is sent back
Response format:
```json
{
    "response": "Successfully deleted user: {username}"
}
```

404 Not Found response:  
Returns when unable to identify user
Response format:
```json
{
    "response": "user not found"
}
```

###CreateUserAPI
#####Api route:
/new  
#####Type:
POST
#####Req Body:
```json
{
    "username" : "username",
    "password" : "securepassword",
    "balance" : 500,
    "email" : "sampleemail@emailserver.com"
}
```
#####Possible responses:  
200 OK response:  
occurs when user is successfully added to the database
Response format:
```json
{
    "response": "you have successfully added an account to the db"
}
```
400 Bad Request response:  
occurs when username/email is already in use
Response format:
```json
{
    "response": "username has been taken"
}
```
Also occurs when one or more values are missing in the request body
Response format:
```json
{
    "response": "you're missing one or more values in the body"
}
```



###AuthenticateUserAPI
#####Api route:
/auth
#####Type:
POST
#####Req Body:
```json
{
    "username" : "userid",
    "password" : "correctpassword"
}
```
#####Possible responses:  
200 OK response:  
occurs when username and password are correct
Response format:
```json
{
    "response": "True"
}
```
400 Bad Request response:
Occurs when one or more values are missing in the request body
Response format:
```json
{
    "response": "you're missing one or more values in the body"
}
```
403 Forbidden response:
occurs when username and password are incorrect
```json
{
    "response": "False"
}
```
404 Not Found Response:
occurs when username is not in db
```json
{
    "response": "Username doesn't exist in database"
}
```

###UpdatePasswordAPI
#####Api route:
/change_password
#####Type:
PATCH
#####Req Body:
```json
{
    "username" : "userid",
    "old_password" : "oldPass",
    "new_password" : "newStrongerPass"
}
```
#####Possible responses:  
200 OK response:  
occurs when username and password are correct and password is updated
Response format:
```json
{
    "response": "Your password has been updated!"
}
```
400 Bad Request response:
Occurs when one or more values are missing in the request body
Response format:
```json
{
    "response": "you're missing one or more values in the body"
}
```
403 Forbidden response:
occurs when username and password are incorrect
```json
{
    "response": "Old password doesn't match records"
}
```
404 Not Found Response:
occurs when username is not in db
```json
{
    "response": "Username doesn't exist in database"
}
```


###UpdateBalanceAPI
#####Api route:
/change_balance
#####Type:
PATCH
#####Req Body:
```json
{
    "id" : "4e2cb6e0-6640-11eb-8192-1e00ea0c3f49",
    "change" : 1000000000
}
```
#####Possible responses:  
200 OK response:  
occurs balance has been successfully updated
Response format:
```json
{
    "response": "Balance has been updated to {account.balance}"
}
```
400 Bad Request response:
Occurs when one or more values are missing in the request body
Response format:
```json
{
    "response": "you're missing one or more values in the body"
}
```
404 Not Found Response:
occurs when id is not in db
```json
{
    "response": "Id doesn't exist in database"
}
```
