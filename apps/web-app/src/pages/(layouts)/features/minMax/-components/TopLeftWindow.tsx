// import { useState } from "react";
// import { useMinMaxClose } from "@rap/hooks/use-minMax";
// import { useMove } from "@rap/hooks/use-move";
// import { Minus, Square, Maximize2, X } from "lucide-react";

// export function TopLeftWindow() {
//   const [position, setPosition] = useState({ x: 200, y: 200 });
//   const [size, setSize] = useState({ width: 420, height: 320 });
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
//     'top-left',
//     220,
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
//         <h3 className="font-medium text-gray-700">左上角最小化</h3>
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
//       <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 flex items-center justify-between">
//         <span className="font-medium select-none">左上角最小化</span>
//         <div className="flex space-x-2">
//           <button
//             onClick={toggleMinimize}
//             className="p-1 hover:bg-orange-700 rounded transition-colors"
//             title="最小化"
//           >
//             <Minus size={16} />
//           </button>
//           <button
//             onClick={toggleMaximize}
//             className="p-1 hover:bg-orange-700 rounded transition-colors"
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
//         <p className="text-gray-700">最小化后会显示在左上角。</p>
//         <p className="text-sm text-gray-500 mt-2">宽度较宽，为 220×40。</p>
//         <p className="text-sm text-gray-500 mt-1">支持拖动移动窗口位置（正常模式下）。</p>
//       </div>
//     </div>
//   );
// }
