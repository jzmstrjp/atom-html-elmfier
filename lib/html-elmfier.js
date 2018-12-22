'use babel';

import { CompositeDisposable } from 'atom';
import path from 'path';

export default {

  subscriptions: null,
  enabled: true,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'html-elmfier:toggle': () => this.toggle(),
    }));
    this.subscriptions.add(atom.workspace.observeTextEditors(e => this.handleEvents(e)));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  toggle() {
    this.enabled = !this.enabled;
  },

  handleEvents(editor) {
    this.subscriptions.add(editor.onDidInsertText((event) => {
      if (!this.enabled || !this.isElmEditor(editor) || event.text.length < 4 || !/<(.*?)>/.test(event.text)) {
        return;
      }
      const rootDiv = document.createElement('div');
      rootDiv.innerHTML = event.text;
      if (rootDiv.children.length === 0) {
        return;
      }
      const text = this.recursive(rootDiv.childNodes, '', 0);
      const replacedText = text.replace(/^\n {4}/, '').replace(/\[ {2}\]/g, '[]').replace(/ \n/g, '\n');
      const range = event.range;
      editor.setTextInBufferRange(range, replacedText);
    }));
  },

  recursive(elms, text, indentLength) {
    if (elms.length === 0) {
      return text;
    }
    indentLength++;
    const myAllChildrensTextArray = [].map.call(elms, (elm) => {
      if (elm.tagName) {
        return `
${this.makeIndents(indentLength) + elm.tagName.toLowerCase()} ${this.makeAttrString(elm.attributes)} [ ${this.recursive(elm.childNodes, text, indentLength)} ]`;
      }
      let data = elm.data;
      data = data.replace(/\s+/g, ' ').replace(/(^\s)|(\s$)/g, '');
      if (data.length) {
        return `text "${data}"`;
      }
      return null;
    }).filter(elm => elm);
    return myAllChildrensTextArray.join(', ');
  },

  makeIndents(indentLength, text = '') {
    if (indentLength === 0) {
      return text;
    }
    return this.makeIndents(indentLength - 1, `${text}    `);
  },

  makeAttrString(attributes) {
    const returnArray = [].map.call(attributes, (key) => {
      const nodeValue = key.nodeValue;
      let semicolon = '';
      if (!/^[1-9](|([0-9]*?))$/.test(nodeValue)) {
        semicolon = '"';
      }
      return `${key.nodeName} ${semicolon + nodeValue + semicolon}`;
    });
    let attributesString = '';
    if (returnArray.length) {
      attributesString = ` ${returnArray.join(', ')} `;
    }
    return `[${attributesString}]`;
  },

  isElmEditor(editor) {
    return editor && editor.getPath && editor.getPath()
      && path.extname(editor.getPath()) === '.elm';
  },

};
