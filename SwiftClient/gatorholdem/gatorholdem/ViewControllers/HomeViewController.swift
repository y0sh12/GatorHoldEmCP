//
//  HomeViewController.swift
//  GatorHoldEm
//
//  Created by Getharanath Aruleeswar on 2/15/21.
//

import UIKit
import SocketIO


class player_dict {
    
    static let sharedInstance = player_dict()
    
    var name: String
    var id: String
    var room_name: String
    var in_a_room: Bool?
    var vip: Bool
    var vip_switch: Bool
    var room_list: Array<String>?
    var room_list_len: Int
    var card1: String
    var card2: String
    var running: Bool
    var balance: Int
    var investment: Int
    var minimumBet: Int
    var checkOrCall: String
    var my_turn: Bool
    var choice: String
    var raise_amount: Int
    var playerIndex: Int
    
    private init() {
        name = ""
        id = ""
        room_name = ""
        in_a_room = nil
        vip = false
        vip_switch = false
        room_list = nil
        room_list_len = 0
        card1 = ""
        card2 = ""
        running = false
        balance = 0
        investment = 0
        minimumBet = 0
        checkOrCall = "Call"
        my_turn = false
        choice = ""
        raise_amount = 0
        playerIndex = 0
    }
}

class game_info {
    
    static let shared = game_info()
    
    var cwd: String
    var curr_turn: String
    var curr_action: String
    var pot: Int
    var round_num: String
    var server_message: String
    var dealer: String
    var small_blind: String
    var big_blind: String
    var board = Array(repeating: "", count: 5)
    var flop: Bool
    var turn: Bool
    var river: Bool
    var up: Bool
    var won_message: String
    var reset_round: Bool
    var update_tokens: Bool
    var display_message: String
    var message_received: Bool
    var game_ended: Bool
    var showing_rules: Bool
    
    private init() {
        cwd = ""
        curr_turn = ""
        curr_action = ""
        pot = 0
        round_num = ""
        server_message = ""
        dealer = ""
        small_blind = ""
        big_blind = ""
        board = [String](repeating: "", count: 5)
        flop = false
        turn = false
        river = false
        up = true
        won_message = ""
        reset_round = false
        update_tokens = false
        display_message = ""
        message_received = false
        game_ended = false
        showing_rules = false
    }
}

