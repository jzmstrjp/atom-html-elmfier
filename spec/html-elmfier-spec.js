'use babel';

import path from 'path'
import HtmlElmfier from '../lib/html-elmfier';
import helper from './helpers/helper'

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('HtmlElmfier', () => {
  let workspaceElement, activationPromise;
  const pathCopyFrom =
    path.resolve(__dirname, './fixtures/copyFrom.html');
  const pathCopyTo =
    path.resolve(__dirname, './fixtures/copyTo.elm');
  const pathExpected =
    path.resolve(__dirname, './fixtures/expected.elm');
  const pathExpectedIfNoExec =
    path.resolve(__dirname, './fixtures/expectedIfNoExec.elm');

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('html-elmfier');
  });

  it('converts html to elm.', () => {
    const expectedPromise =
      helper.handleFileInEditor(
        pathExpected,
        editor => editor.getText()
      );

    const actualPromise = helper.handleFileInEditor(pathCopyFrom, editor => {
      editor.setSelectedBufferRange([[11, 4], [28, 10]]);
      // editor.copySelectedText();
      return editor.getSelectedText();
    }).then(copiedText =>
      helper.handleFileInEditor(pathCopyTo, editor => {
        editor.setCursorBufferPosition([1, 4]);
        // editor.pasteText();
        editor.insertText(copiedText);
        return editor.getText();
      })
    );

    waitsForPromise(() =>
      Promise.all([
        activationPromise,
        expectedPromise,
        actualPromise
      ]).then(values => {
        const expected = values[1];
        const actual = values[2];
        expect(actual).toBe(expected);
      }
    ));
  });

  it('can be toggled.', () => {
    const expectedPromiseIfOn =
      helper.handleFileInEditor(
        pathExpected,
        editor => editor.getText()
      );
    const expectedPromiseIfOff =
      helper.handleFileInEditor(
        pathExpectedIfNoExec,
        editor => editor.getText()
      );

    const createActualPromise = () => {
      atom.commands.dispatch(workspaceElement, 'html-elmfier:toggle');
      return helper.handleFileInEditor(pathCopyFrom, editor => {
        editor.setSelectedBufferRange([[11, 4], [28, 10]]);
        // editor.copySelectedText();
        return editor.getSelectedText();
      }).then(copiedText =>
        helper.handleFileInEditor(pathCopyTo, editor => {
          editor.setCursorBufferPosition([1, 4]);
          // editor.pasteText();
          editor.insertText(copiedText);
          return editor.getText();
        })
      );
    };

    const actuals = [];
    const actualPromise = Promise.resolve()
      .then(() => createActualPromise())
      .then(value => actuals.push(value))
      .then(() => createActualPromise())
      .then(value => actuals.push(value))
      .then(() => createActualPromise())
      .then(value => actuals.push(value));

    waitsForPromise(() =>
      Promise.all([
        activationPromise,
        expectedPromiseIfOn,
        expectedPromiseIfOff,
        actualPromise
      ]).then(values => {
        const expectedIfOn = values[1];
        const expectedIfOff = values[2];
        expect(actuals[0]).toBe(expectedIfOff);
        expect(actuals[1]).toBe(expectedIfOn);
        expect(actuals[2]).toBe(expectedIfOff);
      }
    ));
  });
});
