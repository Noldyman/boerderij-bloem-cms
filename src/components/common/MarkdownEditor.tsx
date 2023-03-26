import MDEditor, { commands } from "@uiw/react-md-editor";

interface Props {
  value: string;
  onChange: (input: string | undefined) => void;
}

export const MarkdownEditor = ({ value, onChange }: Props) => {
  const allowedCommands = [
    commands.group([commands.title1, commands.title2, commands.title3], {
      name: "title",
      groupName: "title",
      buttonProps: { "aria-label": "Insert title" },
    }),
    commands.bold,
    commands.italic,
    commands.link,
    commands.orderedListCommand,
    commands.unorderedListCommand,
  ];

  const extraCommands = [commands.codeEdit, commands.codePreview];

  return (
    <MDEditor
      className="text-editor"
      commands={allowedCommands}
      extraCommands={extraCommands}
      preview="edit"
      data-color-mode="light"
      value={value}
      onChange={onChange}
    />
  );
};
