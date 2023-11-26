import { visit } from 'unist-util-visit';
import pintora from '@pintora/cli';

export default function () {
  return async (tree, file) => {
    const nodes = [];
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang === 'pintora') {
        nodes.push([node, index, parent]);
      }
    });

    await Promise.all(nodes.map(async ([node, index, parent]) => {
      const svg = await pintora.render({
        code: node.value,
        mimeType: 'image/svg+xml',
        backgroundColor: 'transparent',
      });
      parent.children[index] = {
        type: 'html',
        value: `<div class='pintora-diagram'>${svg}</div>`,
      };
    }));

    return tree;
  }
}
