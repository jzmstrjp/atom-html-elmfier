'use babel';

import { CompositeDisposable } from 'atom';
import path from 'path';
import htmlParser from './html-parser';

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
      const nodes = htmlParser.parse(event.text);
      const elmText = this.toElmText(nodes, 1);
      if (elmText.length > 0) {
        editor.setTextInBufferRange(event.range, elmText);
      }
    }));
  },

  toElmText(nodes, indentLength) {
    return nodes.filter(node => !node.isComment).map((node) => {
      if (node.isText) {
        return `text "${node.textValue}"`;
      }
      const attrListText = this.createAttrListText(node.attributes);
      const childNodeListText = this.createChildNodeListText(
        node.childNodes, indentLength,
      );
      return `${node.tagName} ${attrListText} ${childNodeListText}`;
    }).join(`,\n${this.createIndent(indentLength)}`);
  },

  createAttrListText(attrs) {
    if (attrs.length === 0) return '[]';
    const exprs = Array.from(attrs).map((attr) => {
      const name = (attr.nodeName === 'type') ? 'type_' : attr.nodeName;
      const value = /^[1-9][0-9]*$/.test(attr.nodeValue)
        ? attr.nodeValue : `"${attr.nodeValue}"`;
      return `${name} ${value}`;
    });
    return `[ ${exprs.join(', ')} ]`;
  },

  createChildNodeListText(childNodes, indentLength) {
    if (childNodes.length === 0) return '[]';
    const childrenText = this.toElmText(childNodes, indentLength + 1);
    if (childNodes.length === 1 && childNodes[0].isText) {
      return `[ ${childrenText} ]`;
    }
    const indent = this.createIndent(indentLength + 1);
    return `[\n${indent}${childrenText} ]`;
  },

  createIndent(len) {
    return ' '.repeat(4 * len);
  },

  isElmEditor(editor) {
    return editor && editor.getPath && editor.getPath()
      && path.extname(editor.getPath()) === '.elm';
  },

};
