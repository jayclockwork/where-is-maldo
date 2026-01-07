export type MdastNode = {
  type: string;
  value?: string;
  children?: MdastNode[];
};

export function mdastToText(node: MdastNode): string {
  if (!node) return "";
  if (typeof node.value === "string") return node.value;
  if (!node.children) return "";
  return node.children.map(mdastToText).join("");
}


