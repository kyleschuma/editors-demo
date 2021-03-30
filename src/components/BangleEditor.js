import { Plugin, SpecRegistry } from '@bangle.dev/core';
import '@bangle.dev/core/style.css';
import { corePlugins, coreSpec } from '@bangle.dev/core/utils/core-components';
import * as markdown from '@bangle.dev/markdown';
import { BangleEditor as Editor, useEditorState } from '@bangle.dev/react';
import React from 'react';

const specRegistry = new SpecRegistry(coreSpec());
const parser = markdown.markdownParser(specRegistry);
const serializer = markdown.markdownSerializer(specRegistry);

export function BangleEditor(props) {
  const { defaultValue, onChange } = props;

  const editorState = useEditorState({
    specRegistry,
    plugins: () => [
      ...corePlugins(),
      new Plugin({
        view: () => ({
          update: (view, prevState) => {
            onChange(serializer.serialize(view.state.doc));
          },
        }),
      }),
    ],
    initialValue: parser.parse(defaultValue),
  });
  return <Editor state={editorState} />;
}

export function serializeMarkdown(editor) {
  return serializer.serialize(editor.view.state.doc);
}

function getMarkdown() {
  return `
## H2 Heading 

### H3 Heading

## Marks

_italic_, **Bold**, _underlined_, ~~striked~~, \`code\`, [link](https://en.wikipedia.org/wiki/Main_Page)

## GFM Todo Lists

- [x] Check out BangleJS

- [ ] Walk the cat

- [ ] Drag these lists by dragging the square up or down.

- [ ] Move these lists with shortcut \`Option-ArrowUp\`. You can move any node (yes headings too) with this shortcut.

## Unordered Lists

- This is an ordered list

  - I am a nested ordered list

  - I am another nested one

    - Bunch of nesting right?

## Ordered Lists

1. Bringing order to the world.

2. Nobody remembers who came second.

   1. We can cheat to become first by nesting.

      - Oh an you can mix and match ordered unordered.

## Image
You can also directly paste images.
![](https://user-images.githubusercontent.com/6966254/101979122-f4405e80-3c0e-11eb-9bf8-9af9b1ddc94f.png)


## Blockquote

> I am a blockquote, trigger me by typing > on a new line

## Code Block

\`\`\`
// This is a code block
function foo() {
  console.log('Hello world!')
}
\`\`\`

## Paragraph

I am a boring paragraph

## Horizontal Break
---
`;
}
