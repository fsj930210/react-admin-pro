import {
  BasicDialog,
  Dialog,
  MinimaxDialog,
  MovableDialog,
  ResizableDialog,
} from "@rap/components-pro/dialog";
import { Button } from "@rap/components-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@rap/components-ui/card";
import { DialogDescription, DialogTitle } from "@rap/components-ui/dialog";
import { createFileRoute } from "@tanstack/react-router";
import { Maximize2, Move, Plus, Scaling, Square } from "lucide-react";
import { type ReactNode } from "react";

export const Route = createFileRoute("/(layouts)/components/dialog/")({
  component: DialogComponentPage,
});

function DemoCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}

function BasicDialogDemo() {
  return (
    <DemoCard
      title="Basic Dialog"
      description="普通弹窗能力，适合信息确认、表单编辑和轻量工作流。"
      footer={<span className="text-sm text-muted-foreground">默认使用基础 Dialog 交互。</span>}
    >
      <BasicDialog
        triggerChildren={
          <Button>
            <Plus className="mr-2 size-4" />
            打开 Dialog
          </Button>
        }
        header={
          <>
            <DialogTitle>基础 Dialog</DialogTitle>
            <DialogDescription>用于展示确认内容、编辑入口或简单说明。</DialogDescription>
          </>
        }
        okText="确定"
        cancelText="取消"
      >
        <div className="py-4 text-sm leading-relaxed">
          Dialog 默认带底部操作区，API 使用 okText、cancelText、onOk、onCancel 这类习惯命名。
        </div>
      </BasicDialog>
    </DemoCard>
  );
}

function MovableDialogDemo() {
  return (
    <DemoCard title="Movable Dialog" description="标题栏可拖动，关闭后位置会重置。">
      <MovableDialog
        triggerChildren={
          <Button variant="outline">
            <Move className="mr-2 size-4" />
            打开可移动 Dialog
          </Button>
        }
        header={<DialogTitle>拖动标题栏移动</DialogTitle>}
      >
        <div className="space-y-2 py-4 text-sm leading-relaxed">
          <p>这个组件只关注移动能力，适合需要单独演示或组合移动交互的场景。</p>
          <p>拖动标题区域即可移动弹窗。</p>
        </div>
      </MovableDialog>
    </DemoCard>
  );
}

function ResizableDialogDemo() {
  return (
    <DemoCard title="Resizable Dialog" description="边缘和角落可以拖拽调整弹窗尺寸。">
      <ResizableDialog
        triggerChildren={
          <Button variant="outline">
            <Scaling className="mr-2 size-4" />
            打开可调整 Dialog
          </Button>
        }
        header={<DialogTitle>拖拽边缘调整尺寸</DialogTitle>}
        resizeOptions={{
          minSize: { width: 360, height: 220 },
          maxSize: { width: 860, height: 620 },
        }}
        width={560}
      >
        <div className="space-y-2 py-4 text-sm leading-relaxed">
          <p>拖动弹窗四边或四角，可以调整内容区域尺寸。</p>
          <p>通过 resizeOptions 控制最小和最大尺寸。</p>
        </div>
      </ResizableDialog>
    </DemoCard>
  );
}

function FullDialogDemo() {
  return (
    <DemoCard
      title="Dialog"
      description="完整 Dialog 通过 features 属性组合移动、调整尺寸、最小化和最大化。"
    >
      <Dialog
        triggerChildren={
          <Button variant="secondary">
            <Maximize2 className="mr-2 size-4" />
            打开完整 Dialog
          </Button>
        }
        features={{
          movable: true,
          resizable: true,
          minimizable: true,
          maximizable: true,
        }}
        actions={{
          close: true,
          minimize: true,
          maximize: true,
        }}
        minimizedBar={{
          draggable: true,
          initialPosition: { right: 100, bottom: 60 },
        }}
        header={
          <>
            <DialogTitle>完整 Dialog</DialogTitle>
            <DialogDescription>一个入口覆盖常用后台弹窗能力。</DialogDescription>
          </>
        }
        okText="保存"
        cancelText="取消"
      >
        <div className="space-y-2 py-4 text-sm leading-relaxed">
          <p>用户只需要配置 features 和 actions，就能打开需要的能力。</p>
          <p>这个版本支持拖动、缩放、最小化、最大化和关闭。</p>
        </div>
      </Dialog>
    </DemoCard>
  );
}

function MinimaxDialogDemo() {
  return (
    <DemoCard title="MinimaxDialog" description="只聚焦最小化和最大化的单特性 Dialog。">
      <MinimaxDialog
        triggerChildren={
          <Button variant="outline">
            <Square className="mr-2 size-4" />
            打开 MinimaxDialog
          </Button>
        }
        header={<DialogTitle>最小化 / 最大化</DialogTitle>}
        minimizedBar={{
          draggable: true,
          initialPosition: { right: 120, bottom: 80 },
        }}
      >
        <div className="space-y-2 py-4 text-sm leading-relaxed">
          <p>这个组件适合单独使用最小化、最大化能力。</p>
          <p>最小化后底部条可以恢复、最大化或关闭。</p>
        </div>
      </MinimaxDialog>
    </DemoCard>
  );
}

function DialogComponentPage() {
  return (
    <div className="size-full space-y-6 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Dialog Components</h2>
        <p className="text-sm text-muted-foreground">
          Dialog provides focused wrappers and a complete feature-configurable component.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BasicDialogDemo />
        <MovableDialogDemo />
        <ResizableDialogDemo />
        <FullDialogDemo />
        <MinimaxDialogDemo />
      </div>
    </div>
  );
}
