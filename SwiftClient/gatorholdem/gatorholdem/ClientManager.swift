//
//  ClientManager.swift
//  gatorholdem
//
//  Created by Getharanath Aruleeswar on 4/12/21.
//

import Foundation
import SocketIO

class SocketHandler {
    private init(){
        manager = nil
        socket = nil
    }
    static let shared = SocketHandler()
    
    var connected: Bool = false
    var manager: SocketManager?
    var socket: SocketIOClient?
    
    func newSocket(){
        //socket?.removeAllHandlers()
        manager = SocketManager(socketURL: URL(string: "ws://0.0.0.0:6000")!, config: [.log(false), .version(.two)])
        socket = manager!.defaultSocket
    }
    
    
    
    static func getChatMessage() {
        shared.socket?.on("your_turn") { (data, socketAck) -> Void in
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
        }
        
        SocketHandler.shared.socket!.on("emit_hand") { data, ack in
            let hand = HelperFunctions.translatingSocketData(data: data)

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
                
            }
            else{
                print("Error parsing board init info")
            }
        }
    }
}


