import { SVGProps } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { EditorBubbleItem, useEditor } from '../../core/components';
import { LuCode, LuList, LuListOrdered, LuListTodo } from 'react-icons/lu';
import { RiH1, RiH2, RiH3, RiQuoteText, RiText } from 'react-icons/ri';

import { Button, Popover } from 'antd';

export type SelectorItem = {
  name: string;
  icon: (props: SVGProps<SVGSVGElement>) => React.ReactNode;
  command: (editor: ReturnType<typeof useEditor>['editor']) => void;
  isActive: (editor: ReturnType<typeof useEditor>['editor']) => boolean;
};

const items: SelectorItem[] = [
  {
    name: 'Text',
    icon: RiText,
    command: (editor) => editor.chain().focus().clearNodes().run(),
    // I feel like there has to be a more efficient way to do this – feel free to PR if you know how!
    isActive: (editor) =>
      editor.isActive('paragraph') && !editor.isActive('bulletList') && !editor.isActive('orderedList'),
  },
  {
    name: 'Heading 1',
    icon: RiH1,
    command: (editor) => editor.chain().focus().clearNodes().toggleHeading({ level: 1 }).run(),
    isActive: (editor) => editor.isActive('heading', { level: 1 }),
  },
  {
    name: 'Heading 2',
    icon: RiH2,
    command: (editor) => editor.chain().focus().clearNodes().toggleHeading({ level: 2 }).run(),
    isActive: (editor) => editor.isActive('heading', { level: 2 }),
  },
  {
    name: 'Heading 3',
    icon: RiH3,
    command: (editor) => editor.chain().focus().clearNodes().toggleHeading({ level: 3 }).run(),
    isActive: (editor) => editor.isActive('heading', { level: 3 }),
  },
  {
    name: 'To-do List',
    icon: LuListTodo,
    command: (editor) => editor.chain().focus().clearNodes().toggleTaskList().run(),
    isActive: (editor) => editor.isActive('taskItem'),
  },
  {
    name: 'Bullet List',
    icon: LuList,
    command: (editor) => editor.chain().focus().clearNodes().toggleBulletList().run(),
    isActive: (editor) => editor.isActive('bulletList'),
  },
  {
    name: 'Numbered List',
    icon: LuListOrdered,
    command: (editor) => editor.chain().focus().clearNodes().toggleOrderedList().run(),
    isActive: (editor) => editor.isActive('orderedList'),
  },
  {
    name: 'Quote',
    icon: RiQuoteText,
    command: (editor) => editor.chain().focus().clearNodes().toggleBlockquote().run(),
    isActive: (editor) => editor.isActive('blockquote'),
  },
  {
    name: 'Code',
    icon: LuCode,
    command: (editor) => editor.chain().focus().clearNodes().toggleCodeBlock().run(),
    isActive: (editor) => editor.isActive('codeBlock'),
  },
];

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NodeSelector = ({ open, onOpenChange }: NodeSelectorProps) => {
  const { editor } = useEditor();
  if (!editor) return null;
  const activeItem = items.filter((item) => item.isActive(editor)).pop() ?? items[0];

  const content = (
    <div className="w-48 p-1">
      {items.map((item) => (
        <EditorBubbleItem
          key={item.name}
          onSelect={(editor) => {
            item.command(editor);
            onOpenChange(false);
          }}
          className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-sm hover:bg-gray-100"
        >
          <div className="flex items-center space-x-2">
            <div className="rounded-sm border p-1 flex items-center justify-center">
              <item.icon className="h-4 w-4" />
            </div>
            <span className="text-xs">{item.name}</span>
          </div>
          {activeItem.name === item.name && <Check className="h-4 w-4" />}
        </EditorBubbleItem>
      ))}
    </div>
  );

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      content={content}
      trigger="click"
      placement="bottom"
      className="flex items-center"
      overlayClassName="editor-node-selector-popover"
    >
      <Button ghost type="text" className="gap-0.5 flex items-center space-x-1 px-2 rounded-none">
        <activeItem.icon className="h-4 w-4" />
        <ChevronDown className="h-3 w-3" />
      </Button>
    </Popover>
  );
};