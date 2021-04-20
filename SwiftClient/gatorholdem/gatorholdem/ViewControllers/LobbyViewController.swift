//
//  LobbyViewController.swift
//  gatorholdem
//
//  Created by Getharanath Aruleeswar on 3/18/21.
//

import UIKit

class LobbyViewController: UIViewController {

    @IBOutlet weak var RoomNameLabel: UILabel!
    @IBOutlet weak var PlayerLabel0: UILabel!
    @IBOutlet weak var PlayerLabel1: UILabel!
    @IBOutlet weak var PlayerLabel2: UILabel!
    @IBOutlet weak var PlayerLabel3: UILabel!
    @IBOutlet weak var PlayerLabel4: UILabel!
    @IBOutlet weak var PlayerLabel5: UILabel!
    
    @IBOutlet weak var RemoveButton0: UIButton!
    @IBOutlet weak var RemoveButton1: UIButton!
    @IBOutlet weak var RemoveButton2: UIButton!
    @IBOutlet weak var RemoveButton3: UIButton!
    @IBOutlet weak var RemoveButton4: UIButton!
    @IBOutlet weak var RemoveButton5: UIButton!
    
    @IBOutlet weak var StartGameButton: UIButton!
    @IBOutlet weak var BackButton: UIButton!
    @IBOutlet weak var ErrorLabel: UILabel!
    @IBOutlet weak var WaitingLabel: UILabel!
    
