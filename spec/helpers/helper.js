'use babel';

export default {
  handleFileInEditor: async (filepath, callback) => {
    const editor = await atom.workspace.open(filepath);
    const value = callback(editor);
    const closed =
      await atom.workspace.paneForItem(editor).destroyItem(editor, true);
    expect(closed).toBe(true);
    return value;
  }
};
