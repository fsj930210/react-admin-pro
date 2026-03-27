import { Button } from "@rap/components-base/button";
import { Checkbox } from "@rap/components-base/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@rap/components-base/dialog";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
} from "@rap/components-base/field";
import { Input } from "@rap/components-base/input";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@rap/components-base/pagination";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@rap/components-base/popover";
import { ScrollArea } from "@rap/components-base/scroll-area";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@rap/components-base/select";
import { Separator } from "@rap/components-base/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@rap/components-base/sheet";
import { Textarea } from "@rap/components-base/textarea";
import { KeepAlive } from "@rap/components-ui/keep-alive";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/(layouts)/features/keep-alive/")({
	component: KeepAliveFeaturePage,
});

function FormBlock() {
	return (
		<div className="w-full max-w-md">
			<form>
				<FieldGroup>
					<FieldSet>
						<FieldLegend>Payment Method</FieldLegend>
						<FieldDescription>All transactions are secure and encrypted</FieldDescription>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="checkout-7j9-card-name-43j">Name on Card</FieldLabel>
								<Input id="checkout-7j9-card-name-43j" placeholder="Evil Rabbit" required />
							</Field>
							<Field>
								<FieldLabel htmlFor="checkout-7j9-card-number-uw1">Card Number</FieldLabel>
								<Input
									id="checkout-7j9-card-number-uw1"
									placeholder="1234 5678 9012 3456"
									required
								/>
								<FieldDescription>Enter your 16-digit card number</FieldDescription>
							</Field>
							<div className="grid grid-cols-3 gap-4">
								<Field>
									<FieldLabel htmlFor="checkout-exp-month-ts6">Month</FieldLabel>
									<Select defaultValue="">
										<SelectTrigger id="checkout-exp-month-ts6">
											<SelectValue placeholder="MM" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectItem value="01">01</SelectItem>
												<SelectItem value="02">02</SelectItem>
												<SelectItem value="03">03</SelectItem>
												<SelectItem value="04">04</SelectItem>
												<SelectItem value="05">05</SelectItem>
												<SelectItem value="06">06</SelectItem>
												<SelectItem value="07">07</SelectItem>
												<SelectItem value="08">08</SelectItem>
												<SelectItem value="09">09</SelectItem>
												<SelectItem value="10">10</SelectItem>
												<SelectItem value="11">11</SelectItem>
												<SelectItem value="12">12</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
								</Field>
								<Field>
									<FieldLabel htmlFor="checkout-7j9-exp-year-f59">Year</FieldLabel>
									<Select defaultValue="">
										<SelectTrigger id="checkout-7j9-exp-year-f59">
											<SelectValue placeholder="YYYY" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectItem value="2024">2024</SelectItem>
												<SelectItem value="2025">2025</SelectItem>
												<SelectItem value="2026">2026</SelectItem>
												<SelectItem value="2027">2027</SelectItem>
												<SelectItem value="2028">2028</SelectItem>
												<SelectItem value="2029">2029</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
								</Field>
								<Field>
									<FieldLabel htmlFor="checkout-7j9-cvv">CVV</FieldLabel>
									<Input id="checkout-7j9-cvv" placeholder="123" required />
								</Field>
							</div>
						</FieldGroup>
					</FieldSet>
					<FieldSet>
						<FieldLegend>Billing Address</FieldLegend>
						<FieldDescription>
							The billing address associated with your payment method
						</FieldDescription>
						<FieldGroup>
							<Field orientation="horizontal">
								<Checkbox id="checkout-7j9-same-as-shipping-wgm" defaultChecked />
								<FieldLabel htmlFor="checkout-7j9-same-as-shipping-wgm" className="font-normal">
									Same as shipping address
								</FieldLabel>
							</Field>
						</FieldGroup>
					</FieldSet>
					<FieldSet>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="checkout-7j9-optional-comments">Comments</FieldLabel>
								<Textarea
									id="checkout-7j9-optional-comments"
									placeholder="Add any additional comments"
									className="resize-none"
								/>
							</Field>
						</FieldGroup>
					</FieldSet>
				</FieldGroup>
			</form>
		</div>
	);
}
function ScrollBlock() {
	return (
		<div className="w-100 h-100 overflow-auto bg-muted p-2">
			{Array.from({ length: 100 }, (_, index) => (
				// biome-ignore lint:suspicious/noArrayIndexKey
				<div key={index} className="h-10 bg-mute-200">
					item-{index}
				</div>
			))}
		</div>
	);
}
function PaginationBlock() {
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [totalItems] = useState(100);
	const [jumpPage, setJumpPage] = useState("");

	const totalPages = Math.ceil(totalItems / pageSize);

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	const handlePageSizeChange = (size: number) => {
		setPageSize(size);
		setCurrentPage(1); // Reset to first page when changing page size
	};

	const handleJump = () => {
		const page = parseInt(jumpPage, 10);
		if (!Number.isNaN(page)) {
			handlePageChange(page);
			setJumpPage("");
		}
	};

	const generatePaginationItems = () => {
		const items = [];
		let startPage = Math.max(1, currentPage - 2);
		const endPage = Math.min(totalPages, startPage + 4);

		if (endPage === totalPages) {
			startPage = Math.max(1, endPage - 4);
		}

		items.push(
			<PaginationItem key="prev">
				<PaginationPrevious
					onClick={(e) => {
						e.preventDefault();
						handlePageChange(currentPage - 1);
					}}
					aria-disabled={currentPage === 1}
					className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
				/>
			</PaginationItem>,
		);

		// First page if not in visible range
		if (startPage > 1) {
			items.push(
				<PaginationItem key="first">
					<PaginationLink
						onClick={(e) => {
							e.preventDefault();
							handlePageChange(1);
						}}
					>
						1
					</PaginationLink>
				</PaginationItem>,
			);

			if (startPage > 2) {
				items.push(
					<PaginationItem key="ellipsis-start">
						<PaginationEllipsis />
					</PaginationItem>,
				);
			}
		}

		// Visible page numbers
		for (let i = startPage; i <= endPage; i++) {
			items.push(
				<PaginationItem key={i}>
					<PaginationLink
						onClick={(e) => {
							e.preventDefault();
							handlePageChange(i);
						}}
						isActive={i === currentPage}
					>
						{i}
					</PaginationLink>
				</PaginationItem>,
			);
		}

		// Last page if not in visible range
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				items.push(
					<PaginationItem key="ellipsis-end">
						<PaginationEllipsis />
					</PaginationItem>,
				);
			}

			items.push(
				<PaginationItem key="last">
					<PaginationLink
						onClick={(e) => {
							e.preventDefault();
							handlePageChange(totalPages);
						}}
					>
						{totalPages}
					</PaginationLink>
				</PaginationItem>,
			);
		}

		// Next button
		items.push(
			<PaginationItem key="next">
				<PaginationNext
					onClick={(e) => {
						e.preventDefault();
						handlePageChange(currentPage + 1);
					}}
				/>
			</PaginationItem>,
		);

		return items;
	};

	return (
		<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
			<div className="flex items-center gap-2">
				<span>共 {totalItems} 条</span>
			</div>

			<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
				<div className="flex items-center gap-2">
					<span>每页显示：</span>
					<Select
						value={pageSize.toString()}
						onValueChange={(value) => handlePageSizeChange(parseInt(value, 10))}
					>
						<SelectTrigger className="w-24">
							<SelectValue placeholder="每页条数" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="5">5条</SelectItem>
								<SelectItem value="10">10条</SelectItem>
								<SelectItem value="20">20条</SelectItem>
								<SelectItem value="50">50条</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center gap-4">
					<Pagination className="justify-start flex-1 w-auto">
						<PaginationContent>{generatePaginationItems()}</PaginationContent>
					</Pagination>

					<div className="flex items-center gap-2 text-sm">
						<span>跳转到：</span>
						<Input
							type="number"
							min="1"
							max={totalPages}
							value={jumpPage}
							onChange={(e) => setJumpPage(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleJump();
								}
							}}
							className="w-20"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

