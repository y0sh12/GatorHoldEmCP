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
        self.hideKeyboardWhenTappedAround() 
        setUpElements()
        // Do any additional setup after loading the view.
    }
    
    func validateFields() -> String?{
        
        if UserNameTF.text?.trimmingCharacters(in: .whitespacesAndNewlines) == "" ||
            PasswordTF.text?.trimmingCharacters(in: .whitespacesAndNewlines) == "" ||
            EmailTF.text?.trimmingCharacters(in: .whitespacesAndNewlines) == "" {
                ErrorLabel.textColor = UIColor.red
                return "Please fill in all fields"
        }
        
        if UserNameTF.text!.count > 12 {
            ErrorLabel.textColor = UIColor.red
            return "Your username is too long"
        }
        
        let cleanedPassword = PasswordTF.text!.trimmingCharacters(in: .whitespacesAndNewlines)
        let passwordTest = NSPredicate(format: "SELF MATCHES %@", "^(?=.*[a-z])(?=.*[$@$#!%*?&])[A-Za-z\\d$@$#!%*?&]{8,}")
        
        if(passwordTest.evaluate(with: cleanedPassword) == false){
            ErrorLabel.textColor = UIColor.red
            
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
                ErrorLabel.textColor = UIColor.red
                showError(message: "Username has been taken")
            }
            else if callResp == "you have successfully added an account to the db"{
                ErrorLabel.textColor = UIColor.green
                showError(message: "A verification link has been sent your email. Please click on the link to continue")
                player_dict.sharedInstance.name = UserNameTF.text!.trimmingCharacters(in: .whitespacesAndNewlines)
                checkUserVerified()
            }
            else{
                ErrorLabel.textColor = UIColor.red
                showError(message: "Error")
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
    
    func checkUserVerified(){
        let apiCall = API();
        let callResp = apiCall.checkVerified(userName: player_dict.sharedInstance.name)
        print(callResp)
        
        if(callResp == "1"){
            transitionToHome()
        }
        else{
            DispatchQueue.main.asyncAfter(deadline: DispatchTime.now() + 5.0, execute: {
                self.checkUserVerified()
            })
        }
    }
    
    func transitionToHome(){
        let homeViewController = storyboard?.instantiateViewController(identifier: Constants.StoryBoard.HomeViewController) as? HomeViewController
        
        view.window?.rootViewController = homeViewController
        view.window?.makeKeyAndVisible()
    }
}
