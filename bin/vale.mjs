import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);

export function valeBinary() {
  const platform = `${process.platform}-${process.arch}`;
  try {
    const manifest = require.resolve(`@taskless/vale-${platform}/package.json`);
    return join(dirname(manifest), process.platform === 'win32' ? 'vale.exe' : 'vale');
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
    throw new Error(`Vale is unavailable for ${platform}. Install optional dependencies on a supported platform.`);
  }
}