    var labels:[UILabel] = []
    var buttons:[UIButton] = []
    var inLobby: Bool = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.hideKeyboardWhenTappedAround() 
        labels = [PlayerLabel0, PlayerLabel1, PlayerLabel2, PlayerLabel3, PlayerLabel4, PlayerLabel5]
        buttons = [RemoveButton0, RemoveButton1, RemoveButton2, RemoveButton3, RemoveButton4, RemoveButton5]
        setUpElements()
        lobbyHandler()
        updates()
        SocketHandler.getChatMessage()
    }
    
    override func viewDidDisappear(_ animated: Bool) {
        self.dismiss(animated: false, completion: nil)
    }
    
    @IBAction func removeTapped0(_ sender: Any) {
    }
    @IBAction func removeTapped1(_ sender: Any) {
        removePlayer(index: 1)
    }
    @IBAction func removeTapped2(_ sender: Any) {
        removePlayer(index: 2)
    }
    @IBAction func removeTapped3(_ sender: Any) {
        removePlayer(index: 3)
    }
    @IBAction func removeTapped4(_ sender: Any) {
        removePlayer(index: 4)
    }
    @IBAction func removeTapped5(_ sender: Any) {
        removePlayer(index: 5)
    }
    
    @IBAction func StartGameButtonTapped(_ sender: Any) {
        if(player_dict.sharedInstance.room_list_len < 2){
            print("Too few players")
            ErrorLabel.alpha = 1
        }
        else{
//            self.in_lobby = False
//            sio.emit('start_game', player_dict_get('room_name'))
//            self.controller.show_frame(Game)
            ErrorLabel.alpha = 0
            SocketHandler.shared.socket?.emit("start_game", player_dict.sharedInstance.room_name)
            guard let vc = self.storyboard?.instantiateViewController (withIdentifier: "GameVC") as? GameViewController
            else{
              return
            }
            DispatchQueue.main.async {
                self.inLobby = false
//                self.dismiss (animated: true, completion: {self.present(vc, animated: true)})
               self.present(vc, animated: true)
            }
            
        }
        
    }
    @IBAction func BackButtonTapped(_ sender: Any) {
        removePlayer(index: player_dict.sharedInstance.playerIndex)
        player_dict.sharedInstance.vip = false
        player_dict.sharedInstance.vip_switch = false
        guard let vc = self.storyboard?.instantiateViewController (withIdentifier: "HomeVC") as? HomeViewController
        else{
            return
        }
        //SocketHandler.shared.socket!.disconnect()
        print("view transtion")
        DispatchQueue.main.async {
            print("transtion")
            self.inLobby = false
            self.present(vc, animated: true)
        }
    }
    
    func removePlayer(index: Int){
        let inputData = [player_dict.sharedInstance.room_name, index] as [Any]
        SocketHandler.shared.socket!.emitWithAck("remove_player", inputData).timingOut(after: 0) { (data) in
            let its_me: String = HelperFunctions.json(from: data)!
            print("boolean its_me:", its_me)
        }
    }
    
    func setUpElements(){
        inLobby = true
        RoomNameLabel.text = "Lobby: " + player_dict.sharedInstance.room_name
        buttons[0].alpha = 0
        ErrorLabel.alpha = 0
        WaitingLabel.alpha = 0
        if(!player_dict.sharedInstance.vip_switch){
            self.StartGameButton.alpha = 0
        }
        
        for n in 0...player_dict.sharedInstance.room_list!.count - 1{
            buttons[n].isHidden = false
        }
    }
    
    func lobbyHandler(){
        SocketHandler.shared.socket!.on("message"){ data, ack in
            let dataArray = HelperFunctions.translatingSocketData(data: data)
            print("Message Received unique:",dataArray[0])
            game_info.shared.message_received = true
            game_info.shared.display_message = dataArray[0]
            if(dataArray[0] == "Game Starting..."){
//                player_dict.sharedInstance.running = true
//                if(player_dict.sharedInstance.running && self.inLobby){
                    DispatchQueue.main.async {
                        self.StartGameButton.sendActions(for: .touchUpInside)
                    }
                    return
//                }
                
            }
        }
    }
    
    func updates(){
        if(SocketHandler.shared.connected && self.inLobby){
            updateRoomList()                                            
            DispatchQueue.main.asyncAfter(deadline: DispatchTime.now() + 2.0, execute: {
                //player_dict.sharedInstance.in_a_room! && player_dict.sharedInstance.room_name != ""
                    self.updates()
            })
        }
        else{
            guard let vc = self.storyboard?.instantiateViewController (withIdentifier: "HomeVC") as? HomeViewController
            else{
                return
            }
            print("view transtion")
            DispatchQueue.main.async {
                print("transtion")
                self.inLobby = false
                self.present(vc, animated: true)
            }
        }
    }
    
    func updateRoomList(){
        var room_members = [Dictionary<String, Any>]()
        SocketHandler.shared.socket!.emitWithAck("active_player_list",player_dict.sharedInstance.room_name).timingOut(after: 0) { (data) in
            for dataObjs in data {
                let x: String = HelperFunctions.json(from: dataObjs)!
                let y = x.data(using: .utf8)!
                
                do {
                    if let jsonArray = try JSONSerialization.jsonObject(with: y, options : .allowFragments) as? [Dictionary<String,Any>]{
                        room_members.append(contentsOf: jsonArray)
                    }
                }
                catch let error as NSError {
                    print(error)
                }
            }
            var curr_room_members = Array(repeating: "", count: 6)
            if !room_members.isEmpty {
                player_dict.sharedInstance.room_list_len = room_members.count
                for n in 0...5 {
                    if n < room_members.count{
                        curr_room_members[n] = (room_members[n]["_name"] as! String)
                    }
                }
            }
            else{
                return
            }
            player_dict.sharedInstance.room_list = curr_room_members
            if(player_dict.sharedInstance.vip_switch){
                self.StartGameButton.alpha = 1
                self.WaitingLabel.alpha = 0
                for n in 0...player_dict.sharedInstance.room_list!.count - 1{
                    self.buttons[n].isHidden = false
                    if(player_dict.sharedInstance.room_list![n] != ""){
                        self.labels[n].text = player_dict.sharedInstance.room_list![n]
                        if(n != 0){
                            self.buttons[n].alpha = 1
                        }
                    }
                    else{
                        self.labels[n].text = ""
                        self.buttons[n].alpha = 0
                    }
                }
            }
            else{
                self.StartGameButton.alpha = 0
                self.WaitingLabel.alpha = 1
                for n in 0...player_dict.sharedInstance.room_list!.count - 1{
                    self.buttons[n].isHidden = true
                    if(player_dict.sharedInstance.room_list![n] != ""){
                        self.labels[n].text = player_dict.sharedInstance.room_list![n]
                    }
                    else{
                        self.labels[n].text = ""
                    }
                }
            }
        }
    }

}
