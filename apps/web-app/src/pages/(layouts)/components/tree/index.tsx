import { Button } from "@rap/components-base/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rap/components-base/tabs";
import {
	DraggableTree as DraggableTreeComponent,
	Tree,
	TreeCheckbox,
	TreeExpandIcon,
	TreeItem,
	TreeLabel,
	VirtualizedTree,
} from "@rap/components-base/tree";
import {
	asyncLoaderFeature,
	checkableFeature,
	expandableFeature,
	selectableFeature,
} from "@rap/components-base/tree/features";
import type { TreeItemInstance, TreeNode } from "@rap/components-base/tree/types";
import { useCopyToClipboard } from "@rap/hooks/use-copy-to-clipboard";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/(layouts)/components/tree/")({
	component: TreeComponentPage,
});

const dig = (path = "root", level = 1, childCount = 2) => {
	const treeNode: TreeNode = {
		label: path === "root" ? "Root" : path,
		key: path,
	};

	if (level > 0) {
		treeNode.children = [];
		for (let i = 0; i < childCount; i += 1) {
			const childKey = `${path}-${i}`;
			treeNode.children.push(dig(childKey, level - 1, childCount));
		}
	}

	return treeNode;
};

const CodeBlock = ({ code }: { code: string }) => {
	const { copyToClipboard, isCopied } = useCopyToClipboard();

	return (
		<div className="relative bg-muted rounded-md overflow-hidden">
			<Button
				variant="ghost"
				size="icon"
				className="absolute top-2 right-2 h-8 w-8"
				onClick={() => copyToClipboard(code)}
				title={isCopied ? "Copied!" : "Copy code"}
			>
				{isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
			</Button>
			<pre className="p-4 overflow-x-auto text-sm">{code}</pre>
		</div>
	);
};

const ExampleContainer = ({
	title,
	preview,
	code,
}: {
	title: string;
	preview: React.ReactNode;
	code: string;
}) => {
	const [activeTab, setActiveTab] = useState("preview");

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold">{title}</h3>
			<Tabs defaultValue="preview" value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="w-fit">
					<TabsTrigger value="preview">Preview</TabsTrigger>
					<TabsTrigger value="code">Code</TabsTrigger>
				</TabsList>
				<TabsContent value="preview" className="border rounded-md p-4">
					{preview}
				</TabsContent>
				<TabsContent value="code" className="mt-2">
					<CodeBlock code={code} />
				</TabsContent>
			</Tabs>
		</div>
	);
};

function BasicTree() {
	const [treeData] = useState(() => {
		const rootNode = dig("root", 2);
		if (rootNode?.children?.[1]) {
			rootNode.children[1].disabled = true;
		}
		return [rootNode];
	});

	return (
		<Tree
			treeData={treeData}
			features={[
				expandableFeature({
					defaultExpandedKeys: ["root"],
					onExpand: (expandedKeys, expandedItems, expandInfo) => {
						console.log(expandedKeys, expandedItems, expandInfo);
					},
				}),
				selectableFeature({
					onSelect: (selectedKeys, selectedItems, selectInfo) => {
						console.log(selectedKeys, selectedItems, selectInfo);
					},
				}),
				checkableFeature({
					onCheck: (checkKeys, checkItems, checkInfo) => {
						console.log(checkKeys, checkItems, checkInfo);
					},
				}),
			]}
		>
			{({ item, draggable, onDragStart, onDragOver, onDrop, onDragEnd }) => (
				<TreeItem key={item.key} item={item}>
					<div
						className="flex items-center w-full h-full"
						draggable={draggable}
						onDragStart={onDragStart}
						onDragOver={onDragOver}
						onDrop={onDrop}
						onDragEnd={onDragEnd}
					>
						<TreeExpandIcon item={item} />
						<TreeCheckbox item={item} />
						<TreeLabel item={item} />
					</div>
				</TreeItem>
			)}
		</Tree>
	);
}

