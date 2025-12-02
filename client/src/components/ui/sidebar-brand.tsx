import MacroDashIcon from "@/components/icons/MacroDashIcon";

export default function SidebarBrand() {
  return (
    <a
      href="#/home"
      className="flex items-center gap-2 overflow-hidden px-2 py-1"
    >
      <MacroDashIcon size={36} className="shrink-0" />
      <span className="truncate text-xl font-semibold group-data-[collapsible=icon]/sidebar:hidden">
        MacroDash
      </span>
    </a>
  );
}
