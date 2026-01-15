

interface HighlightTextProps {
  text: string;
  searchKeywords: string[];
  highlightColor?: string;
}

export function SidebarHighlightText({
  text,
  searchKeywords,
  highlightColor = 'text-blue-500',
}: HighlightTextProps) {
  if (!searchKeywords || searchKeywords.length === 0) {
    return <span>{text}</span>;
  }
  const sortedKeywords = [...searchKeywords].sort((a, b) => b.length - a.length);
  
  const regex = new RegExp(`(${sortedKeywords.map(keyword => 
    keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  ).join('|')})`, 'gi');

  // 分割文本并高亮匹配部分
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) => {
        // 检查当前部分是否是匹配的关键词
        const isMatch = sortedKeywords.some(keyword => 
          part.toLowerCase() === keyword.toLowerCase()
        );
        
        return isMatch ? (
          // eslint-disable-next-line @eslint-react/no-array-index-key
          <span key={`${part}_${index}`} className={highlightColor}>
            {part}
          </span>
        ) : (
          // eslint-disable-next-line @eslint-react/no-array-index-key
          <span key={`${part}_${index}`}>{part}</span>
        );
      })}
    </span>
  );
}
