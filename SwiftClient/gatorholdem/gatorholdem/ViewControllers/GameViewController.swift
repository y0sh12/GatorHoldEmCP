//
//  GameViewController.swift
//  gatorholdem
//
//  Created by Getharanath Aruleeswar on 3/30/21.
//

import UIKit

class GameViewController: UIViewController {

    var running:Bool = true
    var ackk: Int = 1
    
    @IBOutlet weak var Button: UIButton!
    @IBOutlet weak var LeaveButton: UIButton!
    
    @IBOutlet weak var Card1: UIImageView!
    @IBOutlet weak var Card2: UIImageView!
    
    @IBOutlet weak var RoundNumLabel: UILabel!
    @IBOutlet weak var CurrentBetLabel: UILabel!
    @IBOutlet weak var TotalPotLabel: UILabel!
    @IBOutlet weak var MessageTextLabel: UILabel!
    
    
    @IBOutlet weak var BetSlider: UISlider!
    @IBOutlet weak var BetSliderText: UILabel!
    @IBOutlet weak var Raise: UIButton!
    @IBOutlet weak var Check: UIButton!
    @IBOutlet weak var Fold: UIButton!
    
    @IBOutlet weak var BoardCard0: UIImageView!
    @IBOutlet weak var BoardCard1: UIImageView!
    @IBOutlet weak var BoardCard2: UIImageView!
    @IBOutlet weak var BoardCard3: UIImageView!
    @IBOutlet weak var BoardCard4: UIImageView!
    
    @IBOutlet weak var PlayerLabel0: UILabel!
    @IBOutlet weak var PlayerLabel1: UILabel!
    @IBOutlet weak var PlayerLabel2: UILabel!
    @IBOutlet weak var PlayerLabel3: UILabel!
    @IBOutlet weak var PlayerLabel4: UILabel!
    @IBOutlet weak var PlayerLabel5: UILabel!
    
    @IBOutlet weak var Token0: UIImageView!
    @IBOutlet weak var Token1: UIImageView!
    @IBOutlet weak var Token2: UIImageView!
    @IBOutlet weak var Token3: UIImageView!
    @IBOutlet weak var Token4: UIImageView!
    @IBOutlet weak var Token5: UIImageView!
    
    @IBOutlet weak var DealerToken0: UIImageView!
    @IBOutlet weak var DealerToken1: UIImageView!
    @IBOutlet weak var DealerToken2: UIImageView!
    @IBOutlet weak var DealerToken3: UIImageView!
    @IBOutlet weak var DealerToken4: UIImageView!
    @IBOutlet weak var DealerToken5: UIImageView!
    
    
    var BoardCards: [UIImageView] = []
    var PlayerLabels: [UILabel] = []
    var PlayerList = [Dictionary<String, Any>]()
    var Tokens: [UIImageView] = []
    var DealerTokens: [UIImageView] = []
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.hideKeyboardWhenTappedAround()
//        assignbackground()
        
        
        BoardCards = [BoardCard0, BoardCard1, BoardCard2, BoardCard3, BoardCard4]
        PlayerLabels = [PlayerLabel0, PlayerLabel1, PlayerLabel2, PlayerLabel3, PlayerLabel4, PlayerLabel5]
        Tokens = [Token0, Token1, Token2, Token3, Token4, Token5]
        DealerTokens = [DealerToken0, DealerToken1, DealerToken2, DealerToken3, DealerToken4, DealerToken5]
        
        gameHandlers()
        SocketHandler.getChatMessage()
        setUpElements()
        
        if(player_dict.sharedInstance.my_turn){
            self.doStuff()
        }
        
