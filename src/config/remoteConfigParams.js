// Keys must match Firebase Remote Config parameter names exactly.
export const REMOTE_CONFIG_KEYS = {
  onbToPaywall: 'onbToPaywall',
};

// Local fallbacks used until a successful fetch activates remote values.
// true keeps the current onboarding → paywall path.
export const REMOTE_CONFIG_DEFAULTS = {
  [REMOTE_CONFIG_KEYS.onbToPaywall]: true,
};
