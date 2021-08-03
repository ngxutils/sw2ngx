import { pascalCase } from 'change-case';

export function methodNameParser(uri: string, type: string, id = ''): string {
  if (id !== '') {
    return id;
  }
  const tmp = pascalCase(uri.replace(/\//gi, '-').replace(/\{|\}|\$/gi, ''));
  switch (type.toLocaleLowerCase()) {
    case 'post':
      return 'send' + tmp;
    case 'delete':
      return 'delete' + tmp;
    case 'put':
      return 'update' + tmp;
    case 'get':
    default:
      return 'get' + tmp;
  }
}
