import { CleanedItem } from '../../interfaces/CleanedItem';

import { DynamoItem } from '../../interfaces/DynamoDb';

/**
 * @description Clean up and return items in a normalized `CleanedItem` format.
 */
export function getCleanedItems(items: DynamoItem[]): CleanedItem[] {
  if (items && items.length > 0) return items.map((item: DynamoItem) => createCleanedItem(item));
  return [];
}

/**
 * @description Produce an object with a cleaned and restored format based on the input data.
 */
function createCleanedItem(item: Record<string, any>): CleanedItem {
  const cleanedItem: Record<string, any> = {};

  // This is a cached item so return as-is
  if (item.data) return JSON.parse(item.data);

  Object.entries(item).forEach((entry: any) => {
    const [key, value] = entry;
    if (key === 'pk') return; // No use including this key
    if (key === 'sk') {
      cleanedItem['timeCreated'] = Object.values(value)[0];
    } else if (key === 'changes') {
      // @ts-ignore
      cleanedItem[key] = JSON.parse(Object.values(value)[0]); // Parse into actual JSON
    } else cleanedItem[key] = Object.values(value)[0];
  });

  return cleanedItem as CleanedItem;
}