function VirtualTree() {
	const [treeData] = useState(() => [dig("root", 2, 20)]);

	return (
		<VirtualizedTree
			treeData={treeData}
			features={[
				expandableFeature({ defaultExpandedKeys: ["root"] }),
				selectableFeature({}),
				checkableFeature({}),
			]}
			height={400}
		>
			{({ item, indent }) => (
				<TreeItem key={item.key} item={item}>
					<div className="inline-flex items-center" style={{ marginLeft: `${indent}px` }}>
						<TreeExpandIcon item={item} />
						<TreeCheckbox item={item} />
						<TreeLabel item={item} />
					</div>
				</TreeItem>
			)}
		</VirtualizedTree>
	);
}

function DraggableTree() {
	const [treeData, setTreeData] = useState(() => {
		const rootNode = dig("root", 1, 10);
		if (rootNode?.children?.[1]) {
			rootNode.children[1].disabled = true;
		}
		return [rootNode];
	});

	const handleTreeChange = (newTreeData: TreeNode[]) => {
		console.log("Tree data changed:", newTreeData);
		setTreeData(newTreeData);
	};

	const handleDrop = (
		event: React.DragEvent<HTMLElement>,
		item: TreeItemInstance,
		dropInfo: any,
	) => {
		// The dnd-feature already handles the node movement internally
		// onTreeChange will be called with the updated tree data
		console.log("Drop event:", { item, dropInfo });
	};

	return (
		<DraggableTreeComponent
			treeData={treeData}
			features={[
				expandableFeature({
					defaultExpandedKeys: ["root"],
				}),
			]}
			onDrop={handleDrop}
			onTreeChange={handleTreeChange}
		>
			{({ item, draggable, onDragStart, onDragOver, onDrop, onDragEnd }) => (
				<TreeItem key={item.key} item={item}>
					<div
						className="flex items-center w-full h-full"
						draggable={draggable}
						onDragStart={onDragStart}
						onDragOver={onDragOver}
						onDrop={onDrop}
						onDragEnd={onDragEnd}
					>
						<TreeExpandIcon item={item} />
						<TreeCheckbox item={item} />
						<TreeLabel item={item} />
					</div>
				</TreeItem>
			)}
		</DraggableTreeComponent>
	);
}

function AsyncLoadingTree() {
	const [treeData, setTreeData] = useState<TreeNode[]>(() => {
		const rootNode = dig("root", 1);
		if (rootNode.children) {
			rootNode.children.forEach((node) => {
				node.children = [];
			});
		}
		return [rootNode];
	});

	const loadChildren = async (node: TreeNode): Promise<TreeNode[]> => {
		return new Promise((resolve) => {
			setTimeout(() => {
				const childNode = dig(node.key, 1, 5);
				const children = childNode.children ?? [];
				children.forEach((child) => {
					child.children = [];
				});
				setTreeData((prev) => {
					const newTree = [...prev];
					const parent = newTree.find((n) => n.key === node.key);
					if (parent) {
						parent.children = children;
					}
					return newTree;
				});
				resolve(children);
			}, 1000);
		});
	};

	const isLeafCondition = (node: TreeNode): boolean => {
		return !node.children;
	};

	return (
		<Tree
			treeData={treeData}
			height={400}
			features={[
				expandableFeature({ defaultExpandedKeys: ["root"] }),
				selectableFeature({}),
				checkableFeature({}),
				asyncLoaderFeature({ loadChildren }),
			]}
			isLeafCondition={isLeafCondition}
		>
			{({ item }) => {
				return (
					<TreeItem key={item.key} item={item}>
						<div className="inline-flex items-center">
							<TreeExpandIcon item={item} />
							<TreeCheckbox item={item} />
							<TreeLabel item={item} />
							{item.loading && (
								<span className="ml-2 text-sm text-muted-foreground">Loading...</span>
							)}
						</div>
					</TreeItem>
				);
			}}
		</Tree>
	);
}

