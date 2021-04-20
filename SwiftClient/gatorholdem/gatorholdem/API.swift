//
//  API.swift
//  GatorHoldEm
//
//  Created by Getharanath Aruleeswar on 2/18/21.
//

import Foundation

class API{
    let baseURl = "http://abaig.pythonanywhere.com" //http://127.0.0.1:5000
    
    func allUsers(){
        let url = URL(string: baseURl + "/users/all")
        
        guard url != nil else {
            print("Error Creating URL Object")
            return
        }

        var request = URLRequest(url: url!, cachePolicy: .useProtocolCachePolicy, timeoutInterval: 30)
        
        request.httpMethod = "GET"

        let session = URLSession.shared
        
        let dataTask = session.dataTask(with: request) { (data, response, error) in
            //print(response)
            if error == nil && data != nil {
                do {
                    let dictionary = try JSONSerialization.jsonObject(with: data!, options: .mutableContainers) as? [Any]
                    print(dictionary as Any)
                }
                catch {
                    print("Error Parsing Response Data")
                }
            }
        }
        dataTask.resume()
    }

    func newUser(userName: String, password: String, balance: Int, email: String) -> String{
        let sem = DispatchSemaphore.init(value: 0)
        var resp: String = ""
        let url = URL(string: baseURl + "/new")
        guard url != nil else {
            print("Error Creating URL Object")
            return resp
        }
        
        var request = URLRequest(url: url!, cachePolicy: .useProtocolCachePolicy, timeoutInterval: 30)
        
        
        let headers = [
            "content-type": "application/json"
        ]
        
        request.allHTTPHeaderFields = headers
        
        
        let jsonObject = [
            "username" : userName,
            "password" : password,
            "balance" : balance,
            "email" : email
        ] as [String:Any]
        
        do{
            let requestBody = try JSONSerialization.data(withJSONObject: jsonObject, options: .fragmentsAllowed)
            request.httpBody = requestBody
        }
        catch{
            print("Error Creating Data Object From JSON")
        }
        
        request.httpMethod = "POST"
        
        let session = URLSession.shared
        
        session.dataTask(with: request) { (data, response, error) in
            if error == nil && data != nil {
                do {
                    let dictionary = try JSONSerialization.jsonObject(with: data!, options: .mutableContainers) as? [String:Any]
                    resp = (dictionary!["response"]!) as! String
                    sem.signal()
                }
                catch {
                    print("Error Parsing Response Data")
                    resp = "error"
                    sem.signal()
                }
            }
        }.resume()
        
        sem.wait()
        return resp
    }

    func auth(userName: String, password: String) -> String{
        let url = URL(string: baseURl + "/auth")
        var resp: String = ""
        let sem = DispatchSemaphore.init(value: 0)
        guard url != nil else {
            print("Error Creating URL Object")
            return ""
        }
        
        var request = URLRequest(url: url!, cachePolicy: .useProtocolCachePolicy, timeoutInterval: 30)
        
        
        let headers = [
            "content-type": "application/json"
        ]
        
        request.allHTTPHeaderFields = headers
        
        let jsonObject = [
            "username" : userName,
            "password" : password
        ] as [String:String]
        
        do{
            let requestBody = try JSONSerialization.data(withJSONObject: jsonObject, options: .fragmentsAllowed)
            request.httpBody = requestBody
        }
        catch{
            print("Error Creating Data Object From JSON")
        }
        
        request.httpMethod = "POST"
        
        let session = URLSession.shared
        
        let dataTask = session.dataTask(with: request) { (data, response, error) in
            //print(response!)
            if error == nil && data != nil {
                do {
                    let dictionary = try JSONSerialization.jsonObject(with: data!, options: .mutableContainers) as? [String:Any]
                    //print(dictionary as Any)
                    
    //                if let response = dictionary["response"] as? [String] {
    //                            print(response)
    //                        }
                    
                    resp = (dictionary!["response"]!) as! String
                    sem.signal()
                
                }
                catch {
                    print("Error Parsing Response Data")
                    resp = "error"
                    sem.signal()
                }
            }
        }
        dataTask.resume()
        
        sem.wait();
        
        return resp
    }


