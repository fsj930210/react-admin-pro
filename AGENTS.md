## Repository expectations

- 项目采用pnpm + monorepo的方式，其中
- 项目基础组件库在/packages/components/ui/src/components下，使用方式是 import {xx} from '@rap/components-ui/xx'
- 项目高级组件在/packages/components/pro/src/components 下, 使用方式是 import {xx} from '@rap/components-pro/xx'
- 项目有一些通用hook在/packages/hooks/src/ 下, 使用方式 import {xx} from '@rap/hooks/xx'，比如稳定引用的hook，use-memoized-fn.ts
- 项目有一些通用utils在/packages/utils/src/ 下, 使用方式 import {xx} from '@rap/utils/xx'
- 项目通用css在/packages/styles/src/下，这里定义一些通用css以及tialwindcss
- 项目文档在/docs目录下
- 项目的一些通用基础配置，比如lint mock rsbuild vite tsconfig在/packages/config/xxx/下
- 项目的demo，app都在apps/web-app/src下，web-app采用@tanstack/react-router的文件路由，其中demo页面在src/pages下，项目mock数据在src/mock下，项目service在src/srvice下，项目layouts在src/layouts下，如果新增路由直接在src/pages下的某个模块下新增一个文件夹然后新增一个index.tsx就行，如果需要新增非路由文件组件直接使用这种方式 `-basic.tsx`，文件名以短横线开头。注意当一个demo的特性很多时，每个特性都需要demo时，应该采用文件组件的模式，而不是在一个文件里面写非常多的组件

- 只新增/删除文件，新增/修改代码，不要检查类型，不要跑lint，如果需要查看运行效果不用跑服务，直接打开localhost:3000/rap-web-app/xxxx
- 写代码时需要以高性能，高扩展，低重渲染为基础，对组件、文件命名时需要做到一目了然，命名规范，简单好记，而不是一些技术类术语；少用甚至不用useCallback, useMemo,一般的瓶颈不在这两个上，并且依赖多了后，缓存开销更大，如果真需要比如稳定引用等hook可以在项目的hooks目录下查找，比如稳定引用的hook，use-memoized-fn.ts，同时支持受控非受控模式use-controllable-state.ts。少用甚至不用监听模式，多用事件模式，比如一个分页变了，不应该监听page变化，然后处理逻辑；而是在分页的回调函数里处理逻辑，不然到处都是useEffect，依赖越写越多，最后变成无法维护。
- 写代码时先看看项目是否有基础组件，不要一上来就是手搓。还有就是要看看有没有对应的hook或者utils，不要自己手写，比如同时支持受控和非受控，直接用项目的use-controllable-state.ts就行了，比如遍历树直接用utils里面的traverseTree方法就行了，不是都要手写的，并且在写的过程中如果觉得这个时比较通用的，可以写到通用的hook或者utils里面去，而不是每次都去自己手写。
