import { MikroMetric } from 'mikrometric';

import { metadataConfig } from '../../config/metadata';

/**
 * @description Add a custom metric using `mikrometric`.
 */
export function addCustomMetric(cacheStatus: 'cached' | 'uncached') {
  const mikroMetric = MikroMetric.start({
    namespace: metadataConfig.service,
    serviceName: metadataConfig.service
  });
  mikroMetric.putDimension('Cache status (get)', 'gitmetrix');
  mikroMetric.putMetric(cacheStatus, 1, 'Count');
  mikroMetric.setProperty('Time of fetch (approximate)', `${Math.floor(Date.now() / 1000)}`);
  mikroMetric.flush();
}
