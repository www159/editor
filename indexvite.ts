import { extensions, Editor } from "@editor";
import '@editor/core/index.less'
import '@editor/math_extension/index.less'
import '@editor/common_extension/index.less'
import { html } from "@editor/core/utils/stringRenderer";
// import { NodeSelection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

import appDevTools from 'prosemirror-dev-tools'
// import '@editor/node_modules/katex/dist/katex.min.css'

const editor = Editor.create({
    content: 
    html`
    <h2>测试<emoji data-index="17"></emoji></h2>
    <p>先来测试一个link<a href="https://www.baidu.com" title="度爹">指向度<emoji data-index="55"></emoji>爹</a>。接着测试layer<a>没有东东呢</a>听说没有<strong><em>line break</em></strong>是长单词的原因<emoji data-index="2"/></emoji></p>
    <math-display>
        \left[
        \begin{matrix}
        1 & 2 & 3 \\
        a \times b & c & d
        \end{matrix}
        \right]
    </math-display>
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


appDevTools(editor.view);

(<any>window).editor = editor

// document.addEventListener('keypress', (e) => {
//     if(e.key === 'Enter') console.log('hh')
// })


//测试表情框
// const { tr } = editor.state
// const { dispatch, state } = editor.view

// dispatch(tr.setSelection(new NodeSelection(tr.doc.resolve(tr.doc.nodeSize - 5))))