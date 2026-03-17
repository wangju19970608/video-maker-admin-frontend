export function formatAmount(value) {
  return Number(value || 0).toFixed(2);
}

export function statusLabel(status) {
  const map = {
    pending: "待支付",
    paid: "已支付",
    cancelled: "已取消"
  };
  return map[status] || status || "-";
}
