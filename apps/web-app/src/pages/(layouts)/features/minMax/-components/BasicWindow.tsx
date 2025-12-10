// import { useState } from "react";
// import { useMinMaxClose } from "@rap/hooks/use-minMax";
// import { useMove } from "@rap/hooks/use-move";
// import { Minus, Square, Maximize2, X } from "lucide-react";

// export function BasicWindow() {
//   const [position, setPosition] = useState({ x: 50, y: 50 });
//   const [size, setSize] = useState({ width: 400, height: 300 });
//   const [isVisible, setIsVisible] = useState(true);

//   const {
//     isMinimized,
//     isMaximized,
//     toggleMinimize,
//     toggleMaximize,
//     handleClose
//   } = useMinMaxClose(
//     position,
//     setPosition,
//     size,
//     setSize,
//     'bottom-right',
//     200,
//     40,
//     undefined,
//     () => setIsVisible(false)
//   );

//   const {
//     moveRef,
//     isMoving,
//     style: moveStyle,
//     onStart
//   } = useMove({
//     disabled: isMaximized ?? isMinimized,
//     snapToBoundary: true,
//     snapThreshold: 10
//   });

//   const resetWindow = () => {
//     setIsVisible(true);
//   };

//   if (!isVisible) {
//     return (
//       <div className="space-y-2">
//         <h3 className="font-medium text-gray-700">基本窗口</h3>
//         <div className="space-y-1 text-sm">
//           <div>状态: 已关闭</div>
//           <button
//             onClick={resetWindow}
//             className="text-blue-600 hover:text-blue-800"
//           >
//             重新显示
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div
//       ref={moveRef as any}
//       className={`absolute bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 ${
//         isMaximized ? 'z-50' : 'z-10'
//       } ${isMoving ? 'cursor-grabbing' : ''}`}
//       style={{
//         ...moveStyle,
//         left: isMaximized ? '0px' : undefined,
//         top: isMaximized ? '0px' : undefined,
//         width: isMaximized ? '100vw' : undefined,
//         height: isMaximized ? '100vh' : undefined
//       }}
//       onMouseDown={onStart}
//     >
//       <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 flex items-center justify-between">
//         <span className="font-medium select-none">基本窗口</span>
//         <div className="flex space-x-2">
//           <button
//             onClick={toggleMinimize}
//             className="p-1 hover:bg-blue-700 rounded transition-colors"
//             title="最小化"
//           >
//             <Minus size={16} />
//           </button>
//           <button
//             onClick={toggleMaximize}
//             className="p-1 hover:bg-blue-700 rounded transition-colors"
//             title={isMaximized ? "还原" : "最大化"}
//           >
//             {isMaximized ? <Square size={16} /> : <Maximize2 size={16} />}
//           </button>
//           <button
//             onClick={handleClose}
//             className="p-1 hover:bg-red-600 rounded transition-colors"
//             title="关闭"
//           >
//             <X size={16} />
//           </button>
//         </div>
//       </div>
//       <div className="p-4">
//         <p className="text-gray-700">这是一个基本窗口示例。</p>
//         <p className="text-sm text-gray-500 mt-2">最小化后会变成右下角的长条。</p>
//         <p className="text-sm text-gray-500 mt-1">可以拖动窗口位置（正常模式下）。</p>
//       </div>
//     </div>
//   );
// }