        start_up()
        
    }
    
    override func viewDidDisappear(_ animated: Bool) {
        running = false
        self.dismiss(animated: false, completion: nil)
    }
    
    func assignbackground(){
            let background = UIImage(named: "feltBG.jpg")

            var imageView : UIImageView!
            imageView = UIImageView(frame: view.bounds)
            imageView.contentMode =  UIView.ContentMode.scaleAspectFill
            imageView.clipsToBounds = true
            imageView.image = background
            imageView.center = view.center
            view.addSubview(imageView)
            self.view.sendSubviewToBack(imageView)
    }
    
    @IBAction func ButtonTapped(_ sender: Any) {
        start_up()
    }
    
    @IBAction func LeaveButtonTapped(_ sender: Any) {
        running = false
        resetGameInfo()
        guard let vc = self.storyboard?.instantiateViewController (withIdentifier: "HomeVC") as? HomeViewController
        else{
          return
        }
        DispatchQueue.main.async {
           SocketHandler.shared.socket?.disconnect()
           self.present(vc, animated: true)
        }
    }
    
    
    @IBAction func RaiseTapped(_ sender: Any) {
        player_dict.sharedInstance.choice = "3"
        player_dict.sharedInstance.raise_amount = Int(BetSlider.value)
        game_info.shared.up = true
    }
    
    @IBAction func CheckTapped(_ sender: Any) {
        player_dict.sharedInstance.choice = "1"
        game_info.shared.up = true
    }
    
    @IBAction func FoldTapped(_ sender: Any) {
        player_dict.sharedInstance.choice = "2"
        game_info.shared.up = true
    }
    
    @IBAction func BetSliderChange(_ sender: Any) {
        BetSliderText.text = "Bet: " + String(Int(BetSlider.value))
        player_dict.sharedInstance.raise_amount = Int(BetSlider.value)
    }
    
    func setUpElements(){
        Card1.alpha = 0
        Card2.alpha = 0
        
        MessageTextLabel.alpha = 0;
        
        for card in BoardCards{
            card.alpha = 0
        }
        
        for n in 0...5{
            Tokens[n].alpha = 0
            DealerTokens[n].alpha = 0
            PlayerLabels[n].alpha = 0
            PlayerLabels[n].adjustsFontSizeToFitWidth = true
        }
        RoundNumLabel.adjustsFontSizeToFitWidth = true
        RoundNumLabel.layer.cornerRadius = 5
        RoundNumLabel.layer.masksToBounds = true
        
        MessageTextLabel.adjustsFontSizeToFitWidth = true
        TotalPotLabel.adjustsFontSizeToFitWidth = true
        
        ackk = 1
        
        BetSlider.isEnabled = false
        Raise.isEnabled = false
        Check.isEnabled = false
        Fold.isEnabled = false
        
        CurrentBetLabel.lineBreakMode = .byWordWrapping
        CurrentBetLabel.sizeToFit()
    }
    
    func init_update(){
        if(game_info.shared.reset_round){
            reset_round()
            game_info.shared.reset_round = false
        }
        if(game_info.shared.update_tokens){
            update_tokens()
            game_info.shared.update_tokens = false
        }
        if(game_info.shared.game_ended){
            
        }
        if(game_info.shared.message_received){
            game_info.shared.message_received = false
            setMessageLabel()
        }
        
//        if game_info_get('reset_round'):
//            self.reset_round()
//            game_info_set('reset_round', False)
//        if game_info_get('update_tokens'):
//            self._place_tokens()
//            game_info_set('update_tokens', False)
//        # Check to display winning button
//        if game_info_get('game_ended'):
//            self.winning_button.place(x=550, y=250)
//
//        if game_info_get('message_received'):
//            game_info_set('message_received', False)
//            self.message_text.set(game_info_get('display_message'))
        
        
        //Card2.image = UIImage(named: "6_of_clubs.png")

    }
    
    
    
    func start_up(){
        //running = true
        if(running){
            game_info.shared.up = true //dddd
            if(game_info.shared.up){
                update_Players()
                game_info.shared.up = false
            }
            DispatchQueue.main.asyncAfter(deadline: DispatchTime.now() + 0.3, execute: {
                self.start_up()
            })
       }
    }
    
    func reset_round(){
        print("reset_round!")
        Card1.alpha = 0
        Card2.alpha = 0
        
        
        for card in BoardCards{
            card.alpha = 0
        }
        
        if(player_dict.sharedInstance.card1 != "" && Card1.alpha == 0){
            let temp = player_dict.sharedInstance.card1.split(separator: " ")
            let temp_s = temp[1] + " " + temp[3].lowercased()
            print("temp_s", temp_s)
            DispatchQueue.main.async {
                print("card1 changed here", self.load_card_image(cardString: temp_s) )
                self.Card1.image = UIImage(named: self.load_card_image(cardString: temp_s))
                self.Card1.alpha = 1;
            }
        }
        
        if(player_dict.sharedInstance.card2 != "" && Card2.alpha == 0){
            let temp = player_dict.sharedInstance.card2.split(separator: " ")
            let temp_s = temp[1] + " " + temp[3].lowercased()
            print("temp_s", temp_s)
            DispatchQueue.main.async {
                print("card2 changed here", self.load_card_image(cardString: temp_s) )
                self.Card2.image = UIImage(named: self.load_card_image(cardString: temp_s))
                self.Card2.alpha = 1;
            }
        }
    }
    
    func update_tokens(){
        var myIndex: Int?
        var d_rel_index: Int?
        var bb_rel_index: Int?
        var sb_rel_index: Int?
        
        if (!PlayerList.isEmpty){
            for n in 0..<PlayerList.count {
                //SID instead of name // fix later
                if(PlayerList[n]["_name"] as? String == player_dict.sharedInstance.name){
                    myIndex = n
                }
            }
            
            for n in 0..<PlayerList.count{
                if(PlayerList[n]["_client_number"] as! String == game_info.shared.dealer){
                    d_rel_index = relative_position(my_position: myIndex!, absolute_position: n)
                }
                if(PlayerList[n]["_client_number"] as! String == game_info.shared.big_blind){
                    bb_rel_index = relative_position(my_position: myIndex!, absolute_position: n)
                }
                if(PlayerList[n]["_client_number"] as! String == game_info.shared.small_blind){
                    sb_rel_index = relative_position(my_position: myIndex!, absolute_position: n)
                }
            }
            
            Tokens[bb_rel_index!].image =  UIImage(named: "BB.png")
            Tokens[sb_rel_index!].image =  UIImage(named: "SB.png")
            Tokens[bb_rel_index!].alpha = 1
            Tokens[sb_rel_index!].alpha = 1
            DealerTokens[d_rel_index!].alpha = 1
        }
    }
    
    func relative_position(my_position: Int, absolute_position: Int) -> Int {
        if(absolute_position >= my_position){
            return absolute_position - my_position
        }
        else{
            return 6 - my_position + absolute_position
        }
    }
    
    func set_player_name_balance(absolute_position: Int, relative_position: Int){
       
        if(PlayerList[absolute_position]["_client_number"] as! String == game_info.shared.curr_turn){  //Current Player
            PlayerLabels[relative_position].textColor = UIColor.green
            PlayerLabels[relative_position].alpha = 1
        }
        else if(PlayerList[absolute_position]["_balance"] as! Int == 0 && PlayerList[absolute_position]["_investment"] as! Int == 0 || (PlayerList[absolute_position]["_isFolded"] as! Int == 1)){ //Inactive players
            PlayerLabels[relative_position].textColor = UIColor.gray
            PlayerLabels[relative_position].alpha = 0.5
        }
        else{ //Active players
            PlayerLabels[relative_position].textColor = UIColor.white
            PlayerLabels[relative_position].alpha = 1
        }
        let name = (PlayerList[absolute_position]["_name"] as! String)
        let balance = String(PlayerList[absolute_position]["_balance"] as! Int)
        let investment = String(PlayerList[absolute_position]["_investment"] as! Int)
        
        PlayerLabels[relative_position].text = name + " Bal: " + balance + " Inv: " + investment
        
    }
    
    func load_card_image(cardString: String) -> String{
        var cardStringArray = cardString.split(separator: " ")
        print("load card image", cardStringArray, "cardStrinArray length: ", cardStringArray.count)
        
        if (cardStringArray[1] == "11"){
            cardStringArray[1] = "jack"
        }
        else if(cardStringArray[1] == "12"){
            cardStringArray[1] = "queen"
        }
        else if(cardStringArray[1] == "13"){
            cardStringArray[1] = "king"
        }
        else if(cardStringArray[1] == "14"){
            cardStringArray[1] = "ace"
        }
        
        return cardStringArray[1].lowercased() + "_of_" + cardStringArray[0].lowercased() + "s.png"
    }
    
    func place_card(i: Int){
        if(game_info.shared.board[i] != ""){
            self.BoardCards[i].image = UIImage(named: self.load_card_image(cardString: game_info.shared.board[i]))
            self.BoardCards[i].alpha = 1
        }
    }
    
    func doStuff(){
        var choice: String = ""
        if(player_dict.sharedInstance.my_turn){
            
            if(player_dict.sharedInstance.choice != ""){
                choice = player_dict.sharedInstance.choice
                player_dict.sharedInstance.my_turn = false
                player_dict.sharedInstance.choice = ""
                
                game_info.shared.up = true
                SocketHandler.shared.socket?.emitAck(ackk, with: [choice])
                ackk = ackk + 1
            }
            else{
                DispatchQueue.main.asyncAfter(deadline: DispatchTime.now() + 0.1, execute: {
                    self.doStuff()
                })
            }
        }
    }
    
    
    func update_Players(){
        Button.alpha = 0
        
        var room_members = [Dictionary<String, Any>]()
        SocketHandler.shared.socket!.emitWithAck("active_player_list", player_dict.sharedInstance.room_name).timingOut(after: 0) { [self] data in
            for dataObjs in data {
                let x: String = HelperFunctions.json(from: dataObjs)!
                let y = x.data(using: .utf8)!

                do {
                    if let jsonArray = try JSONSerialization.jsonObject(with: y, options : .allowFragments) as? [Dictionary<String,Any>]{
                        for element in jsonArray{
                            room_members.append(element)
                        }
                    }
                }
                catch let error as NSError {
                    print(error)
                }
            }
            PlayerList = room_members
            print(running)
            print("PlayerList",PlayerList)
            
            let min_bet = player_dict.sharedInstance.minimumBet
            let bal = player_dict.sharedInstance.balance
            let inv = player_dict.sharedInstance.investment
            
            if(bal + inv <= min_bet){
                self.BetSlider.minimumValue = 0
                self.BetSlider.maximumValue = 0
            }
            else{
                self.BetSlider.minimumValue = Float(min_bet)
                self.BetSlider.maximumValue = Float((bal - (min_bet - inv)))
            }
            
            BetSliderText.text = "Bet: " + String(Int(BetSlider.value))
            
            if(player_dict.sharedInstance.my_turn){
                BetSlider.isEnabled = true
                Raise.isEnabled = true
                Check.isEnabled = true
                Fold.isEnabled = true
            }
            else{
                BetSlider.isEnabled = false
                Raise.isEnabled = false
                Check.isEnabled = false
                Fold.isEnabled = false
            }
            
            
            var myIndex: Int = 0
            if (!PlayerList.isEmpty){
                for n in 0..<room_members.count {
                    
                    //SID instead of name // fix later
                    if(room_members[n]["_name"] as? String == player_dict.sharedInstance.name){
                        myIndex = n
                    }
                }
                
                set_player_name_balance(absolute_position: myIndex, relative_position: 0)
                
                var placementIndex = 1
                for i in myIndex + 1..<PlayerList.count{
                    set_player_name_balance(absolute_position: i, relative_position: placementIndex)
                    placementIndex += 1
                }
                
                placementIndex = 6 - myIndex
                if(myIndex != 0){
                    for i in 0..<myIndex{
                        set_player_name_balance(absolute_position: i, relative_position: placementIndex)
                        placementIndex += 1
                    }
                }
                
                print("myIndex =", myIndex)
                
                var potTotal: Int = 0
                for n in 0..<room_members.count {
                    potTotal += room_members[n]["_investment"] as! Int
                }
                
                TotalPotLabel.text = "Total Pot: " + String(potTotal)
                RoundNumLabel.text = "ROUND: " + game_info.shared.round_num
                CurrentBetLabel.text = "Current Table Bet: " + String(player_dict.sharedInstance.minimumBet) // "Current\n Table Bet:\n" +

            }
            
            if(player_dict.sharedInstance.checkOrCall == "Call"){
                let callAmount: Int = Int(player_dict.sharedInstance.minimumBet) - Int(player_dict.sharedInstance.investment)
                var callText = String(callAmount)
                
                if(callAmount >= Int(player_dict.sharedInstance.balance)){
                    callText = String(player_dict.sharedInstance.balance)
                }
                
                if(callAmount <= 0){
                    callText = ""
                }
                
                self.Check.setTitle("Call " + callText, for: .normal)
                self.Check.titleLabel?.textAlignment = .center
            }
            else{
                self.Check.setTitle("Check", for: .normal)
            }
            
            if(game_info.shared.flop){
                game_info.shared.flop = false
                print("flop recognized", game_info.shared.board)
                for n in 0...2 {
                    place_card(i: n)
                }
            }
            
            if(game_info.shared.turn){
                game_info.shared.turn = false
                print("turn recognized", game_info.shared.board)
                place_card(i: 3)
                
            }
            
            if(game_info.shared.river){
                game_info.shared.river = false
                print("river recognized", game_info.shared.board)
                place_card(i: 4)
                
            }

            self.init_update()
        }
    }
    
    
    func setMessageLabel(){
        MessageTextLabel.alpha = 1
        MessageTextLabel.text = game_info.shared.display_message
    }
    
    func resetGameInfo(){
        game_info.shared.cwd = ""
        game_info.shared.curr_turn = ""
        game_info.shared.curr_action = ""
        game_info.shared.pot = 0
        game_info.shared.round_num = ""
        game_info.shared.server_message = ""
        game_info.shared.dealer = ""
        game_info.shared.small_blind = ""
        game_info.shared.big_blind = ""
        game_info.shared.board = [String](repeating: "", count: 5)
        game_info.shared.flop = false
        game_info.shared.turn = false
        game_info.shared.river = false
        game_info.shared.up = true
        game_info.shared.won_message = ""
        game_info.shared.reset_round = false
        game_info.shared.update_tokens = false
        game_info.shared.display_message = ""
        game_info.shared.message_received = false
        game_info.shared.game_ended = false
        game_info.shared.showing_rules = false
        
        
        //name = ""
        player_dict.sharedInstance.room_name = ""
        player_dict.sharedInstance.in_a_room = nil
        player_dict.sharedInstance.vip = false
        player_dict.sharedInstance.vip_switch = false
        player_dict.sharedInstance.room_list = nil
        player_dict.sharedInstance.room_list_len = 0
        player_dict.sharedInstance.card1 = ""
        player_dict.sharedInstance.card2 = ""
        player_dict.sharedInstance.running = false
        player_dict.sharedInstance.balance = 0
        player_dict.sharedInstance.investment = 0
        player_dict.sharedInstance.minimumBet = 0
        player_dict.sharedInstance.checkOrCall = "Call"
        player_dict.sharedInstance.my_turn = false
        player_dict.sharedInstance.choice = ""
        player_dict.sharedInstance.raise_amount = 0
        player_dict.sharedInstance.playerIndex = 0
    }
    
    func confettiAnimation(){
        let emitter = Emitter.get()
        emitter.position = CGPoint(x: view.frame.width/2, y: 0)
        emitter.emitterSize = CGSize(width: view.frame.width, height: 10)
        view.layer.addSublayer(emitter)
    }
    
    func gameHandlers(){

        SocketHandler.shared.socket!.on("new_hand") { data, ack in
            print("new hand")
            game_info.shared.up = true
            game_info.shared.board = Array(repeating: "", count: 5)
        }
        
        
        
        SocketHandler.shared.socket!.on("flop") { data, ack in
            game_info.shared.won_message = ""
            let flop = HelperFunctions.translatingSocketData(data: data)
            let temp = flop[0].split(separator: " ")
            game_info.shared.board[0] = temp[1] + " " + temp[3]
            game_info.shared.board[1] = temp[5] + " " + temp[7]
            game_info.shared.board[2] = temp[9] + " " + temp[11]
            game_info.shared.flop = true
            game_info.shared.up = true
        }
        
        
        SocketHandler.shared.socket!.on("turn") { data, ack in
            print("Its my turn!")
            let turn = HelperFunctions.translatingSocketData(data: data)
            let temp = turn[0].split(separator: " ")
            game_info.shared.board[3] = temp[13] + " " + temp[15]
            game_info.shared.turn = true
            game_info.shared.up = true
        }
        
        SocketHandler.shared.socket!.on("river") { data, ack in
            let river = HelperFunctions.translatingSocketData(data: data)
            let temp = river[0].split(separator: " ")
            game_info.shared.board[4] = temp[17] + " " + temp[19]
            game_info.shared.river = true
            game_info.shared.up = true
        }
    
        
        SocketHandler.shared.socket!.on("board_init_info") { data, ack in
            print("board_init_info")
            let boardInfo = HelperFunctions.translatingSocketData(data: data[0])
            if(boardInfo.count == 5){
                print("board info",boardInfo)
                game_info.shared.dealer = boardInfo[0]
                game_info.shared.small_blind = boardInfo[1]
                game_info.shared.big_blind = boardInfo[2]
                player_dict.sharedInstance.minimumBet = Int(boardInfo[3])!
                game_info.shared.round_num = boardInfo[4]
                game_info.shared.update_tokens = true
                game_info.shared.up = true
                
                
                for n in 0...5{
                    self.Tokens[n].alpha = 0
                    self.DealerTokens[n].alpha = 0
                    //self.PlayerLabels[n].alpha = 0
                }
            }
            else{
                print("Error parsing board init info")
            }
        }
        
        SocketHandler.shared.socket!.on("emit_hand") { data, ack in
            let hand = HelperFunctions.translatingSocketData(data: data)
            print("emit_hand")
            if(hand.count == 2){
                for lol in hand{
                    print("card:", lol)
                }
                player_dict.sharedInstance.card1 = hand[0]
                player_dict.sharedInstance.card2 = hand[1]
                game_info.shared.reset_round = true
                game_info.shared.up = true
            }
            else{
                print("Error parsing Hand info")
            }
            
        }
        
        SocketHandler.shared.socket!.on("which_players_turn") { data, ack in
            let dataArray = HelperFunctions.translatingSocketData(data: data[0])
            if(dataArray.count == 2){
                print("which_players_turn", dataArray)
                game_info.shared.curr_turn = dataArray[0]
                player_dict.sharedInstance.minimumBet = Int(dataArray[1])!
                game_info.shared.up = true
            }
            else{
                print("Error parsing which_players_turn")
            }
        }
        
        SocketHandler.shared.socket!.on("your_turn") { data, ack in
            print("your_turn")
            game_info.shared.up = true
            let dataArray = HelperFunctions.translatingSocketData(data: data)
            
            if(dataArray.count == 4){
                print(dataArray)
                player_dict.sharedInstance.balance = Int(dataArray[0])!
                player_dict.sharedInstance.investment = Int(dataArray[1])!
                player_dict.sharedInstance.minimumBet = Int(dataArray[2])!
                player_dict.sharedInstance.checkOrCall = dataArray[3]
                player_dict.sharedInstance.my_turn = true
            }
            else{
                print("Error parsing your_turn")
            }
            self.doStuff()
        }

        SocketHandler.shared.socket!.on("player_action") { data, ack in
            let dataArray = HelperFunctions.translatingSocketData(data: data)
            print(dataArray[0], "chose option", dataArray[1])
        }
        
        SocketHandler.shared.socket!.on("message"){ data, ack in
            let dataArray = HelperFunctions.translatingSocketData(data: data)
            print("Message Received:",dataArray[0])
            game_info.shared.message_received = true
            game_info.shared.display_message = dataArray[0]
            
            if(game_info.shared.display_message == player_dict.sharedInstance.name + " has won the game!"){
                self.confettiAnimation()
            }
//            if(dataArray[0] == "Game Starting..."){
//                player_dict.sharedInstance.running = true
//            }
            
            if(dataArray[0].contains("has won the pot")){
                player_dict.sharedInstance.running = true
                game_info.shared.won_message = dataArray[0]
            }
        }
        
        SocketHandler.shared.socket!.on("raise"){ data, ack in
            game_info.shared.up = true
            var raiseAmount = player_dict.sharedInstance.raise_amount
            if(raiseAmount < player_dict.sharedInstance.minimumBet){
                raiseAmount = Int(self.BetSlider.value)
            }
            SocketHandler.shared.socket?.emitAck(self.ackk, with: [raiseAmount])
            self.ackk = self.ackk + 1
        }
        
        SocketHandler.shared.socket!.on("round_ended"){ data, ack in
            game_info.shared.up = true
        }

        SocketHandler.shared.socket!.on("you_timed_out"){ data, ack in
            player_dict.sharedInstance.my_turn = false
            game_info.shared.up = true
            print("You have times out")
        }
        
        SocketHandler.shared.socket!.on("game_ended"){ data, ack in
            game_info.shared.game_ended = true
            game_info.shared.up = true
            print("Game ended")
        }
        
        SocketHandler.shared.socket!.on(clientEvent: .disconnect, callback: { data, ack in
            print("You have left the game. Come back soon!")
            player_dict.sharedInstance.in_a_room = false
            player_dict.sharedInstance.running = false
            player_dict.sharedInstance.vip = false
            player_dict.sharedInstance.vip_switch = false
            player_dict.sharedInstance.room_name = ""
            game_info.shared.up = true
           // SocketHandler.shared.socket!.disconnect()
            SocketHandler.shared.manager = nil
            SocketHandler.shared.socket = nil
            SocketHandler.shared.connected = false
            print("after",SocketHandler.shared.connected)
        })
        
    }
    
}
