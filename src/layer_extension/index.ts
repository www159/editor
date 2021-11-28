import { Extension } from "@editor/core";
import { LAYER_PLUGIN_KEY } from "./layerState";

const layer_extension: Extension = {
    type: 'PLUGIN',
    wrappedPlugin() {
        return []
    }
}

export {
    LAYER_PLUGIN_KEY,
    layer_extension,
}
