import React, { useCallback, useMemo, useState } from 'react';
import {
  createEditor,
  Editor,
  Element as SlateElement,
  Point,
  Range,
  Transforms,
} from 'slate';
import { withHistory } from 'slate-history';
import {
  Editable,
  Slate,
  useFocused,
  useSelected,
  withReact,
} from 'slate-react';

/* IMAGE RENDER COMPONENT
 * can control css, props, functions like any react code
 */
export const Image = ({ attributes, children, element }) => {
  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <img
          src={element.url}
          alt="idk"
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: '20em',
            boxShadow: selected && focused ? '0 0 0 3px #B4D5FF' : 'none',
          }}
        />
      </div>
      {children}
    </div>
  );
};

// regex to match a url when pasted into editor
const isUrl = (string) => {
  var res = string.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g
  );
  if (res == null) return false;
  else return true;
};

// dummy short list of image extensions
const imageExtensions = ['jpeg', 'gif', 'png', 'jpg', 'webp'];

const isImageUrl = (url) => {
  if (!url) return false;
  if (!isUrl(url)) return false;
  const ext = new URL(url).pathname.split('.').pop();
  return imageExtensions.includes(ext);
};

/* slatejs editor plugin to support images
 */
export const withImages = (editor) => {
  const { insertData, isVoid } = editor;

  editor.isVoid = (element) => {
    return element.type === 'image' ? true : isVoid(element);
  };

  editor.insertData = (data) => {
    const text = data.getData('text/plain');
    const { files } = data;

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader();
        const [mime] = file.type.split('/');

        if (mime === 'image') {
          reader.addEventListener('load', () => {
            const url = reader.result;
            insertImage(editor, url);
          });

          reader.readAsDataURL(file);
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};

const insertImage = (editor, url) => {
  const text = { text: '' };
  const image = { type: 'image', url, children: [text] };
  Transforms.insertNodes(editor, image);
};

// components/Editor/withMarkdown.js

/* Code reference:
 * https://github.com/ianstormtaylor/slate/blob/master/site/examples/markdown-shortcuts.tsx
 */

const MARKDOWN_SHORTCUTS = {
  '*': 'list-item',
  '-': 'list-item',
  '+': 'list-item',
  '>': 'block-quote',
  '#': 'heading-one',
  '##': 'heading-two',
  '###': 'heading-three',
  '####': 'heading-four',
  '#####': 'heading-five',
  '######': 'heading-six',
};

/* slatejs editor plugin to support markdown shortcuts
 */
export const withMarkdownShortcuts = (editor) => {
  const { deleteBackward, insertText } = editor;

  editor.insertText = (text) => {
    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range);
      const type = MARKDOWN_SHORTCUTS[beforeText];

      if (type) {
        Transforms.select(editor, range);
        Transforms.delete(editor);
        const newProperties = {
          type,
        };
        Transforms.setNodes(editor, newProperties, {
          match: (n) => Editor.isBlock(editor, n),
        });

        if (type === 'list-item') {
          const list = {
            type: 'bulleted-list',
            children: [],
          };
          Transforms.wrapNodes(editor, list, {
            match: (n) =>
              !Editor.isEditor(n) &&
              SlateElement.isElement(n) &&
              n.type === 'list-item',
          });
        }

        return;
      }
    }

    insertText(text);
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          !Editor.isEditor(block) &&
          SlateElement.isElement(block) &&
          block.type !== 'paragraph' &&
          Point.equals(selection.anchor, start)
        ) {
          const newProperties = {
            type: 'paragraph',
          };
          Transforms.setNodes(editor, newProperties);

          if (block.type === 'list-item') {
            Transforms.unwrapNodes(editor, {
              match: (n) =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n.type === 'bulleted-list',
              split: true,
            });
          }

          return;
        }
      }

      deleteBackward(...args);
    }
  };

  return editor;
};

export const SlateEditor = (props) => {
  const { placeholder, onChange } = props;

  // value is current editor data
  const [value, setValue] = useState(initialValue);

  const renderElement = useCallback((props) => <Element {...props} />, []);
  const editor = useMemo(
    () =>
      withImages(withMarkdownShortcuts(withReact(withHistory(createEditor())))),
    []
  );

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(value) => {
        setValue(value);
        onChange(value);
      }}
    >
      <Editable
        renderElement={renderElement}
        placeholder={placeholder}
        spellCheck
        autoFocus
      />
    </Slate>
  );
};

/* Defines all the element types the editor can render
 * to add a custom react element, see Image as an example
 */
const Element = (props) => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>;
    case 'heading-three':
      return <h3 {...attributes}>{children}</h3>;
    case 'heading-four':
      return <h4 {...attributes}>{children}</h4>;
    case 'heading-five':
      return <h5 {...attributes}>{children}</h5>;
    case 'heading-six':
      return <h6 {...attributes}>{children}</h6>;
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>;
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'image':
      return <Image {...props} />;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

/* Initial data/template for the editor
 */
const initialValue = [
  {
    type: 'heading-one',
    children: [{ text: 'Hey H1' }],
  },
  {
    type: 'heading-two',
    children: [{ text: 'Hey H2' }],
  },
  {
    type: 'heading-three',
    children: [{ text: 'Hey H3' }],
  },
  {
    type: 'heading-four',
    children: [{ text: 'Hey H4' }],
  },
  {
    type: 'heading-five',
    children: [{ text: 'Hey H5' }],
  },
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          'The editor gives you full control over the logic you can add. For example, it\'s fairly common to want to add markdown-like shortcuts to editors. So that, when you start a line with "> " you get a blockquote that looks like this:',
      },
    ],
  },
  {
    type: 'block-quote',
    children: [{ text: 'A block quote. (did not apply the styling yet)' }],
  },
  {
    type: 'list-item',
    children: [{ text: 'A list item.' }],
  },
  {
    type: 'list-item',
    children: [{ text: 'Another item.' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          'A paragraph. Try it out for yourself! Try starting a new line with markdown shortcuts like "#" for an H1, "##" for an H2, ">" for a block quote, or "-" for a list item',
      },
    ],
  },
  {
    type: 'image',
    url: 'https://source.unsplash.com/kFrdX5IeQzI',
    children: [{ text: '' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          'This example shows images in action. It features two ways to add images. You can either add an image via the toolbar icon above (just kidding, didnt add it yet), or if you want in on a little secret, copy an image URL to your keyboard and paste it anywhere in the editor!',
      },
    ],
  },
];
