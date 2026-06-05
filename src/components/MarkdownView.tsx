function renderInline(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return <span key={index}>{part}</span>;
  });
}

export function MarkdownView({ markdown }: { markdown: string }) {
  const blocks = markdown
    .trim()
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className="markdown-view">
      {blocks.map((block, index) => {
        if (block.startsWith("### ")) {
          return <h3 key={index}>{renderInline(block.slice(4))}</h3>;
        }

        if (block.startsWith("- ")) {
          return (
            <ul key={index}>
              {block.split("\n").map((line, lineIndex) => (
                <li key={lineIndex}>{renderInline(line.replace(/^-\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        return <p key={index}>{renderInline(block.replace(/\n/g, " "))}</p>;
      })}
    </div>
  );
}
