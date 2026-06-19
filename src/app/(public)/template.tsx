export default function PublicTemplate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="route-enter">{children}</div>;
}
