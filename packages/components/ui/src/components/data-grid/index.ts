import { DATA_GRID_EXPAND_COLUMN_ID } from "./features/expand-column";
import { DATA_GRID_SELECTION_COLUMN_ID } from "./features/selection-column";

export { DataGrid } from "./components/data-grid";
export { DataGridColumnToggle } from "./components/column-toggle";
export { Grid, GridCell, GridRow } from "./components/grid";
export { DATA_GRID_EXPAND_COLUMN_ID } from "./features/expand-column";
export { DATA_GRID_SELECTION_COLUMN_ID } from "./features/selection-column";
export type {
  CustomizeComponent,
  CustomizeScrollBody,
  DataGridColumnMeta,
  DataGridColumnOrderingConfig,
  DataGridElementProps,
  DataGridExpandableConfig,
  DataGridFilteringConfig,
  DataGridFilterMeta,
  DataGridFilterOption,
  DataGridPaginationConfig,
  DataGridProps,
  DataGridRowSelectionConfig,
  DataGridScroll,
  DataGridScrollInfo,
  DataGridSortingConfig,
  DataGridSortMeta,
  GridComponents,
} from "./types";

export const DATA_GRID_COLUMN_IDS = {
  expand: DATA_GRID_EXPAND_COLUMN_ID,
  selection: DATA_GRID_SELECTION_COLUMN_ID,
} as const;

export type DataGridBuiltinColumnId =
  (typeof DATA_GRID_COLUMN_IDS)[keyof typeof DATA_GRID_COLUMN_IDS];
