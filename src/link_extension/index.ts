import { Extensions } from "@editor/core";
import { toggleMark } from "prosemirror-commands";
import { MarkType } from "prosemirror-model";
import { marks } from "prosemirror-schema-basic";
import { createLinkPlugin } from "./plugin";

export const linkExtensions: Extensions = [
    {
        type: 'MARK',
        mark: {
            link: {
                inclusive: false,
                attrs: {
                    href: { default: "" },
                    title: { default: null },
                },

                toDOM: mark => {
                    const { href, title } = mark.attrs
                    return ['a', { href, title }, 0]
                }
            },
        },
        shortcutKey() {     
            const type = this.type as MarkType
            return {
                'Ctrl-Alt-l': toggleMark(type)
            }
        }
    },

    {
        type: 'PLUGIN',
        wrappedPlugin() {
            return [createLinkPlugin(this.editor)]
        }
    }
]