function TreeComponentPage() {
	return (
		<div className="size-full p-6">
			<h2 className="text-2xl font-bold mb-6">Tree Components</h2>
			<div className="space-y-8">
				<ExampleContainer
					title="1. Basic Tree"
					preview={<BasicTree />}
					code={`import { Tree, TreeCheckbox, TreeExpandIcon, TreeItem, TreeLabel } from "@rap/components-base/tree";
import { checkableFeature, expandableFeature, selectableFeature } from "@rap/components-base/tree/features";
import { useState } from "react";

function BasicTree() {
  const [treeData] = useState(() => {
    const rootNode = dig("root", 2);
    // Add disabled node for demonstration
    if (rootNode?.children?.[1]) {
      rootNode.children[1].disabled = true;
    }
    return [rootNode];
  });
  
  return (
    <Tree
      treeData={treeData}
      height={400}
      features={[
        expandableFeature({ defaultExpandedKeys: ["root"] }),
        selectableFeature({}),
        checkableFeature({}),
      ]}
    >
      {({ item }) => (
        <TreeItem key={item.key} item={item}>
          <div className="inline-flex items-center">
            <TreeExpandIcon item={item} />
            <TreeCheckbox item={item} />
            <TreeLabel item={item} />
          </div>
        </TreeItem>
      )}
    </Tree>
  );
}`}
				/>

				<ExampleContainer
					title="2. Virtual Scrolling Tree"
					preview={<VirtualTree />}
					code={`import { VirtualizedTree, TreeCheckbox, TreeExpandIcon, TreeItem, TreeLabel } from "@rap/components-base/tree";
import { checkableFeature, expandableFeature, selectableFeature } from "@rap/components-base/tree/features";
import { useState } from "react";

const dig = (path = "0", level = 2) => {
  const list = [];
  for (let i = 0; i < 100; i += 1) {
    const key = \`\${path}-\${i}\`;
    const treeNode = {
      label: \`Item \${key}\`,
      key,
    };

    if (level > 0) {
      treeNode.children = dig(key, level - 1);
    }

    list.push(treeNode);
  }
  return list;
};

function VirtualTree() {
  const [treeData] = useState(() => dig());
  
  return (
    <VirtualizedTree
      treeData={treeData}
      features={[
        expandableFeature({ defaultExpandedKeys: ["0"] }),
        selectableFeature({}),
        checkableFeature({}),
      ]}
      height={400}
    >
      {({ item, indent }) => (
        <TreeItem key={item.key} item={item}>
          <div className="inline-flex items-center" style={{ marginLeft: \`\${indent}px\` }}>
            <TreeExpandIcon item={item} />
            <TreeCheckbox item={item} />
            <TreeLabel item={item} />
          </div>
        </TreeItem>
      )}
    </VirtualizedTree>
  );
}`}
				/>

				<ExampleContainer
					title="3. Draggable Tree"
					preview={<DraggableTree />}
					code={`import { VirtualizedTree, TreeCheckbox, TreeExpandIcon, TreeItem, TreeLabel, DropIndicator } from "@rap/components-base/tree";
import { checkableFeature, dndFeature, expandableFeature, selectableFeature } from "@rap/components-base/tree/features";
import { moveNode } from "@rap/components-base/tree/utils.js";
import { useRef, useState } from "react";
import type { DropInfo, TreeInstance, TreeItemInstance, TreeNode } from "@rap/components-base/tree/types";

const dig = (path = "0", level = 1) => {
  const list = [];
  for (let i = 0; i < 5; i += 1) {
    const key = \`\${path}-\${i}\`;
    const treeNode: TreeNode = {
      label: key,
      key,
    };

    if (level > 0) {
      treeNode.children = dig(key, level - 1);
    }

    list.push(treeNode);
  }
  return list;
};

function DraggableTree() {
  const [treeData, setTreeData] = useState<TreeNode[]>(() => dig());
  const [dropInfo, setDropInfo] = useState<DropInfo | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const handleDragStart = (e: React.DragEvent<HTMLElement>, item: TreeItemInstance) => {
    e.stopPropagation();
    const ghost = (e.currentTarget as HTMLElement).cloneNode(true) as HTMLElement;
    ghost.style.position = "fixed";
    ghost.style.left = "-9999px";
    ghost.style.top = "-9999px";
    document.body.appendChild(ghost);
    try {
      e.dataTransfer?.setDragImage(ghost, 0, 0);
    } catch { }
    setTimeout(() => {
      if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
    }, 0);
    item.dragStart?.(e, item);
    setDropInfo(null);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLElement>,
    item: TreeItemInstance,
    indent: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!containerRef.current) return;
    const res = item.dragOver?.(e, containerRef.current, null, indent);
    setDropInfo(res as DropInfo | null);
  };
  
  const handleDrop = (
    e: React.DragEvent<HTMLElement>,
    item: TreeItemInstance,
    tree: TreeInstance,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const draggingKey = tree.getDraggingKey?.();
    if (draggingKey && dropInfo) {
      const newTree = moveNode(
        draggingKey,
        dropInfo.dropTargetKey,
        dropInfo.dropPosition,
        treeData,
      );
      setTreeData(newTree);

      item.dragEnd?.(e, item);
      setDropInfo(null);
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLElement>, item: TreeItemInstance) => {
    e.stopPropagation();
    item.dragEnd?.(e, item);
    setDropInfo(null);
  };
  
  return (
    <div ref={containerRef} className="relative size-full">
      <VirtualizedTree
        treeData={treeData}
        features={[
          expandableFeature({ defaultExpandedKeys: ["0"] }),
          selectableFeature({}),
          checkableFeature({}),
          dndFeature({}),
        ]}
        height={400}
      >
        {({ item, indent, tree }) => (
          <TreeItem key={item.key} item={item}>
            <div
              className="inline-flex items-center"
              onDragStart={(e) => handleDragStart(e, item)}
              onDragOver={(e) => handleDragOver(e, item, indent)}
              onDrop={(e) => handleDrop(e, item, tree)}
              onDragEnd={(e) => handleDragEnd(e, item)}
              draggable
            >
              <TreeExpandIcon item={item} />
              <TreeCheckbox item={item} />
              <TreeLabel item={item} />
            </div>
          </TreeItem>
        )}
      </VirtualizedTree>
      <DropIndicator info={dropInfo ?? undefined} />
    </div>
  );
}`}
				/>

				<ExampleContainer
					title="4. Async Loading Tree"
					preview={<AsyncLoadingTree />}
					code={`import { Tree, TreeCheckbox, TreeItem, TreeLabel } from "@rap/components-base/tree";
import { checkableFeature, expandableFeature, selectableFeature } from "@rap/components-base/tree/features";
import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import type { TreeNode } from "@rap/components-base/tree/types";

// Helper function to generate tree nodes
const dig = (path = "0", level = 1) => {
  const list = [];
  for (let i = 0; i < 10; i += 1) {
    const key = \`\${path}-\${i}\`;
    const treeNode = {
      label: key,
      key,
    };

    if (level > 0) {
      treeNode.children = dig(key, level - 1);
    }

    list.push(treeNode);
  }
  return list;
};

function AsyncLoadingTree() {
  const [treeData, setTreeData] = useState<TreeNode[]>(() => {
    // Generate initial data with dig function
    const rootNode = dig("root", 1);
    // Set empty children for nodes that should load async
    if (rootNode.children) {
      rootNode.children.forEach(node => {
        node.children = [];
      });
    }
    return [rootNode];
  });
  
  // Async load children function
  const loadChildren = async (node: TreeNode): Promise<TreeNode[]> => {
    // Simulate async loading
    return new Promise(resolve => {
      setTimeout(() => {
        // Generate children using dig function
        const childNode = dig(node.key, 1);
        // Get children from the generated node
        const children = childNode.children || [];
        // Set empty children for nested async loading
        children.forEach(child => {
          child.children = [];
        });
        resolve(children);
      }, 1000);
    });
  };
  
  // Custom isLeaf condition to trigger async loading
  // Nodes with empty children are not leaf nodes, so they can trigger async loading
  const isLeafCondition = (node: TreeNode): boolean => {
    // If node has children property, it's not a leaf node (even if children is empty)
    // This allows async loading to be triggered
    return !node.children;
  };
  
  return (
    <Tree
      treeData={treeData}
      height={400}
      features={[
        expandableFeature({ defaultExpandedKeys: ["root"] }),
        selectableFeature({}),
        checkableFeature({}),
        asyncLoaderFeature({ loadChildren }),
      ]}
      isLeafCondition={isLeafCondition}
    >
      {({ item }) => {
        return (
          <TreeItem key={item.key} item={item}>
            <div className="inline-flex items-center">
              <TreeExpandIcon item={item} />
              <TreeCheckbox item={item} />
              <TreeLabel item={item} />
              {item.loading && <span className="ml-2 text-sm text-muted-foreground">Loading...</span>}
            </div>
          </TreeItem>
        );
      }}
    </Tree>
  );
}`}
				/>
			</div>
		</div>
	);
}
