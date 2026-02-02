export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ details: string }>;
}) {
  const sParams = await searchParams;
  return <div>{sParams.details}</div>;
}
