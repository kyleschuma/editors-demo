import MDEditor from 'rich-markdown-editor';
import './App.css';
import { QuillEditor, SlateEditor, BangleEditor } from './components';

const MD = `
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
## Horizontal Break
---

## Paragraph

I am a boring paragraph
`;

export default function App() {
  const path = window.location.pathname;

  const renderEditor = () => {
    switch (path) {
      case '/bangle':
        return (
          <BangleEditor
            placeholder="Enter some text..."
            defaultValue={MD}
            onChange={(value) => {
              console.log(value);
            }}
          />
        );
      case '/rich-markdown-editor':
        return (
          <MDEditor
            placeholder="Enter some text..."
            defaultValue={MD}
            onChange={(value) => {
              console.log(value());
            }}
            uploadImage={(file) =>
              new Promise((accept, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => accept(reader.result);
                reader.onerror = (error) => reject(error);
              })
            }
          />
        );
      case '/slate':
        return <SlateEditor onChange={(value) => console.log(value)} />;
      case '/quill':
      default:
        return (
          <QuillEditor
            placeholder="Enter some text.."
            defaultValue={MD}
            onChange={(value) => {
              console.log(value);
            }}
          />
        );
    }
  };

  const renderCaption = () => {
    switch (path) {
      case '/rich-markdown-editor':
      case '/slate':
        return (
          <caption>
            Try right clicking the cat, copy image, and paste in the editor.
          </caption>
        );

      case '/bangle':
      case '/quill':
      default:
        return <caption>Try dragging the image into the editor</caption>;
    }
  };

  return (
    <>
      <header>
        <nav>
          <a className={path === '/quill' ? 'active' : ''} href="/quill">
            Quill
          </a>
          <a className={path === '/slate' ? 'active' : ''} href="/slate">
            Slate
          </a>
          <a
            className={path === '/rich-markdown-editor' ? 'active' : ''}
            href="/rich-markdown-editor"
          >
            Rich Markdown Editor
          </a>

          <a className={path === '/bangle' ? 'active' : ''} href="/bangle">
            Bangle
          </a>
        </nav>
      </header>
      <main>{renderEditor()}</main>

      <footer>
        <img
          src="https://welovecatsandkittens.com/wp-content/uploads/2017/03/likes.jpg"
          alt="cat"
        />
        {renderCaption()}
      </footer>
    </>
  );
}
