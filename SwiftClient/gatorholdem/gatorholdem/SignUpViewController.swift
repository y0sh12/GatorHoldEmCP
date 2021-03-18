//
//  SignUpViewController.swift
//  GatorHoldEm
//
//  Created by Getharanath Aruleeswar on 2/15/21.
//

import UIKit

class SignUpViewController: UIViewController {
    
    
    @IBOutlet weak var UserNameTF: UITextField!
    @IBOutlet weak var EmailTF: UITextField!
    @IBOutlet weak var PasswordTF: UITextField!
    @IBOutlet weak var SignUpButton: UIButton!
    @IBOutlet weak var ErrorLabel: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setUpElements()
        // Do any additional setup after loading the view.
    }
    
    func validateFields() -> String?{
        
        if UserNameTF.text?.trimmingCharacters(in: .whitespacesAndNewlines) == "" ||
            PasswordTF.text?.trimmingCharacters(in: .whitespacesAndNewlines) == "" ||
            EmailTF.text?.trimmingCharacters(in: .whitespacesAndNewlines) == "" {
                return "Please fill in all fields"
        }
        
        let cleanedPassword = PasswordTF.text!.trimmingCharacters(in: .whitespacesAndNewlines)
        let passwordTest = NSPredicate(format: "SELF MATCHES %@", "^(?=.*[a-z])(?=.*[$@$#!%*?&])[A-Za-z\\d$@$#!%*?&]{8,}")
        
        if(passwordTest.evaluate(with: cleanedPassword) == false){
            return "Please make sure your password is at least 8 characters, contains a special character, and a number"
        }
        
        return nil
    }
    
    
    @IBAction func SignUpTapped(_ sender: Any) {
        let error = validateFields()
        
        if error != nil {
            showError(message: error!)
        }
        else{
            ErrorLabel.alpha = 0;
            let apiCall = API();

            let callResp = apiCall.newUser(userName: UserNameTF.text!.trimmingCharacters(in: .whitespacesAndNewlines), password: PasswordTF.text!.trimmingCharacters(in: .whitespacesAndNewlines), balance: 1000, email: EmailTF.text!.trimmingCharacters(in: .whitespacesAndNewlines))
            
            if callResp == "username has been taken" {
                showError(message: "Username has been taken")
            }
            else if callResp == "you have successfully added an account to the db"{
                showError(message: "Account has been created")
                
                transitionToHome()
            }
            else{
                showError(message: "WTF")
            }
        }
    }

    
    func setUpElements(){
        ErrorLabel.alpha = 0
    }
    
    func showError(message: String){
        ErrorLabel.text = message
        ErrorLabel.alpha = 1
    }
    
    func transitionToHome(){
        let homeViewController = storyboard?.instantiateViewController(identifier: Constants.StoryBoard.HomeViewController) as? HomeViewController
        
        view.window?.rootViewController = homeViewController
        view.window?.makeKeyAndVisible()
    }
}
