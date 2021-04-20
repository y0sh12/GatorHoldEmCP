//
//  ChangePasswordViewController.swift
//  gatorholdem
//
//  Created by Getharanath Aruleeswar on 4/15/21.
//

import UIKit



class ChangePasswordViewController: UIViewController {

    @IBOutlet weak var OldPasswordTF: UITextField!
    @IBOutlet weak var NewPasswordTF: UITextField!
    @IBOutlet weak var ConfirmNewPasswordTF: UITextField!
    @IBOutlet weak var ErrorLabel: UILabel!
    @IBOutlet weak var ResetButton: UIButton!
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.hideKeyboardWhenTappedAround() 
        ErrorLabel.alpha = 0

    }
    
    @IBAction func ResetButtonTapped(_ sender: Any) {
        let error = validateFields()
        
        if error != nil {
            showError(message: error!)
        }
        else{
            let apiCall = API();

            let callResp = apiCall.changePassword(userName: player_dict.sharedInstance.name, oldPassword: OldPasswordTF.text!, newPassword: NewPasswordTF.text!)
            
            print(callResp)
            if(callResp == "Your password has been updated!"){
                ErrorLabel.text = callResp
                ErrorLabel.textColor = UIColor.green
            }
            else{
                ErrorLabel.text = callResp
                ErrorLabel.textColor = UIColor.red
            }
        }
    }
    
    func showError(message: String){
        ErrorLabel.text = message
        ErrorLabel.alpha = 1
    }
    
    func validateFields() -> String?{
        
        if OldPasswordTF.text?.trimmingCharacters(in: .whitespacesAndNewlines) == "" ||
            NewPasswordTF.text?.trimmingCharacters(in: .whitespacesAndNewlines) == "" ||
            ConfirmNewPasswordTF.text?.trimmingCharacters(in: .whitespacesAndNewlines) == "" {
                return "Please fill in all fields"
        }
        if(NewPasswordTF.text != ConfirmNewPasswordTF.text){
            return "Please make sure your passwords match"
        }
        
        let cleanedPassword = NewPasswordTF.text!.trimmingCharacters(in: .whitespacesAndNewlines)
        let passwordTest = NSPredicate(format: "SELF MATCHES %@", "^(?=.*[a-z])(?=.*[$@$#!%*?&])[A-Za-z\\d$@$#!%*?&]{8,}")
        
        if(passwordTest.evaluate(with: cleanedPassword) == false){
            return "Please make sure your new password is at least 8 characters, contains a special character, and a number"
        }
        
        return nil
    }
}
