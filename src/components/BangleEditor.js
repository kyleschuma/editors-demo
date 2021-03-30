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