class HomeViewController: UIViewController {


   
    @IBOutlet weak var WelcomeTL: UILabel!
    @IBOutlet weak var textField: UITextField!
    @IBOutlet weak var JoinRoom: UIButton!
    @IBOutlet weak var ErrorLabel: UILabel!
    @IBOutlet weak var backButton: UIButton!
    @IBOutlet weak var BalanceLabel: UILabel!
    @IBOutlet weak var ResetBalance: UIButton!
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.hideKeyboardWhenTappedAround() 
        setUpElements()
        addHandlers()
        SocketHandler.shared.socket!.connect()
    }
    

    override func viewDidDisappear(_ animated: Bool) {
        //SocketHandler.shared.socket?.disconnect()
        self.dismiss(animated: false, completion: nil)
    }
    
    @IBAction func BackButtonTapped(_ sender: Any) {
        //SocketHandler.shared.socket?.disconnect()
        guard let vc = self.storyboard?.instantiateViewController (withIdentifier: "StartVC") as? ViewController
        else{
            return
        }
        
        self.present(vc, animated: true)
    }
    
    @IBAction func ResetBalanceTapped(_ sender: Any) {
        let apiCall = API();
        var resp: String = ""
        if(player_dict.sharedInstance.id != ""){
            resp = apiCall.resetBalance(id: player_dict.sharedInstance.id)
            ErrorLabel.text = resp
            ErrorLabel.textColor = UIColor.green
            ErrorLabel.alpha = 1
            updateBalance()
        }
    }
    
    
    @IBAction func JoinRoomTapped(_ sender: Any) {
        SocketHandler.shared.connected = true
        let error = validateFields()
        if error != nil {
            showError(message: error!)
        }
        else if(SocketHandler.shared.socket?.status == SocketIOStatus.connecting){
            showError(message: "Network Error")
        }
        else if(textField.text!.count > 8){
            showError(message: "Please enter a lobby ID with 8 or less characters")
        }
        else if(player_dict.sharedInstance.balance < 50){
            showError(message: "Your balance is too low")
        }
        else{
            ErrorLabel.alpha = 0
            player_dict.sharedInstance.room_name = textField.text!.trimmingCharacters(in: .whitespacesAndNewlines)
            SocketHandler.shared.socket!.emit("goto_room", player_dict.sharedInstance.room_name)
           
            
            let inputData = [player_dict.sharedInstance.name, player_dict.sharedInstance.room_name]
            SocketHandler.shared.socket!.emitWithAck("in_room", inputData).timingOut(after: 0) { data in
                let inRoom: String = HelperFunctions.json(from: data)!
                if(player_dict.sharedInstance.in_a_room == nil){
                    if(inRoom == "[false]"){
                        player_dict.sharedInstance.in_a_room = false
                    }
                    else{
                        player_dict.sharedInstance.in_a_room = true
                    }
                }
                
                if(player_dict.sharedInstance.in_a_room!){
            
                    self.update_room_list(transition: true)
                }
                else{
                    self.ErrorLabel.text = "This room is unavailable. Please enter another room code"
                    self.ErrorLabel.textColor = UIColor.red
                    self.ErrorLabel.alpha = 1
                }
            }
        }
    }
    
    
    func validateFields() -> String?{
        
        if textField.text?.trimmingCharacters(in: .whitespacesAndNewlines) == "" {
                return "Please fill in a valid room name"
        }
        return nil
    }
    
    func addHandlers(){
        SocketHandler.shared.socket!.on("joined_room") { data, ack in
            
            player_dict.sharedInstance.in_a_room = true
            SocketHandler.shared.socket!.emit("my_name", player_dict.sharedInstance.name, player_dict.sharedInstance.room_name)
            print("justed emitted my_name")
            game_info.shared.up = true
            print(data[0])
            return
        }
        
        SocketHandler.shared.socket!.on("vip") {[weak self] data, ack in
            player_dict.sharedInstance.vip = true
            player_dict.sharedInstance.vip_switch = true
            print("This player is the VIP")
            self!.update_room_list(transition: false)
            
            //SocketHandler.shared.socket.joinNamespace(withPayload: ["room":player_dict.sharedInstance.room_name])
            return
        }
        
        SocketHandler.shared.socket!.on("user_connection") {[weak self] data, ack in
            self!.update_room_list(transition: false)
            game_info.shared.up = true
            return
        }
        
        SocketHandler.shared.socket!.on("message"){ data, ack in
            let dataArray = HelperFunctions.translatingSocketData(data: data)
            print("Message Received:",dataArray[0])
            game_info.shared.message_received = true
            game_info.shared.display_message = dataArray[0]
            if(dataArray[0] == "Game Starting..."){
                player_dict.sharedInstance.running = true
            }
        }
        
        SocketHandler.shared.socket!.on(clientEvent: .disconnect, callback: { data, ack in
            print("You have left the game. Come back soon!")
            player_dict.sharedInstance.in_a_room = false
            player_dict.sharedInstance.running = false
            player_dict.sharedInstance.vip = false
            player_dict.sharedInstance.vip_switch = false
            player_dict.sharedInstance.room_name = ""
            game_info.shared.up = true
            SocketHandler.shared.socket!.disconnect()
            SocketHandler.shared.manager = nil
            SocketHandler.shared.socket = nil
            SocketHandler.shared.connected = false
            print("after",SocketHandler.shared.connected)
        })
        
    }
    
    func showError(message: String){
        ErrorLabel.text = message
        ErrorLabel.alpha = 1
        ErrorLabel.textColor = UIColor.red
    }
    
    func updateBalance(){
        let apiCall = API();
        let callResp = apiCall.getBalance(userName: player_dict.sharedInstance.name)
        let balance = callResp.balance
        player_dict.sharedInstance.balance = balance
        player_dict.sharedInstance.id = callResp.id
        
        BalanceLabel.text = "Balance: " + String(balance)
    }
    
    
    func setUpElements(){
        let apiCall = API();
        let callResp = apiCall.getBalance(userName: player_dict.sharedInstance.name)
        player_dict.sharedInstance.balance = callResp.balance
        player_dict.sharedInstance.id = callResp.id
        
        BalanceLabel.text = "Balance: " + String(player_dict.sharedInstance.balance)
        WelcomeTL.text = "Welcome " + player_dict.sharedInstance.name + "!"
        SocketHandler.shared.newSocket()
        ErrorLabel.alpha = 0
    }
    
    func update_room_list(transition: Bool){
        var room_members = [Dictionary<String, Any>]()
        SocketHandler.shared.socket!.emitWithAck("active_player_list", player_dict.sharedInstance.room_name).timingOut(after: 0) { (data) in
            for dataObjs in data {
                let x: String = HelperFunctions.json(from: dataObjs)!
                let y = x.data(using: .utf8)!
                
                do {
                    if let jsonArray = try JSONSerialization.jsonObject(with: y, options : .allowFragments) as? [Dictionary<String,Any>]{
                        room_members.append(contentsOf: jsonArray)
                    }
                    else {
                        print("bad json")
                    }
                }
                catch let error as NSError {
                    print(error)
                }
            }
            
            var curr_room_members = ["","","","","",""]
            if !room_members.isEmpty {
                player_dict.sharedInstance.room_list_len = room_members.count
                for n in 0...5 {
                    if n < room_members.count{
                        curr_room_members[n] = (room_members[n]["_name"] as! String)
                    }
                    if(player_dict.sharedInstance.name == curr_room_members[n]){
                        player_dict.sharedInstance.playerIndex = n
                        print("playerIndex: ", player_dict.sharedInstance.playerIndex )
                    }
                }
            }
            else{
                return
            }
            if(transition){
                guard let vc = self.storyboard?.instantiateViewController (withIdentifier: "LobbyVC") as? LobbyViewController
                else{
                    return
                }
                DispatchQueue.main.async {

                    player_dict.sharedInstance.room_list = curr_room_members
                    print("transtion")
                    self.present(vc, animated: true)
                }
            }
        }
    }
}
