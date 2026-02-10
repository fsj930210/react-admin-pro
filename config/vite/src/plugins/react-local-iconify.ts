import {
  importDirectory,
  cleanupSVG,
  parseColors,
  isEmptyColor,
  runSVGO,
} from '@iconify/tools';

import type { Plugin } from 'vite';

type UserConfigs = {
  dir: string;
  prefix?: string;
  provider?: string;
  monotone?: boolean;
};
type UserOptions = {
  resolver: '@iconify/react';
  configs: UserConfigs[];
};

const VIRTUAL_MODULE_ID = 'virtual-react-local-iconify';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

async function createReactLocalIconifyIcon(options: UserOptions) {
  let bundle = "import { addCollection } from '" + options.resolver + "';\n\n";

  for (const option of options.configs) {
    option.prefix = option.prefix || 'ra-icon';
    // 导入图标
    const iconSet = await importDirectory(option.dir, {
      prefix: option.prefix,
    });
    // 验证，清理，修复颜色并优化
    await iconSet.forEach(async (name: string, type: string) => {
      if (type !== 'icon') return;
      // 获取SVG实例以进行分析
      const svg = iconSet.toSVG(name);
      if (!svg) {
        // 无效的图标
        iconSet.remove(name);
        return;
      }
      try {
        // Clean up icon code
        await cleanupSVG(svg);
        if (option.monotone) {
          // Replace color with currentColor, add if missing
          // If icon is not monotone, remove this code
          await parseColors(svg, {
            defaultColor: 'currentColor',
            callback: (_: any, colorStr: string, color: any) => {
              return !color || isEmptyColor(color) ? colorStr : 'currentColor';
            },
          });
        }
        // Optimise
        await runSVGO(svg);
      } catch (err) {
        // Invalid icon
        console.error(`Error parsing ${name} from ${option.dir}:`, err);
        iconSet.remove(name);
        return;
      }
      // Update icon from SVG instance
      iconSet.fromSVG(name, svg);
    });
    // Export to JSON
    const content = iconSet.export();
    bundle += 'addCollection(' + JSON.stringify(content) + ');\n';
  }
	return bundle;
}
export function pluginReactLocalIconify(userOptions: UserOptions): Plugin {
  return {
    name: 'vite-plugin-react-local-iconify',
    enforce: 'pre',
    configResolved() {
      if (
        !userOptions ||
        !userOptions.resolver ||
        userOptions.configs?.length <= 0
      ) {
        throw Error('Please configure correctly.');
      }
    },
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
    },
    async load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        const iconSet = await createReactLocalIconifyIcon(userOptions);
        return iconSet;
      }
    },
  };
}

