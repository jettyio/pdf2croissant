export default function VisualLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 top-0 z-50 bg-[#171b35]">
      {children}
    </div>
  );
}
