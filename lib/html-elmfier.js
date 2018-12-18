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
      if (!this.isElmEditor(editor) || event.text.length < 4 || !/<(.*?)>/.test(event.text)) {
        return;
      }
      const rootDiv = document.createElement("div");
      rootDiv.innerHTML = event.text;
      if(rootDiv.children.length === 0){
        return;
      }
      const text = this.recursive(rootDiv.childNodes, "", 0);
      const replacedText = text.replace(/^\n    /, "").replace(/\[  \]/g, "[]").replace(/ \n/g, "\n");
      const range = event.range;
      editor.setTextInBufferRange(range, replacedText);
    });
  },

  recursive(elms, text, indent_length){
    if(elms.length === 0){
      return text;
    }
    indent_length++;
    const myAllChildrensTextArray = [].map.call(elms, (elm)=>{
      if(elm.tagName){
        return `
${this.makeIndents(indent_length) + elm.tagName.toLowerCase()} ${this.makeAttrString(elm.attributes)} [ ${this.recursive(elm.childNodes, text, indent_length)} ]`;
      } else {
        let data = elm.data;
        data = data.replace(/\s+/g, " ").replace(/(^\s)|(\s$)/g, "");
        if(data.length){
          return `text "${data}"`;
        }
      }
    }).filter(elm => elm);
    return myAllChildrensTextArray.join(", ");
  },

  makeIndents(indent_length, text = ""){
    if(indent_length === 0){
      return text;
    }
    return this.makeIndents(indent_length - 1, text += "    ");
  },

  makeAttrString(attributes){
    const returnArray = [].map.call(attributes, key=>{
      let nodeValue = key.nodeValue;
      let semicolon = '';
      if(!/^[1-9](|([0-9]*?))$/.test(nodeValue)){
        semicolon = '"';
      }
      return `${key.nodeName} ${semicolon + nodeValue + semicolon}`;
    });
    let attributesString = "";
    if(returnArray.length){
        attributesString = ` ${returnArray.join(", ")} `;
    }
    return `[${attributesString}]`;
  },

  isElmEditor(editor) {
    return editor && editor.getPath && editor.getPath() &&
      path.extname(editor.getPath()) === '.elm';
  },

};
