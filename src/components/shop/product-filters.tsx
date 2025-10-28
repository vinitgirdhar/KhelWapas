
'use client';

/**
 * @deprecated This component is no longer in use as of the redesign on 2024-07-26.
 * The filtering logic has been moved into the sheet component on the shop pages.
 * This file can be safely removed in a future cleanup.
 */
export default function ProductFilters() {
  return (
    <div className="flex flex-col gap-6 p-6 bg-card rounded-lg border">
      <div className="flex justify-between items-center">
        <h3 className="font-headline text-xl font-semibold text-muted-foreground">Filters (Deprecated)</h3>
      </div>
      <p className="text-sm text-muted-foreground">This component is no longer used.</p>
    </div>
  );
}
