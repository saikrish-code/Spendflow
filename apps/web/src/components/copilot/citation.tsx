import { Badge } from '@/components/ui/badge';
import React from 'react';

const BILL_REGEX = /\[(BILL-\d{4})\]/g;

export function parseCitations(text: string, onCitationClick: (id: string) => void) {
  if (!text) return null;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = BILL_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={lastIndex}>{text.substring(lastIndex, match.index)}</span>);
    }
    const billId = match[1];
    parts.push(
      <Badge
        key={match.index}
        variant="outline"
        className="cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary mx-1"
        onClick={() => onCitationClick(billId!)}
      >
        {billId}
      </Badge>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={lastIndex}>{text.substring(lastIndex)}</span>);
  }

  return parts;
}
