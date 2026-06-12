## Repository expectations

- 项目采用`pnpm + monorepo`的方式，其中

- 项目基础组件库在`/packages/components/ui/src/components`下，使用方式是 `import {xx} from '@rap/components-ui/xx'`

- 项目高级组件在`/packages/components/pro/src/components` 下, 使用方式是 `import {xx} from '@rap/components-pro/xx'`

- 项目有一些通用`hook`在`/packages/hooks/src/` 下, 使用方式 `import {xx} from '@rap/hooks/xx'`，比如稳定引用的`hook`，`use-memoized-fn.ts`

- 项目有一些通用`utils`在`/packages/utils/src/` 下, 使用方式 `import {xx} from '@rap/utils/xx'`

- 项目通用`css在/packages/styles/src/`下，这里定义一些通用`css`以及`tialwindcss`

- 项目文档在`/docs`目录下

- 项目的一些通用基础配置，比如`lint` `mock` `rsbuild` `vite` `tsconfig`在`/packages/config/xxx/`下

- 项目的`demo`，`app`都在`apps/web-app/src`下，`web-app`采用`@tanstack/react-router`的文件路由，其中`demo`页面在`src/pages`下，项目`mock`数据在`src/mock`下，项目`service`在`src/srvice`下，项目`layouts`在`src/layouts`下，如果新增路由直接在`src/pages`下的某个模块下新增一个文件夹然后新增一个`index.tsx`就行，如果需要新增非路由文件组件直接使用这种方式 `-basic.tsx`，文件名以短横线开头，注意这是特指在`web-app`里面的`pages`下创建组件时的规范，不是这个目录下不要加短横线。注意当一个`demo`的特性很多时，每个特性都需要`demo`时，应该采用文件组件的模式，而不是在一个文件里面写非常多的组件

- 只新增/删除文件，新增/修改代码，不要检查类型，不要跑`lint`，如果需要查看运行效果不用跑服务，直接打开`localhost:3000/rap-web-app/xxxx`

- 写代码时需要以高性能，高扩展，低重渲染为基础，对组件、文件命名时需要做到一目了然，命名规范，简单好记，而不是一些技术类术语；少用甚至不用`useCallback`, `useMemo`,一般的瓶颈不在这两个上，并且依赖多了后，缓存开销更大，如果真需要比如稳定引用等`hook`可以在项目的`hooks`目录下查找，比如稳定引用的`hook`，`use-memoized-fn.ts`，同时支持受控非受控模式`use-controllable-state.ts`。少用甚至不用监听模式，多用事件模式，比如一个分页变了，不应该监听`page`变化，然后处理逻辑；而是在分页的回调函数里处理逻辑，不然到处都是`useEffect`，依赖越写越多，最后变成无法维护。如果一定用`useCallback` `useMemo` `useEffect` 必须有注释在那里，写明为什么用，依赖的各个来源，哪些情况会触发依赖更新。

- 写代码时先看看项目是否有基础组件或者是增强组件，不要一上来就是手搓，特别是button组件。还有就是要看看有没有对应的`hook`或者`utils`，不要自己手写，比如同时支持受控和非受控，直接用项目的`use-controllable-state.ts`就行了，比如遍历树直接用`utils`里面的`traverseTree`方法就行了，不是都要手写的，并且在写的过程中如果觉得这个时比较通用的，可以写到通用的`hook`或者`utils`里面去，而不是每次都去自己手写。

- 写的代码注意看`react`的版本号，项目是基于`react19`以上的，不要写一些过时的代码，比如`fowardRef`,在`react19`已经被标记不推荐使用了，其他的一些`hook api`，`react19`更新了很多，能用上的尽量用。还有`react`的`api`，都解构出来用，不要代码里面一大堆`React.useState`这种，直接`import {useState} from 'react'`;

- 多组件组合成一个组件时，需要注意有容器组件和逻辑组件。容器组件里面不要有很合业务逻辑，只是组装各个逻辑组件，转发兄弟逻辑组件的`prop`等。逻辑组件才是实际写业务逻辑和`ui`的组件，如果代码复杂，我更建议，逻辑组件还可以划分为 逻辑`hook`和`ui`展示，每个逻辑组件包含一个或多个`hook`,并且`hook`命名都是`use-xxx`而不是随便起个名，然后在`ui`上使用，而不是跟`ui`写在一堆，排查都难。
