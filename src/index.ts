import { Extension } from './core'
import { mathExtensions } from './math_extension'
import { commonExtensions } from './common_extension'
import { headingExtension } from './heading_extension'
import { listExtensions } from './list_extension'
import { emojiExtensions } from './emoji_extension'
import { baseMarkExtensions } from './base_mark_extension'
import { linkExtensions } from './link_extension'


import { layerExtension } from './layer_extension'
import { taskExtensions } from './task_extension'
import { Procedure } from './utils'
export {
    Editor
} from './core'

let extensions = Array<Extension>()

extensions.push(
    ...commonExtensions,
    ...baseMarkExtensions,
    ...linkExtensions,
    ...mathExtensions,
    headingExtension,
    ...listExtensions,  
    ...emojiExtensions,
    layerExtension,
    ...taskExtensions,
)

// console.log(extensions)

export { extensions }

/***********************************  ***********************************/
