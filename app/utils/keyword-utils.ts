import type { Keyword } from "~/types/keyword";

/**
 * 階層構造を持つキーワードの型定義
 */
export interface HierarchicalKeyword extends Keyword {
  children: HierarchicalKeyword[];
}

/**
 * フラットなキーワードリストを階層構造（ツリー）に変換する関数
 * @param keywords - フラットなキーワードの配列
 * @param parentId - 現在処理中の親ID (初期呼び出し時は null)
 * @returns 階層構造化されたキーワードの配列
 */
export function buildKeywordTree(
  keywords: Keyword[],
  parentId: number | null = null
): HierarchicalKeyword[] {
  const tree: HierarchicalKeyword[] = [];

  // parentId に一致するキーワードをフィルタリング
  // level 1 のキーワードは parentId が null のもの
  const children = keywords.filter((keyword) => keyword.parentId === parentId);

  // 各子要素に対して再帰的に処理
  for (const child of children) {
    // 再帰呼び出しで孫要素を取得
    const grandchildren = buildKeywordTree(keywords, child.id);
    // HierarchicalKeyword 型に変換してツリーに追加
    tree.push({
      ...child,
      children: grandchildren,
    });
  }

  // 同じ階層内での表示順序を安定させるため、キーワード名でソート
  tree.sort((a, b) => a.keywordName.localeCompare(b.keywordName));

  return tree;
}


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
