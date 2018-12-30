'use babel';

/**
 * @typedef {Object} SaneNode
 * @property {NamedNodeMap} attributes
 * @property {Array.<SaneNode>} childNodes
 * @property {string} commentValue
 * @property {boolean} isComment
 * @property {boolean} isText
 * @property {string} tagName
 * @property {string} textValue
 */

/**
 * JSのうんちみたいなNodeオブジェクトを再解釈する。
 * ワイのまともなオブジェクトへと置き換えるんや。
 * @param  {Iterable.<Node>} nodes
 * @return {Array.<SaneNode>}
 */
const reinterpretNodes = (nodes) => {
  const saneNodes = [];
  nodes.forEach((node) => {
    const saneNode = {};
    saneNode.isText = node.nodeType === Node.TEXT_NODE;
    saneNode.isComment = node.nodeType === Node.COMMENT_NODE;

    if (saneNode.isComment) {
      saneNode.commentValue = node.data
        .replace(/^[ \t]+/mg, ''); // 行頭のインデントは要らんねん。
    } else if (saneNode.isText) {
      saneNode.textValue = node.data
        .replace(/\s+/g, ' ') // HTMLでスペースや改行がいくらあっても意味ないねん。
        .trim();
      // スペースや改行だけで出来てたNodeって、それただのHTMLの空白や！
      if (saneNode.textValue === '') return;
    } else {
      saneNode.attributes = node.attributes;
      saneNode.tagName = node.tagName.toLowerCase();
      saneNode.childNodes = reinterpretNodes(node.childNodes);
    }

    saneNodes.push(saneNode);
  });
  return saneNodes;
};

export default {
  /**
   * HTMLをNodeに変換するんや。ワイの特製Nodeオブジェクトやで〜。
   * @param  {string} html
   * @return {Array.<SaneNode>}
   */
  parse(html) {
    const virtualDiv = document.createElement('div');
    virtualDiv.innerHTML = html;
    return reinterpretNodes(virtualDiv.childNodes);
  },
};
