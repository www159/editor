import { OrderedListOptions_t } from "../type";

const RomeArab = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1] as const
const RomeNum  = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"] as const 

export function getTable(type: OrderedListOptions_t) {
    switch(type) {
        case '1': return (num: number) => num
        case 'a': return (num: number) => String.fromCharCode(65 + num - 1)
        case 'A': return (num: number) => String.fromCharCode(97 + num - 1)
        case 'i': return (num: number) => {
            let result = ''
            for(let i = 0; i < RomeArab.length; i++) {
                while(num >= RomeArab[i]) {
                    num -= RomeArab[i]
                    result += RomeNum[i]
                }
            }
            return result
        }
    }
}