import UIKit

class Emitter{
    
    static func get() -> CAEmitterLayer{
        let emitter = CAEmitterLayer()
        emitter.emitterShape = CAEmitterLayerEmitterShape.line
        emitter.emitterCells = generateEmitterCells()
        
        return emitter
    }
    
    static func generateEmitterCells() -> [CAEmitterCell]{
        var cells = [CAEmitterCell]()
        
        
        let red = CAEmitterCell()
        red.contents = UIImage(named: "red.png")!.cgImage
        red.birthRate = 5
        red.lifetime = 50
        red.velocity = CGFloat(90)
        red.emissionLongitude = (.pi)
        red.emissionRange = (45 * (.pi/180))
        red.scale = 0.04
        red.scaleRange = 0.02
        
        let blue = CAEmitterCell()
        blue.contents = UIImage(named: "blue.png")!.cgImage
        blue.birthRate = 5
        blue.lifetime = 50
        blue.velocity = CGFloat(90)
        blue.emissionLongitude = (.pi)
        blue.emissionRange = (45 * (.pi/180))
        blue.scale = 0.04
        blue.scaleRange = 0.02
        
        let yellow = CAEmitterCell()
        yellow.contents = UIImage(named: "yellow.png")!.cgImage
        yellow.birthRate = 5
        yellow.lifetime = 50
        yellow.velocity = CGFloat(90)
        yellow.emissionLongitude = (.pi)
        yellow.emissionRange = (45 * (.pi/180))
        yellow.scale = 0.04
        yellow.scaleRange = 0.02
        
        let green = CAEmitterCell()
        green.contents = UIImage(named: "green.png")!.cgImage
        green.birthRate = 5
        green.lifetime = 50
        green.velocity = CGFloat(90)
        green.emissionLongitude = (.pi)
        green.emissionRange = (45 * (.pi/180))
        green.scale = 0.04
        green.scaleRange = 0.02
        
        let white = CAEmitterCell()
        white.contents = UIImage(named: "white.png")!.cgImage
        white.birthRate = 5
        white.lifetime = 50
        white.velocity = CGFloat(90)
        white.emissionLongitude = (.pi)
        white.emissionRange = (45 * (.pi/180))
        white.scale = 0.04
        white.scaleRange = 0.02
        
        let purple = CAEmitterCell()
        purple.contents = UIImage(named: "purple.png")!.cgImage
        purple.birthRate = 5
        purple.lifetime = 50
        purple.velocity = CGFloat(90)
        purple.emissionLongitude = (.pi)
        purple.emissionRange = (45 * (.pi/180))
        purple.scale = 0.03
        purple.scaleRange = 0.02
        
        cells.append(red)
        cells.append(blue)
        cells.append(yellow)
        cells.append(green)
        cells.append(white)
        cells.append(purple)
        return cells
    }
}
