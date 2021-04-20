//
//  ForgotPasswordViewController.swift
//  gatorholdem
//
//  Created by Getharanath Aruleeswar on 4/15/21.
//

import UIKit

class ForgotPasswordViewController: UIViewController {

    @IBOutlet weak var MessageLabel: UILabel!
    @IBOutlet weak var EmailTextField: UITextField!
    @IBOutlet weak var ResetButton: UIButton!
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.hideKeyboardWhenTappedAround() 
    }
    
    
    func isValidEmail(_ email: String) -> Bool {
        
        let emailRegEx = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let emailPred = NSPredicate(format:"SELF MATCHES %@", emailRegEx)
        return emailPred.evaluate(with: email)
    }
    

    @IBAction func ResetTapped(_ sender: Any) {
        //confettiAnimation()
        let validEmail:Bool = isValidEmail(EmailTextField.text!)
        if(validEmail){
            MessageLabel.text = "A email has been sent to change your password"
            MessageLabel.textColor = UIColor.green
            let apiCall = API();
            apiCall.forgotPassword(email: EmailTextField.text!)
        }
        else{
            MessageLabel.text = "Please enter a valid email"
            MessageLabel.textColor = UIColor.red
        }
       
    }
    
//    func confettiAnimation(){
//        let emitter = Emitter.get()
//        emitter.position = CGPoint(x: view.frame.width/2, y: 0)
//        emitter.emitterSize = CGSize(width: view.frame.width, height: 10)
//        view.layer.addSublayer(emitter)
//    }
    



}
