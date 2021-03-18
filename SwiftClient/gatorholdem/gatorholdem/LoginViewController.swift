//
//  LoginViewController.swift
//  GatorHoldEm
//
//  Created by Getharanath Aruleeswar on 2/15/21.
//

import UIKit

class LoginViewController: UIViewController {
    
    @IBOutlet weak var UserNameTF: UITextField!
    @IBOutlet weak var PasswordTF: UITextField!
    @IBOutlet weak var ErrorLabel: UILabel!
    @IBOutlet weak var LoginButton: UIButton!
    

    override func viewDidLoad() {
        super.viewDidLoad()
        
        setUpElements()

    }
    
    @IBAction func LoginButtonTapped(_ sender: Any) {
        let error = validateFields()
        
        if error != nil {
            showError(message: error!)
        }
        else{
            ErrorLabel.alpha = 0;
            let apiCall = API();

            let callResp = apiCall.auth(userName: UserNameTF.text!.trimmingCharacters(in: .whitespacesAndNewlines), password: PasswordTF.text!.trimmingCharacters(in: .whitespacesAndNewlines))
            
            if callResp == "False" {
                showError(message: "Credentials are incorrect")
            }
            else if callResp == "True"{
                showError(message: "You have signed in")
                transitionToHome()
            }
            else if callResp == "Username doesn't exist in database"{
                showError(message: callResp)
            }
            else{
                showError(message: "WTF")
            }
        }
    }
    
    
    func validateFields() -> String?{
        
        if UserNameTF.text?.trimmingCharacters(in: .whitespacesAndNewlines) == "" ||
            PasswordTF.text?.trimmingCharacters(in: .whitespacesAndNewlines) == "" {
                return "Please fill in all fields"
        }
        
        return nil
    }
    
    
    func setUpElements(){
        ErrorLabel.alpha = 0;
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
