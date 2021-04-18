import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactNativePlugin } from '@microsoft/applicationinsights-react-native';

import { APP_INSIGHTS_INSTRUMENTATION_KEY } from '../env';

const RNPlugin = new ReactNativePlugin();
const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: APP_INSIGHTS_INSTRUMENTATION_KEY,
    extensions: [RNPlugin]
  }
});

appInsights.loadAppInsights();
export default appInsights;