import remoteConfig from '@react-native-firebase/remote-config';
import { REMOTE_CONFIG_DEFAULTS } from '../config/remoteConfigParams';

const getAllParameters = () => {
  const entries = remoteConfig().getAll();

  return Object.fromEntries(
    Object.entries(entries).map(([key, value]) => [
      key,
      {
        value: value.asString(),
        source: value.getSource(),
      },
    ]),
  );
};

export const fetchRemoteConfig = async () => {
  try {
    await remoteConfig().setDefaults(REMOTE_CONFIG_DEFAULTS);
    await remoteConfig().setConfigSettings({
      minimumFetchIntervalMillis: __DEV__ ? 0 : 12 * 60 * 60 * 1000,
    });

    await remoteConfig().fetchAndActivate();

    console.log('REMOTE CONFIG PARAMETERS', getAllParameters());
  } catch (error) {
    console.log('REMOTE CONFIG PARAMETERS', {
      error: error?.message ?? String(error),
    });
  }
};
