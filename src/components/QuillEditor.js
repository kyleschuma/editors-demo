import { fromDelta, toDelta } from 'delta-markdown-for-quill';
import Quill from 'quill';
import MarkdownShortcuts from 'quill-markdown-shortcuts';
import 'quill/dist/quill.bubble.css';
import 'quill/dist/quill.snow.css';
import { useEffect, useRef, useState } from 'react';

Quill.register('modules/markdownShortcuts', MarkdownShortcuts);

export function QuillEditor(props) {
  const container = useRef();
  const [editor, setEditor] = useState();

  const { placeholder, value, onChange } = props;

  useEffect(() => {
    if (editor) return;

    const quill = new Quill(container.current, {
      placeholder,
      theme: 'bubble',
      modules: {
        markdownShortcuts: {},
      },
    });

    const handleChange = () => {
      onChange(fromDelta(quill.getContents().ops));
    };

    quill.on('text-change', handleChange);
    setEditor(quill);

    return () => {
      //quill.off('text-change', handleChange);
    };
  }, [container, editor, placeholder, onChange]);

  useEffect(() => {
    if (editor === undefined) return;

    if (value) {
      editor.setText(toDelta(value));
    }
  }, [editor, value]);

  return <div ref={container} />;
}
