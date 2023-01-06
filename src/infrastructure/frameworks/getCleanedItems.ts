import { CleanedItem } from '../../interfaces/CleanedItem';

import { CleanedItemsError } from '../../application/errors/CleanedItemsError';

/**
 * @description Clean up and return items from DynamoDB in a normalized format.
 */
export function getCleanedItems(items: Record<string, any>[]): CleanedItem[] {
  const fixedItems: CleanedItem[] = [];

  if (items && typeof items === 'object' && items.length > 0) {
    try {
      items.forEach((item: any) => {
        const cleanedItem: Record<string, any> = {};

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

        fixedItems.push(cleanedItem as CleanedItem);
      });
    } catch (error: any) {
      throw new CleanedItemsError();
    }
  }

  return fixedItems;
}
