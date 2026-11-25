// Wraps app.json. Android push needs Firebase's google-services.json, which stays out of this
// public repo: EAS builds get it from the secret file variable GOOGLE_SERVICES_JSON, and local
// builds use ./google-services.json if it's there (git-ignored).
const fs = require('fs');

module.exports = ({ config }) => {
  const file = process.env.GOOGLE_SERVICES_JSON ?? (fs.existsSync('./google-services.json') ? './google-services.json' : undefined);
  return {
    ...config,
    android: { ...config.android, ...(file ? { googleServicesFile: file } : {}) },
  };
};
