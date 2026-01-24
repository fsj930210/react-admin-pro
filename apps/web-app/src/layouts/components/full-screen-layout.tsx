import { Content } from "./shared/content"

const FullScreenLayout = () => {
  return (
    <div className="flex h-full bg-zinc-50 dark:bg-zinc-950">
      <Content className="p-0">
        <div className="h-full w-full">
          {/* 全屏页面内容将在这里渲染 */}
        </div>
      </Content>
    </div>
  )
}

export default FullScreenLayout