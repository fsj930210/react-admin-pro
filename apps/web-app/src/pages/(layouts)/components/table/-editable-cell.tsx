import { DataGrid } from "@rap/components-pro/data-grid";
import { Button } from "@rap/components-ui/button";
import { Calendar } from "@rap/components-ui/calendar";
import { Input } from "@rap/components-ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@rap/components-ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@rap/components-ui/select";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarIcon } from "lucide-react";
import {
	createContext,
	type Dispatch,
	type KeyboardEvent,
	type SetStateAction,
	use,
	useCallback,
	useMemo,
	useState,
} from "react";
import { DemoTitle } from "./-basic";
import { createDemoUsers, type DemoUser } from "./-demo-data";

type EditableField = "name" | "email" | "age" | "department" | "status" | "joinDate" | "score";
type EditableValue = DemoUser[EditableField];
type EditorType = "text" | "number" | "select" | "date";

interface EditableColumnConfig {
	field: EditableField;
	header: string;
	size: number;
	editor: EditorType;
	options?: readonly string[];
}

interface EditableCellContextValue {
	editing: string | null;
	setEditing: Dispatch<SetStateAction<string | null>>;
	updateCell: (recordId: string, field: EditableField, value: EditableValue) => void;
}

interface EditableCellProps {
	config: EditableColumnConfig;
	editKey: string;
	recordId: string;
	value: EditableValue;
}

const editableColumns = [
	{ field: "name", header: "Name", size: 160, editor: "text" },
	{ field: "email", header: "Email", size: 240, editor: "text" },
	{ field: "age", header: "Age", size: 90, editor: "number" },
	{
		field: "department",
		header: "Department",
		size: 160,
		editor: "select",
		options: ["Engineering", "Product", "Design", "Operations"],
	},
	{
		field: "status",
		header: "Status",
		size: 130,
		editor: "select",
		options: ["active", "vacation", "left", "probation"],
	},
	{ field: "joinDate", header: "Join Date", size: 140, editor: "date" },
	{ field: "score", header: "Score", size: 110, editor: "number" },
] satisfies EditableColumnConfig[];
const EditableCellContext = createContext<EditableCellContextValue | null>(null);

function useEditableCellContext() {
	const context = use(EditableCellContext);
	if (!context) {
		throw new Error("EditableCellContext is missing.");
	}
	return context;
}

function parseDateString(value: string) {
	const [year, month, day] = value.split("-").map(Number);
	return new Date(year, month - 1, day);
}

function formatDate(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function EditableCell({ config, editKey, recordId, value }: EditableCellProps) {
	const { editing, setEditing, updateCell } = useEditableCellContext();
	const { editor, field, options } = config;

	if (editing !== editKey) {
		return value;
	}

	const commit = (nextValue: string) => {
		const parsedValue = editor === "number" ? Number(nextValue) : nextValue;
		updateCell(recordId, field, parsedValue);
		setEditing(null);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			event.currentTarget.blur();
		}
		if (event.key === "Escape") {
			setEditing(null);
		}
	};

	if (editor === "select") {
		return (
			<Select
				defaultOpen
				defaultValue={String(value)}
				onOpenChange={(open) => {
					if (!open) {
						setEditing(null);
					}
				}}
				onValueChange={commit}
			>
				<SelectTrigger className="h-8 w-full" size="sm">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{options?.map((option) => (
						<SelectItem key={option} value={option}>
							{option}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		);
	}

	if (editor === "date") {
		return (
			<Popover
				defaultOpen
				onOpenChange={(open) => {
					if (!open) {
						setEditing(null);
					}
				}}
			>
				<PopoverTrigger asChild>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="h-8 w-full justify-start px-2 font-normal"
					>
						<CalendarIcon className="size-4" />
						{String(value)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={parseDateString(String(value))}
						onSelect={(date) => {
							if (date) {
								commit(formatDate(date));
							}
						}}
					/>
				</PopoverContent>
			</Popover>
		);
	}

	return (
		<Input
			autoFocus
			className="h-8 w-full"
			type={editor === "number" ? "number" : "text"}
			defaultValue={String(value)}
			onBlur={(event) => commit(event.target.value)}
			onKeyDown={handleKeyDown}
		/>
	);
}

function editableColumn(config: EditableColumnConfig): ColumnDef<DemoUser> {
	return {
		id: config.field,
		accessorKey: config.field,
		header: config.header,
		size: config.size,
		cell: ({ row, getValue }) => (
			<EditableCell
				config={config}
				editKey={`${row.id}:${config.field}`}
				recordId={row.original.id}
				value={getValue<EditableValue>()}
			/>
		),
	};
}

export function EditableCellDataGridDemo() {
	const [data, setData] = useState(() => createDemoUsers(8));
	const [editing, setEditing] = useState<string | null>(null);
	const updateCell = useCallback((recordId: string, field: EditableField, value: EditableValue) => {
		setData((previous) =>
			previous.map((item) => (item.id === recordId ? { ...item, [field]: value } : item)),
		);
	}, []);
	const contextValue = useMemo(() => ({ editing, setEditing, updateCell }), [editing, updateCell]);
	const columns = useMemo<ColumnDef<DemoUser>[]>(
		() => editableColumns.map((column) => editableColumn(column)),
		[],
	);

	return (
		<EditableCellContext value={contextValue}>
			<section className="space-y-3">
				<DemoTitle
					title="Editable cells"
					description="Double-click cells to edit text, number, select, and date fields."
				/>
				<DataGrid
					rowKey="id"
					columns={columns}
					data={data}
					pagination={false}
					border
					onCell={(_record, _index, ctx) => {
						const editKey = `${ctx.row.id}:${ctx.column.id}`;
						return {
							className: editing === editKey ? "p-1" : undefined,
							onDoubleClick: () => setEditing(editKey),
						};
					}}
				/>
			</section>
		</EditableCellContext>
	);
}
