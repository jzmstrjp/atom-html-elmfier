'use babel';

import { CompositeDisposable } from 'atom';
import path from 'path';

export default {

  subscriptions: null,
  enabled: true,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'html-elmfier:toggle': () => this.toggle(),
      }),
      atom.workspace.observeTextEditors(e => this.handleEditor(e)),
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  toggle() {
    this.enabled = !this.enabled;
  },

  handleEditor(editor) {
    this.subscriptions.add(editor.onDidInsertText((event) => {
      if (!this.enabled
        || !this.isElmEditor(editor)
        || event.text.length < 4
        || !/<(.*?)>/.test(event.text)) {
        return;
      }
      const rootDiv = document.createElement('div');
      rootDiv.innerHTML = event.text;
      if (rootDiv.children.length === 0) {
        return;
      }
      const replacedText = this.replaceHtmlNodes(rootDiv.childNodes, '', 0);
      const emptyRemovedText = replacedText.replace(/^\n {4}/, '')
        .replace(/\[ {2}\]/g, '[]')
        .replace(/ \n/g, '\n');
      editor.setTextInBufferRange(event.range, emptyRemovedText);
    }));
  },

  replaceHtmlNodes(nodes, text, indentLength) {
    if (nodes.length === 0) {
      return text;
    }
    indentLength++;
    const childrenTexts = Array.from(nodes).map((node) => {
      if (node.tagName) {
        const indents = ' '.repeat(4 * indentLength);
        const tag = node.tagName.toLowerCase();
        const attr = this.makeAttrString(node.attributes);
        const children = this.replaceHtmlNodes(
          node.childNodes, text, indentLength,
        );
        return `\n${indents}${tag} ${attr} [ ${children} ]`;
      }
      const nodeData = node.data
        .replace(/\s+/g, ' ')
        .replace(/(^\s)|(\s$)/g, '');
      if (nodeData.length) {
        return `text "${nodeData}"`;
      }
      return null;
    }).filter(elm => elm);
    return childrenTexts.join(', ');
  },

  makeAttrString(attributes) {
    const attrStringUnits = Array.from(attributes).map((key) => {
      let value = key.nodeValue;
      if (!/^[1-9](|([0-9]*?))$/.test(value)) {
        value = `"${value}"`;
      }
      return `${key.nodeName} ${value}`;
    });
    let attributesString = '';
    if (attrStringUnits.length) {
      attributesString = ` ${attrStringUnits.join(', ')} `;
    }
    return `[${attributesString}]`;
  },

  isElmEditor(editor) {
    return editor && editor.getPath && editor.getPath()
      && path.extname(editor.getPath()) === '.elm';
  },

};
