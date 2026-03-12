export default function Page({
  searchParams,
}: {
  searchParams: { m?: string };
}) {
  return (
    <div className="min-h-screen grid place-items-center">
      Error 500 caused by {searchParams.m}
    </div>
  );
}
