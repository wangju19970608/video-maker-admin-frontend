export function flattenMenus(nodes, level = 0) {
  const list = [];
  (nodes || []).forEach((node) => {
    list.push({ ...node, indent: "-".repeat(level) });
    if (node.children?.length) {
      list.push(...flattenMenus(node.children, level + 1));
    }
  });
  return list;
}

export function collectPermissionKeys(nodes) {
  const set = new Set();
  const walk = (items) => {
    (items || []).forEach((item) => {
      if (item.permissionKey) {
        set.add(item.permissionKey);
      }
      if (item.children?.length) {
        walk(item.children);
      }
    });
  };
  walk(nodes || []);
  return Array.from(set);
}
