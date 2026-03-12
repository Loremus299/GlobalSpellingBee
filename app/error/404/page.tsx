export default function Page({
  searchParams,
}: {
  searchParams: { m?: string };
}) {
  return (
    <div className="min-h-screen grid place-items-center">
      Error 404 caused by {searchParams.m}
    </div>
  );
}