function DialogBlock() {
	return (
		<KeepAlive cacheKey="dialog-block-components">
			<Dialog>
				<DialogTrigger asChild>
					<Button>Open Dialog</Button>
				</DialogTrigger>

				<DialogContent className="w-250 max-w-250! overflow-hidden">
					<DialogHeader>
						<DialogTitle>Dialog with All Components</DialogTitle>
						<DialogDescription>
							This dialog contains form, pagination, and scroll components
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-8 h-150 overflow-y-auto">
						<section className="flex flex-col items-center">
							<h3 className="text-lg font-semibold mb-4">Payment Form</h3>
							<FormBlock />
						</section>
						<Separator className="my-6" />
						<section className="flex flex-col items-center">
							<h3 className="text-lg font-semibold mb-4">Pagination</h3>
							<PaginationBlock />
						</section>
						<Separator className="my-6" />
						<section className="flex flex-col items-center">
							<h3 className="text-lg font-semibold mb-4">Scrollable Content</h3>
							<ScrollBlock />
						</section>
					</div>
				</DialogContent>
			</Dialog>
		</KeepAlive>
	);
}


function PopoverBlock() {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button>Open Popover</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[700px] h-[80vh]">
				<PopoverHeader>
					<PopoverTitle>Popover with All Components</PopoverTitle>
					<PopoverDescription>
						This popover contains form, pagination, and scroll components
					</PopoverDescription>
				</PopoverHeader>
				<ScrollArea className="h-[calc(80vh-140px)] pr-4">
					<div className="space-y-8 pb-4">
						<section>
							<h3 className="text-lg font-semibold mb-4">Payment Form</h3>
							<FormBlock />
						</section>
						<Separator className="my-6" />
						<section>
							<h3 className="text-lg font-semibold mb-4">Pagination</h3>
							<PaginationBlock />
						</section>
						<Separator className="my-6" />
						<section>
							<h3 className="text-lg font-semibold mb-4">Scrollable Content</h3>
							<ScrollBlock />
						</section>
					</div>
				</ScrollArea>
			</PopoverContent>
		</Popover>
	);
}


