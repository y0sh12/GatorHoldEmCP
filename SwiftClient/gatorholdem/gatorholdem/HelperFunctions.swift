//
//  HelperFunctions.swift
//  gatorholdem
//
//  Created by Getharanath Aruleeswar on 3/24/21.
//

import Foundation

class HelperFunctions{
    static func json(from object:Any) -> String? {
        guard let data = try? JSONSerialization.data(withJSONObject: object, options: []) else {
            return nil
        }
        return String(data: data, encoding: String.Encoding.utf8)
    }
    
    static func translatingSocketData(data: Any) -> [String]{
        let jsn = HelperFunctions.json(from: data)
        let rawJsn = jsn!.data(using: .utf8)!
        
        var arrayData: [String] = [""]
        do {
            if let jsonArray = try JSONSerialization.jsonObject(with: rawJsn, options : .allowFragments) as? [String]{
                arrayData = jsonArray
            }
            else {
                print("bad json")
            }
        }
        catch let error as NSError {
            print(error)
        }

        return arrayData
    }
}
