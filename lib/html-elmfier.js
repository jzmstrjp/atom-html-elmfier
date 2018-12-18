'use babel';

import HtmlElmfierView from './html-elmfier-view';
import { CompositeDisposable } from 'atom';

export default {

  htmlElmfierView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.workspace.observeTextEditors(e => this.handleEvents(e)));
  },

  handleEvents(editor) {
    editor.onDidInsertText((event) => {
      if (this.isElmEditor(editor) && event.text.length > 1) {
        if(!/<(.*?)>/g.test(event.text)){
          return;
        }
        const range = event.range;
        const rootDiv = document.createElement("div");
        rootDiv.innerHTML = event.text;
        children = rootDiv.children;
        if(children.length === 0){
          return;
        }
        const text = this.recursive(rootDiv.childNodes, "", 0);
        const replacedText = text.replace(/^\n    /, "").replace(/\[  \]/g, "[]").replace(/ \n/g, "\n");
        editor.setTextInBufferRange(range, replacedText);
      }
    });
  },

  recursive(elms, text, indent_length){
    if(elms.length === 0){
      return text;
    }

    indent_length++;
    let indents = "";
    for (let i = 0; i < indent_length; i++) {
        indents += "    ";
    }

    const myAllChildrensTextArray = [].map.call(elms, (elm)=>{
    if(elm.tagName){
      return `
${indents + elm.tagName.toLowerCase()} ${this.makeAttrString(elm.attributes)} [ ${this.recursive(elm.childNodes, text, indent_length)} ]`;
    } else {
      return `text "${data}"`;
    }

    let data = elm.data;

    if(data){
      data = data.replace(/\s+/g, " ").replace(/(^\s)|(\s$)/g, "");
      if(data.length === 0){
        return false;
      }
    }

    }).filter(elm => elm !== false);
    return myAllChildrensTextArray.join(", ");
  },

  makeAttrString(attributes){
    const returnArray = [].map.call(attributes, key=>{
      let nodeValue = key.nodeValue;
      if(/^[1-9](|([0-9]*?))$/.test(nodeValue)){
        nodeValue = parseInt(nodeValue);
      } else {
        nodeValue = `"${nodeValue}"`;
      }
      return `${key.nodeName} ${nodeValue}`;
    });
    const l = "[";
    const r = "]";
    let attributesString = "";
    if(returnArray.length){
        attributesString = ` ${returnArray.join(", ")} `;
    }
    return l + attributesString + r;
  },

  isElmEditor(editor) {
    return editor && editor.getPath && editor.getPath() &&
      path.extname(editor.getPath()) === '.elm';
  },

};
