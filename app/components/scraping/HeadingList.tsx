import type { HeadingItem } from "~/types/article";

interface Props {
  headings: HeadingItem[];
}

export function HeadingList({ headings }: Props) {
  console.log(headings);
  return (
    <ul className="space-y-1 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
      {headings.map((heading, index) => (
        <li key={index} className="text-foreground">
          <div className="flex items-start">
            <span className={`inline-block min-w-[40px] font-medium ${
              heading.tag === 'h1' ? 'text-lg text-emerald-600 dark:text-emerald-400' :
              heading.tag === 'h2' ? 'text-base text-blue-600 dark:text-blue-400' :
              heading.tag === 'h3' ? 'text-sm text-indigo-600 dark:text-indigo-400' :
              'text-xs text-purple-600 dark:text-purple-400'
            }`}>
              {heading.tag}:
            </span>
            <span className="ml-2">{heading.text || "（空の見出し）"}</span>
          </div>
          {heading.children && heading.children.length > 0 && <HeadingList headings={heading.children} />}
        </li>
      ))}
    </ul>
  );
}
