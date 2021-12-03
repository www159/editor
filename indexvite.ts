import { extensions, Editor } from "@editor";
import '@editor/core/index.less'
import '@editor/math_extension/index.less'
import '@editor/common_extension/index.less'
import { html } from "@editor/core/utils/stringRenderer";
import { NodeSelection } from "prosemirror-state";
// import '@editor/node_modules/katex/dist/katex.min.css'

const editor = new Editor({
    content: 
    html`
    <p>emojiaaaaaaaaaaaaaaaaaaa<a href="https://www.baidu.com" title="度爹">aaaaa</a>aaaaaaaa<a>bbbbbbbbbbbbbbb</a>ccccccccccccccc<emoji data-index="2"/><emoji></p>
    `,
    dom: document.querySelector('.editor') as HTMLElement,
    extensions,
    onCreate: () => null,
    onDestroy: () => null,
    onSelectionUpdate: () => null,
    onUpdate: () => null,
});

document.addEventListener('keydown', (e) => {
    if(e.key === 'Tab') {
        e.preventDefault()
    }
});

(<any>window).editor = editor

// document.addEventListener('keypress', (e) => {
//     if(e.key === 'Enter') console.log('hh')
// })


//测试表情框
// const { tr } = editor.state
// const { dispatch, state } = editor.view

// dispatch(tr.setSelection(new NodeSelection(tr.doc.resolve(tr.doc.nodeSize - 5))))