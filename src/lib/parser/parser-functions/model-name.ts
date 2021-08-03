const modelsNameMap = new Map<string, string>();

export function modelNameParser(name: string): string {
  if (modelsNameMap.has(name)) {
    return modelsNameMap.get(name) || name;
  }
  const typeName = name.split('/').pop() || name;
  modelsNameMap.set(name, typeName);
  return typeName;
}
