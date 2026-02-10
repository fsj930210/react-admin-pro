// import { useState } from 'react';

// import { Popover } from 'antd';

// import RaIcon from '../..';
// import IconView from '../IconView';

// import styles from './index.module.css';

// type IconSelectProps = {
//   value?: string;
//   defaultValue?: string;
//   onChange?: (value: string) => void;
// };
// const IconSelect = (props: IconSelectProps) => {
//   const [value, setValue] = useState(props.value || '');
//   const [open, setOpen] = useState(false);
//   return (
//     <Popover
//       title="选择图标"
//       content={
//         <IconView
//           {...props}
//           onChange={(v) => {
//             setOpen(false);
//             setValue(v);
//             props.onChange?.(v);
//           }}
//         />
//       }
//       trigger={['click']}
//       styles={{
//         root: {
//           width: 480,
//           height: 600,
//         },
//         body: {
//           height: '100%',
//           display: 'flex',
//           flexDirection: 'column',
//         },
//       }}
//       classNames={{
//         root: styles['icon-select'],
//       }}
//       open={open}
//       onOpenChange={(v) => setOpen(v)}
//     >
//       <div className={styles['icon-select-input']}>
//         {value ? (
//           <span className="flex items-center w-full">
//             <span>已选择：</span>
//             <span
//               title={value}
//               className="leading-none text-[24px] w-[1em] h-[1em] mr-2"
//             >
//               <RaIcon icon={value} fontSize={24} />
//             </span>
//             <span className="text-[14px]">{value}</span>
//           </span>
//         ) : (
//           <span className="c-[var(--ant-color-text-placeholder)]">
//             请选择Icon
//           </span>
//         )}
//       </div>
//     </Popover>
//   );
// };

// export default IconSelect;
