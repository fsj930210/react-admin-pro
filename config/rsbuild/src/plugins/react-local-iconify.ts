import type { RsbuildPlugin } from '@rsbuild/core';
// import type { Compiler } from '@rspack/core';
import { rspack } from '@rsbuild/core';
import {
  importDirectory,
  cleanupSVG,
  parseColors,
  isEmptyColor,
  runSVGO,
} from '@iconify/tools';


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

// 这里不能用Virtual:，rsbuild会报错unhandled scheme 所以使其看起来像npm包，主要是为了统一vite和rsbuild
const VIRTUAL_MODULE_ID = 'virtual-react-local-iconify';

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
export function pluginReactLocalIconify(userOptions: UserOptions): RsbuildPlugin {
  if (!userOptions?.resolver || !Array.isArray(userOptions.configs) || userOptions.configs.length === 0) {
    throw new Error('[rsbuild-plugin-iconify] Missing required options.');
  }
  return {
    name: 'rsbuild:react-local-iconify',
    async setup(api) {
			const content = await createReactLocalIconifyIcon(userOptions) || '';
			const pkg = {
				name: VIRTUAL_MODULE_ID,
				version: '1.0.0',
				main: 'index.ts',
				peerDependencies: { [userOptions.resolver]: '*' },
			}
			const virtualModulesPlugin = new rspack.experiments.VirtualModulesPlugin({
			[`node_modules/${VIRTUAL_MODULE_ID}/package.json`]: JSON.stringify(pkg),
			[`node_modules/${VIRTUAL_MODULE_ID}/index.ts`]: content,
		});
      api.modifyRspackConfig((config) => {
        config.plugins.push(virtualModulesPlugin);
      });
    },
  };
}