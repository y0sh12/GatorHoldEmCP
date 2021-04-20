//
//  HomeViewController.swift
//  GatorHoldEm
//
//  Created by Getharanath Aruleeswar on 2/15/21.
//

import UIKit
import SocketIO

class player_dict {
    
    var name: String
    var room_name: String
    var in_a_room: Bool
    var vip: Bool
    var vip_switch: Bool
    var room_list: Array<String>
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
    
    init() {
            name = ""
            room_name = ""
            in_a_room = false
            vip = false
            vip_switch = false
            room_list = Array(repeating: "", count: 6)
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
    }
}

class game_info {
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
    
    init() {
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


    @IBOutlet weak var textField: UITextField!
    @IBOutlet weak var JoinRoom: UIButton!
    @IBOutlet weak var ErrorLabel: UILabel!
    
    var playerDict = player_dict()
    var gameInfo = game_info()
    
    let manager = SocketManager(socketURL: URL(string: "ws://0.0.0.0:6000")!, config: [.log(true), .compress,.version(.two)])
    var socket:SocketIOClient!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setUpElements()
        // Do any additional setup after loading the view.
        
        socket = manager.defaultSocket
        addHandlers()
        socket.connect()
    }
    

    @IBAction func JoinRoomTapped(_ sender: Any) {
        let error = validateFields()
        
        if error != nil {
            showError(message: error!)
        }
        else{
            ErrorLabel.alpha = 0
            playerDict.name = "Username"
            playerDict.room_name = textField.text!.trimmingCharacters(in: .whitespacesAndNewlines)
            
            socket.emit("goto_room", playerDict.room_name)
        }
    }
    
    
    func validateFields() -> String?{
        
        if textField.text?.trimmingCharacters(in: .whitespacesAndNewlines) == "" {
                return "Please fill in a valid room name"
        }
        
        return nil
    }
    
    func addHandlers(){
        socket.on("joined_room") {[weak self] data, ack in
            self!.playerDict.in_a_room = true
            self!.socket.emit("my_name", self!.playerDict.name, self!.playerDict.room_name)
            print(data[0])
            return
        }
        
        socket.on("vip") {[weak self] data, ack in
            self!.playerDict.vip = true
            self!.playerDict.vip_switch = true
            print("This player is the VIP")
            self!.update_room_list()
            self!.socket.joinNamespace(withPayload: ["room":self!.playerDict.room_name])
            return
        }
        
        socket.on("user_connection") {[weak self] data, ack in
            print("i got here")
            self!.update_room_list()
            self!.gameInfo.up = true
            return
        }
    }
    
    func showError(message: String){
        ErrorLabel.text = message
        ErrorLabel.alpha = 1
    }
    
    func setUpElements(){
        ErrorLabel.alpha = 0
    }
    

    func json(from object:Any) -> String? {
        guard let data = try? JSONSerialization.data(withJSONObject: object, options: []) else {
            return nil
        }
        return String(data: data, encoding: String.Encoding.utf8)
    }
    
    
    func update_room_list(){
        var room_members = [Dictionary<String, Any>]()
        socket.emitWithAck("active_player_list", playerDict.room_name).timingOut(after: 0) { (data) in
            for dataObjs in data {
                let x: String = self.json(from: dataObjs)!
                let y = x.data(using: .utf8)!
                print("rawDataJSon form: ", x, " end here")
                
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
            var curr_room_members: Array<String> = self.playerDict.room_list
            if !room_members.isEmpty {
                self.playerDict.room_list_len = room_members.count
                for n in 0...5 {
                    if n < room_members.count{
                        print("n ", n)
                        curr_room_members[n] = (room_members[n]["_name"] as! String)
                    }
                    else{
                        curr_room_members[n] = ("")
                    }
                }
            }
            else{
                return
            }
            self.playerDict.room_list = curr_room_members
        }
    }
}
