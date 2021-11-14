import { Extension } from './core'
import { mathExtensions } from './math_extension'
import { commonExtensions } from './common_extension'
import { headingExtension } from './heading_extension'
import { listExtensions } from './list_extension'
import { emojiExtensions } from './emoji_extension'
export {
    Editor
} from './core'

let extensions = Array<Extension>()

extensions.push(
    ...commonExtensions,
    ...mathExtensions,
    headingExtension,
    ...listExtensions,  
    ...emojiExtensions,
)

// console.log(extensions)

export { extensions }