function SheetBlock() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button>Open Sheet</Button>
			</SheetTrigger>
			<SheetContent className="w-[700px] h-[85vh]">
				<SheetHeader>
					<SheetTitle>Sheet with All Components</SheetTitle>
					<SheetDescription>
						This sheet contains form, pagination, and scroll components
					</SheetDescription>
				</SheetHeader>
				<ScrollArea className="h-[calc(85vh-140px)] pr-4">
					<div className="space-y-8 pb-4">
						<section>
							<h3 className="text-lg font-semibold mb-4">Payment Form</h3>
							<FormBlock />
						</section>
						<Separator className="my-6" />
						<section>
							<h3 className="text-lg font-semibold mb-4">Pagination</h3>
							<PaginationBlock />
						</section>
						<Separator className="my-6" />
						<section>
							<h3 className="text-lg font-semibold mb-4">Scrollable Content</h3>
							<ScrollBlock />
						</section>
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}

function KeepAliveFeaturePage() {
	return (
		<div className="size-full p-6 space-y-8">
			<div className="flex flex-col space-y-4">
				<h1 className="text-2xl font-bold">Keep Alive Feature</h1>
				<p className="text-muted-foreground">
					This page demonstrates the keep-alive feature with both standalone components and
					components in containers.
				</p>
			</div>
			<div className="border rounded-lg p-6">
				<h2 className="text-xl font-semibold mb-6">Components in Containers</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="border rounded-lg p-4">
						<h3 className="text-lg font-semibold mb-4">Dialog</h3>
						<DialogBlock />
					</div>

					<div className="border rounded-lg p-4">
						<h3 className="text-lg font-semibold mb-4">Popover</h3>
						<PopoverBlock />
					</div>

					<div className="border rounded-lg p-4">
						<h3 className="text-lg font-semibold mb-4">Sheet</h3>
						<SheetBlock />
					</div>
				</div>
			</div>
			<div className="border rounded-lg p-6">
				<h2 className="text-xl font-semibold mb-6">Standalone Components</h2>
				<div className="space-y-8">
					<FormBlock />
					<section className="p-8">
						<PaginationBlock />
					</section>
					<ScrollBlock />
				</div>
			</div>
		</div>
	);
}
