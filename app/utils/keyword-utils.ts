import type { Keyword } from "~/types/keyword";

/**
 * 特定のキーワードとそのすべての子孫のIDリストを取得する関数
 * 親キーワード選択肢から除外するために使用
 * @param keywordId - 起点となるキーワードのID
 * @param allKeywords - 全キーワードのフラットなリスト
 * @returns 起点キーワードとその子孫のIDのSet
 */
export function getKeywordDescendantIds(keywordId: number, allKeywords: Keyword[]): Set<number> {
  const descendantIds = new Set<number>([keywordId]); // 自分自身も含む
  const queue: number[] = [keywordId];

  while (queue.length > 0) {
    const currentParentId = queue.shift()!;
    const children = allKeywords.filter(k => k.parentId === currentParentId);
    for (const child of children) {
      if (!descendantIds.has(child.id)) {
        descendantIds.add(child.id);
        queue.push(child.id);
      }
    }
  }
  return descendantIds;
}
