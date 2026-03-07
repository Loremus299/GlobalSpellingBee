export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ m: string }>;
}) {
  const errorObject = await searchParams;

  return (
    <div className="min-h-screen grid place-items-center">
      Error 404 caused by {errorObject.m}
    </div>
  );
}
