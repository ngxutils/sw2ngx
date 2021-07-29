import { paramCase, pascalCase } from 'change-case';

import { Description } from '../../../types/swagger';

import { SimHash } from './simhash/simhash';

const simHash = new SimHash()

const extractEnumDescription = (description: string) => {
  const result = [];
  const indexOf = description.search(/\(\d/gi);
  if (indexOf !== -1) {
    description = description.substr(indexOf + 1).replace(')', '');
    const temp = description.split(',');
    for (const tmp of temp) {
      const [value, name] = tmp.split('=');
      result.push({
        key: name,
        val: isNaN(Number(value))? value: Number(value)
      });
    }
    return result;
  } else {
    return null;
  }
}

export function mergeDuplicateEnums(enumsMap: Sw2NgxEnum[], insertEnum: Sw2NgxEnum): string {
  const withParentName = `${pascalCase(
    paramCase(insertEnum.modelName).replace(/^i-/gi, '') + '-' + paramCase(insertEnum.name + 'Set')
  )}`;
  const duplicate = enumsMap.filter(
    (x) => x.name.replace(/\d+$/gi, '') === insertEnum.name
  );
  const extDuplicate = enumsMap.filter(
    (x) => x.name.replace(/\d+$/gi, '') === withParentName
  );
  if (duplicate.length > 0) {
    const equals = duplicate.filter((x) => {if(x.hash === insertEnum.hash){
      const p = x.value.map(x=> x.key).sort().join('|')
      const f = insertEnum.value.map(x=> x.key).sort().join('|')
      return p === f
    }
      return false
    });
    if (equals.length === 0)  {
      if (extDuplicate.length > 0) {
        insertEnum.name = `${withParentName}${duplicate.length}`;
      } else {
        insertEnum.name = withParentName;
      }
    }
  }
  enumsMap.push(insertEnum)
  return insertEnum.name
}

export function resolveEnumFn(
  description: Description | undefined,
  enumValue: [unknown, ...unknown[]],
  currentName: string,
  modelName: string
): Sw2NgxEnum  {

  const extractedEnum = extractEnumDescription(description ? description : '');
  const hashName = simHash.hash(enumValue.join('|'));

  if (extractedEnum === null) {
    const numbers = '1234567890'.split('');
    if (
      enumValue
        .join('')
        .split('')
        .filter((x) => !numbers.includes(x)).length > 0
    ) {
      return {
        name: '( ' + enumValue.map((x) => `'${x}'`).join(' | ') + ' )',
        value: [],
        modelName: modelName,
        hash: hashName,
        isPremitive: true
      };
    }
    return {
      name: '( ' + enumValue.join(' | ') + ' )',
      value: [],
      modelName: modelName,
      hash: hashName,
      isPremitive: true
    };
  }

  return {
    name: `${pascalCase(currentName)}Set`,
    modelName: modelName,
    value: extractedEnum,
    hash: hashName.toString(),
    isPremitive: false
  };
}
