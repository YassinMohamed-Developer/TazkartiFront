import React, { useState } from 'react';

/**
 * Renders inline markdown elements:
 * - **bold**
 * - *italic*
 * - `code`
 * - [link text](url)
 */
const renderInlineMarkdown = (text) => {
  if (!text) return null;

  const tokens = [];
  let remaining = text;
  let key = 0;

  const boldRegex = /\*\*([^*]+)\*\*/;
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
  const italicRegex = /(?<!\*)\*([^*]+)\*(?!\*)/;
  const codeRegex = /`([^`]+)`/;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(boldRegex);
    const linkMatch = remaining.match(linkRegex);
    const codeMatch = remaining.match(codeRegex);
    const italicMatch = remaining.match(italicRegex);

    let earliest = null;
    let type = null;

    if (boldMatch && (!earliest || boldMatch.index < earliest.index)) {
      earliest = boldMatch;
      type = 'bold';
    }
    if (linkMatch && (!earliest || linkMatch.index < earliest.index)) {
      earliest = linkMatch;
      type = 'link';
    }
    if (codeMatch && (!earliest || codeMatch.index < earliest.index)) {
      earliest = codeMatch;
      type = 'code';
    }
    if (italicMatch && (!earliest || italicMatch.index < earliest.index)) {
      earliest = italicMatch;
      type = 'italic';
    }

    if (!earliest) {
      tokens.push(<React.Fragment key={key++}>{remaining}</React.Fragment>);
      break;
    }

    if (earliest.index > 0) {
      tokens.push(<React.Fragment key={key++}>{remaining.substring(0, earliest.index)}</React.Fragment>);
    }

    if (type === 'bold') {
      tokens.push(
        <strong key={key++} className="font-semibold text-on-surface">
          {earliest[1]}
        </strong>
      );
    } else if (type === 'link') {
      tokens.push(
        <a
          key={key++}
          href={earliest[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          {earliest[1]}
        </a>
      );
    } else if (type === 'code') {
      tokens.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-surface-container-high/60 text-primary font-mono text-[11px]"
        >
          {earliest[1]}
        </code>
      );
    } else if (type === 'italic') {
      tokens.push(
        <em key={key++} className="italic text-on-surface/90">
          {earliest[1]}
        </em>
      );
    }

    remaining = remaining.substring(earliest.index + earliest[0].length);
  }

  return tokens;
};

/**
 * Splits raw AI response into semantic blocks:
 * - Bullet lists (only if the text actually contains bullet points: *, -, •)
 * - Numbered lists (1., 2.)
 * - Standard paragraphs (clean, natural flowing text)
 */
const parseBlocks = (rawText) => {
  if (!rawText) return [];

  const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  const blocks = [];
  let currentList = null;

  const flushList = () => {
    if (currentList && currentList.items.length > 0) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (!trimmed) {
      // Check if next line continues a list
      if (currentList) {
        let hasNextItem = false;
        for (let j = i + 1; j < lines.length; j++) {
          const nextTrim = lines[j].trim();
          if (!nextTrim) continue;
          if (/^(\*|-|•)\s+/.test(nextTrim) || /^\d+[\.\)]\s+/.test(nextTrim)) {
            hasNextItem = true;
          }
          break;
        }
        if (!hasNextItem) flushList();
      }
      continue;
    }

    // Bullet point: * or - or •
    const bulletMatch = trimmed.match(/^(\*|-|•)\s+(.*)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'bullet') {
        flushList();
        currentList = { type: 'bullet', items: [] };
      }
      currentList.items.push(bulletMatch[2]);
      continue;
    }

    // Numbered point: 1. or 1)
    const numberMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)$/);
    if (numberMatch) {
      if (!currentList || currentList.type !== 'number') {
        flushList();
        currentList = { type: 'number', items: [] };
      }
      currentList.items.push({ num: numberMatch[1], content: numberMatch[2] });
      continue;
    }

    // Regular line / natural paragraph
    flushList();
    blocks.push({
      type: 'paragraph',
      text: trimmed,
    });
  }

  flushList();
  return blocks;
};

export const FormattedBotMessage = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const blocks = parseBlocks(text);

  return (
    <div className="text-[13px] leading-relaxed text-on-surface/90 space-y-2.5 group/botmsg">
      {blocks.map((block, idx) => {
        // Natural Bullet List (only rendered when response actually has bullet items)
        if (block.type === 'bullet') {
          return (
            <ul key={idx} className="space-y-2 my-1 pl-1">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2 text-[13px] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                  <div className="flex-1 leading-relaxed">
                    {renderInlineMarkdown(item)}
                  </div>
                </li>
              ))}
            </ul>
          );
        }

        // Natural Numbered List
        if (block.type === 'number') {
          return (
            <ol key={idx} className="space-y-2 my-1 pl-1">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2.5 text-[13px] leading-relaxed">
                  <span className="font-semibold text-primary text-xs shrink-0 mt-0.5">
                    {item.num}.
                  </span>
                  <div className="flex-1 leading-relaxed">
                    {renderInlineMarkdown(item.content)}
                  </div>
                </li>
              ))}
            </ol>
          );
        }

        // Standard Natural Paragraph (no forced points or boxes)
        return (
          <p key={idx} className="leading-relaxed">
            {renderInlineMarkdown(block.text)}
          </p>
        );
      })}

      {/* Subtle Copy Button */}
      <div className="flex justify-end pt-0.5 opacity-60 hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          type="button"
          className="inline-flex items-center gap-1 text-[11px] text-secondary hover:text-primary transition-colors px-1 py-0.5 rounded cursor-pointer"
          title="Copy message"
        >
          <span className="material-symbols-outlined text-[13px]">
            {copied ? 'check' : 'content_copy'}
          </span>
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
};
