import { Editor } from "@editor";
import { MarkSpec, NodeSpec, pmMark, pmNode, Schema } from "prosemirror-model";
import { Extensions } from "@editor/core";
import { getType } from "./utils/getType";
import { Plugin } from "prosemirror-state";
import { bindFunc } from "./utils/bindFunc";

export class ExtensionResolver {

    editor: Editor

    schema: Schema

    extensions: Extensions
    //每个extension只有一个nodes与marks
    constructor(extensions: Extensions, editor: Editor) {
        this.extensions = extensions
        this.editor = editor

        let Marks: { [name: string]: MarkSpec } = {}
        let Nodes: { [name: string]: NodeSpec } = {}
/*********************************** 处理优先级 ***********************************/
/**
 * 默认优先级为200
 */
        this.extensions = extensions.map(extension => {
            extension.priority = extension.priority || 200
            return extension
        })
        .sort((a, b) => {
            return (b.priority as number) - (a.priority as number)
        })


        this.extensions.forEach(extension => {
            

/*********************************** 处理node和mark ***********************************/
            switch(extension.type) {

                case 'MARK' : {
                    Marks = {
                        ...Marks,
                        ...extension.mark
                    }
                    break
                }

                case 'NODE' : {
                    Nodes = {
                        ...Nodes,
                        ...extension.node
                    }
                    break
                }

                default: {
                    break
                }
            }
        })

        //分别处理每一个node和mark
        
        this.schema = new Schema({
            nodes: Nodes,
            marks: Marks
        })

        
    }

    //生成插件
    get plugins(): Array<Plugin> {
        return this.extensions
        .map(extension => {
            const { type } = extension
            let plugins = new Array<Plugin>()
            //绑定nodetype | marktype
            // if(extension.type !== 'PLUGIN') {
                
                plugins = plugins.concat(bindFunc(extension, {
                    editor: this.editor,
                    type: getType(type === 'MARK' ? 
                                    extension.mark as MarkSpec : 
                                    extension.node as NodeSpec, 
                                    this.schema, type)
                }))
            // }

            return plugins.concat(extension.plugins as Array<Plugin>)
        })
        .flat()
        .filter(plugin => plugin !== undefined)
    }

}