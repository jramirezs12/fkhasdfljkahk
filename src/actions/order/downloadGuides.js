export const downloadGuides = (zipBase64, orderNumber) => {
  const byteCharacters = atob(zipBase64);
  const byteArray = new Uint8Array(
    [...byteCharacters].map((c) => c.charCodeAt(0))
  );

  const blob = new Blob([byteArray], { type: "application/zip" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `guias_order_${orderNumber}.zip`;
  a.click();

  URL.revokeObjectURL(url);
};