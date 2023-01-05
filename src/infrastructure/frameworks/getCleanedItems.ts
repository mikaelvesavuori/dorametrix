/**
 * @description Clean up and return items in a normalized format.
 * @todo Break out into separate function
 */
export function getCleanedItems(items: any[]) {
  const fixedItems: any = [];

  if (items && typeof items === 'object' && items.length > 0) {
    try {
      items.forEach((item: any) => {
        const cleanedItem: Record<string, any> = {};

        Object.entries(item).forEach((entry: any) => {
          const [key, value] = entry;
          if (key === 'pk') return;
          if (key === 'sk') {
            cleanedItem['timeCreated'] = Object.values(value)[0];
          } else cleanedItem[key] = Object.values(value)[0];
        });

        fixedItems.push(cleanedItem);
      });
    } catch (error: any) {
      console.error(error);
      throw new Error(error);
    }
  }

  return fixedItems;
}