    func changePassword(userName: String, oldPassword: String, newPassword: String) -> String{
        let url = URL(string: baseURl + "/change_password")
        var resp: String = ""
        let sem = DispatchSemaphore.init(value: 0)
        
        guard url != nil else {
            print("Error Creating URL Object")
            return ""
        }
        
        var request = URLRequest(url: url!, cachePolicy: .useProtocolCachePolicy, timeoutInterval: 30)
        
        
        let headers = [
            "content-type": "application/json"
        ]
        
        request.allHTTPHeaderFields = headers
        
        let jsonObject = [
            "username" : userName,
            "old_password" : oldPassword,
            "new_password" : newPassword
        ] as [String:String]
        
        do{
            let requestBody = try JSONSerialization.data(withJSONObject: jsonObject, options: .fragmentsAllowed)
            request.httpBody = requestBody
        }
        catch{
            print("Error Creating Data Object From JSON")
        }
        
        request.httpMethod = "PATCH"
        
        let session = URLSession.shared
        
        let dataTask = session.dataTask(with: request) { (data, response, error) in
            //print(response!)
            if error == nil && data != nil {
                do {
                    let dictionary = try JSONSerialization.jsonObject(with: data!, options: .mutableContainers) as! [String:Any]
                    //print(dictionary as Any)
                    
                    resp = (dictionary["response"]!) as! String
                    sem.signal()
                }
                catch {
                    print("Error Parsing Response Data")
                    resp = "error"
                    sem.signal()
                }
            }
        }
        dataTask.resume()
        
        sem.wait();
        
        return resp
    }
    
    
    
    
    func forgotPassword(email: String){
        let url = URL(string: baseURl + "/forgot_password")
        guard url != nil else {
            print("Error Creating URL Object")
            return
        }

        var request = URLRequest(url: url!, cachePolicy: .useProtocolCachePolicy, timeoutInterval: 30)
        let headers = [
            "content-type": "application/json"
        ]

        request.allHTTPHeaderFields = headers
        let jsonObject = [
            "email" :email
        ] as [String:String]

        do{
            let requestBody = try JSONSerialization.data(withJSONObject: jsonObject, options: .fragmentsAllowed)
            request.httpBody = requestBody
        }
        catch{
            print("Error Creating Data Object From JSON")
        }

        request.httpMethod = "PATCH"

        let session = URLSession.shared

        let dataTask = session.dataTask(with: request) { (data, response, error) in
            if error == nil && data != nil {
                do {
                    let dictionary = try JSONSerialization.jsonObject(with: data!, options: .mutableContainers) as! [String:Any]
                    print(dictionary as Any)
                }
                catch {
                    print("Error Parsing Response Data")
                }
            }
        }
        dataTask.resume()
    }
    
    func checkVerified(userName: String) -> String{
        let url = URL(string: baseURl + "/users/find/" + userName)
        var resp: String = ""
        let sem = DispatchSemaphore.init(value: 0)
        
        guard url != nil else {
            print("Error Creating URL Object")
            return ""
        }

        var request = URLRequest(url: url!, cachePolicy: .useProtocolCachePolicy, timeoutInterval: 30)
        let headers = [
            "content-type": "application/json"
        ]

        request.allHTTPHeaderFields = headers
        
        request.httpMethod = "GET"

        let session = URLSession.shared
        
        let dataTask = session.dataTask(with: request) { (data, response, error) in
            //print(response)
            if error == nil && data != nil {
                do {
                    let dictionary = try JSONSerialization.jsonObject(with: data!, options: .mutableContainers) as? [String:Any]
                    print(dictionary as Any)
                    resp = (dictionary!["email_verified"]!) as! String
                    sem.signal()
                }
                catch {
                    print("Error Parsing Response Data")
                    resp = "error"
                    sem.signal()
                    
                }
            }
        }
        dataTask.resume()
        sem.wait()
        
        return resp
    }
    
    func getBalance(userName: String) -> (id: String, balance: Int){
        let url = URL(string: baseURl  + "/users/find/" + userName)
        var balance: Int = 0
        var id: String = ""
        let sem = DispatchSemaphore.init(value: 0)
        
        guard url != nil else {
            print("Error Creating URL Object")
            return ("", 0)
        }

        var request = URLRequest(url: url!, cachePolicy: .useProtocolCachePolicy, timeoutInterval: 30)
        let headers = [
            "content-type": "application/json"
        ]

        request.allHTTPHeaderFields = headers
        
        request.httpMethod = "GET"

        let session = URLSession.shared
        
        let dataTask = session.dataTask(with: request) { (data, response, error) in
            //print(response)
            if error == nil && data != nil {
                do {
                    let dictionary = try JSONSerialization.jsonObject(with: data!, options: .mutableContainers) as? [String:Any]
                    print(dictionary as Any)
                    balance = (dictionary!["balance"]!) as! Int
                    id = (dictionary!["id"]!) as! String
                    sem.signal()
                }
                catch {
                    print("Error Parsing Response Data")
                    id = "error"
                    balance = 404
                    sem.signal()
                    
                }
            }
        }
        dataTask.resume()
        sem.wait()
        
        return (id, balance)
    }
    
    func resetBalance(id: String) -> String{
        var resp: String = ""
        let sem = DispatchSemaphore.init(value: 0)
        let url = URL(string: baseURl  + "/reset_balance" )
        guard url != nil else {
            print("Error Creating URL Object")
            return ""
        }
        var request = URLRequest(url: url!, cachePolicy: .useProtocolCachePolicy, timeoutInterval: 30)
        let headers = [
            "content-type": "application/json"
        ]

        request.allHTTPHeaderFields = headers
        let jsonObject = [
            "id" :id
        ] as [String:String]

        do{
            let requestBody = try JSONSerialization.data(withJSONObject: jsonObject, options: .fragmentsAllowed)
            request.httpBody = requestBody
        }
        catch{
            print("Error Creating Data Object From JSON")
        }

        request.httpMethod = "PATCH"

        let session = URLSession.shared

        let dataTask = session.dataTask(with: request) { (data, response, error) in
            if error == nil && data != nil {
                do {
                    let dictionary = try JSONSerialization.jsonObject(with: data!, options: .mutableContainers) as! [String:Any]
                    resp = (dictionary["response"]!) as! String
                    sem.signal()
                }
                catch {
                    print("Error Parsing Response Data")
                    resp = "error"
                    sem.signal()
                }
            }
        }
        dataTask.resume()
        sem.wait()
        return resp
    }
    
}
