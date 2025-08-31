export function ClassicTabs({
  tabs,
}: {
  tabs: {
    label: string;
    value: string;
  }[];
}) {
  return (
    <div className="flex items-center justify-center">
      {tabs.map((tab) => (
        <div key={tab.value} className="mr-2">
          <div className="text-sm font-medium">{tab.label}</div>
        </div>
      ))}
    </div>
  );
}
