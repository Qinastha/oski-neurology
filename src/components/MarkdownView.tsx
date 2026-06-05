function renderInline(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code className="rounded bg-[#fffaf0] px-1.5 py-0.5 text-[#875e00]" key={index}>
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return <span key={index}>{part}</span>;
  });
}

function parseOrderedBlock(block: string) {
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.some((line) => /^\d+\.\s+/.test(line))) {
    return null;
  }

  const intro: string[] = [];
  const items: string[] = [];
  let currentItem = "";

  for (const line of lines) {
    const match = line.match(/^\d+\.\s+(.*)$/);
    if (match) {
      if (currentItem) {
        items.push(currentItem);
      }
      currentItem = match[1].trim();
      continue;
    }

    if (currentItem) {
      currentItem = `${currentItem} ${line}`;
    } else {
      intro.push(line);
    }
  }

  if (currentItem) {
    items.push(currentItem);
  }

  return items.length > 0 ? { intro: intro.join(" "), items } : null;
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
    <div className="text-[15px] leading-[1.65] text-[#343a43]">
      {blocks.map((block, index) => {
        if (block.startsWith("### ")) {
          return (
            <h3 className="mb-2 mt-4 text-[17px] font-bold text-clinical-text" key={index}>
              {renderInline(block.slice(4))}
            </h3>
          );
        }

        if (block.startsWith("- ")) {
          return (
            <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0" key={index}>
              {block.split("\n").map((line, lineIndex) => (
                <li key={lineIndex}>{renderInline(line.replace(/^-\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        const orderedBlock = parseOrderedBlock(block);
        if (orderedBlock) {
          return (
            <div className="mb-3 last:mb-0" key={index}>
              {orderedBlock.intro ? (
                <p className="mb-2">{renderInline(orderedBlock.intro)}</p>
              ) : null}
              <ol className="list-decimal space-y-1.5 pl-5">
                {orderedBlock.items.map((item, itemIndex) => (
                  <li className="pl-1" key={itemIndex}>
                    {renderInline(item)}
                  </li>
                ))}
              </ol>
            </div>
          );
        }

        return (
          <p className="mb-3 last:mb-0" key={index}>
            {renderInline(block.replace(/\n/g, " "))}
          </p>
        );
      })}
    </div>
  );
}
