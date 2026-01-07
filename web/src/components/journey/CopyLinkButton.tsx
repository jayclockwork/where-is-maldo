"use client";

import { IconButton, Tooltip } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import { useMemo, useState } from "react";

export function CopyLinkButton({ anchorId }: { anchorId: string }) {
  const [copied, setCopied] = useState(false);

  const href = useMemo(() => `#${anchorId}`, [anchorId]);

  async function onCopy(e: React.MouseEvent | React.KeyboardEvent) {
    e.preventDefault();
    e.stopPropagation();
    const absolute = `${window.location.origin}${window.location.pathname}${href}`;
    await navigator.clipboard.writeText(absolute);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <Tooltip title={copied ? "Copied!" : "Copy link"}>
      <IconButton
        // Important: AccordionSummary renders as a <button>. Avoid nesting another <button>.
        component="span"
        role="button"
        tabIndex={0}
        aria-label="Copy link to section"
        size="small"
        onClick={onCopy}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onCopy(e);
        }}
      >
        <LinkIcon fontSize="inherit" />
      </IconButton>
    </Tooltip>
  );
}


