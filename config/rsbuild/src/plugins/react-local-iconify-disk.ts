
import type { RsbuildPlugin } from '@rsbuild/core';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
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
  resolver: '@iconify/react' | '@iconify/vue' | '@iconify/svelte';
  configs: UserConfigs[];
};

const CACHE_DIR = join(process.cwd(), 'node_modules');
const VIRTUAL_PKG_DIR = join(CACHE_DIR, 'virtual-react-local-iconify');
const INDEX_JS_PATH = join(VIRTUAL_PKG_DIR, 'index.ts');
const PACKAGE_JSON_PATH = join(VIRTUAL_PKG_DIR, 'package.json');


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

function ensurePlaceholder(userOptions: UserOptions) {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
  if (!existsSync(VIRTUAL_PKG_DIR)) {
    mkdirSync(VIRTUAL_PKG_DIR, { recursive: true });
  }

  if (!existsSync(INDEX_JS_PATH)) {
    writeFileSync(INDEX_JS_PATH, '// generating icon bundle...', 'utf8');
  }

  if (!existsSync(PACKAGE_JSON_PATH)) {
    const pkgJson = JSON.stringify(
      {
        name: 'virtual-react-local-iconify',
        version: '1.0.0',
        main: 'index.ts',
        peerDependencies: {
          [userOptions.resolver]: '*',
        },
      },
      null,
      2
    );
    writeFileSync(PACKAGE_JSON_PATH, pkgJson, 'utf8');
  }
}


export  function pluginReactLocalIconify(userOptions: UserOptions): RsbuildPlugin {
  if (!userOptions?.resolver || !Array.isArray(userOptions.configs) || userOptions.configs.length === 0) {
    throw new Error('[rsbuild-plugin-iconify] Missing required options.');
  }
  ensurePlaceholder(userOptions);

  return {
    name: 'rsbuild:react-local-iconify',
    setup(api) {
      api.onBeforeStartDevServer(async () => {
       const content =  await createReactLocalIconifyIcon(userOptions);
			 writeFileSync(INDEX_JS_PATH, content || '', 'utf8');
      });

      api.onBeforeBuild(async () => {
        const content =  await createReactLocalIconifyIcon(userOptions);
			 	writeFileSync(INDEX_JS_PATH, content || '', 'utf8');
      });
    },
  };
}
