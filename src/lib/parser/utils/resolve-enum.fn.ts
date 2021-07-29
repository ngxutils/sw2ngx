import { paramCase, pascalCase } from 'change-case';

import { Description } from '../../../types/swagger';

import { SimHash } from './simhash/simhash';

let simHash = new SimHash()

function getSimHash(){
  if(!simHash){
    console.log('new simhash')
    simHash = new SimHash()
  }
  return simHash
}

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

export function mergeDuplicateEnums(enumsMap: Map<string,Sw2NgxEnum>, insertEnum: Sw2NgxEnum): string {
  const withParentName = `${pascalCase(
    paramCase(insertEnum.modelName).replace(/^i-/gi, '') + '-' + paramCase(insertEnum.name)
  )}`;
  const duplicate = enumsMap.has(insertEnum.name) ? [...enumsMap.keys()].filter((x)=>x.replace(/\d+$/gi, '') === insertEnum.name): [];
  const extDuplicate = [...enumsMap.keys()].filter((x)=>x.replace(/\d+$/gi, '') === withParentName);
  if (duplicate.length > 0) {
    const equals = duplicate.map((x)=> enumsMap.get(x))
      .filter((x): x is Sw2NgxEnum=>!!x)
      .filter((x) => {
      if(x.hash === insertEnum.hash){
        const p = x.value.map(x=> x.key).sort().join('|')
        const f = insertEnum.value.map(x=> x.key).sort().join('|')
        return p === f
      }
      return  false
    })
    if (equals.length > 0)  {
      console.log('eq',insertEnum.name, insertEnum.hash,JSON.stringify(equals))
      return insertEnum.name
    } else {
      if (extDuplicate.length > 0) {
        insertEnum.name = `${withParentName}${duplicate.length}`;
      } else {
        insertEnum.name = withParentName;
      }
    }
  }
  enumsMap.set(insertEnum.name, insertEnum)
  return insertEnum.name
}

export function resolveEnumFn(
  description: Description | undefined,
  enumValue: [unknown, ...unknown[]],
  currentName: string,
  modelName: string
): Sw2NgxEnum  {

  const extractedEnum = extractEnumDescription(description ? description : '');
  const hashName = getSimHash().hash(enumValue.join('|'))

  if (extractedEnum === null) {
    if (
      enumValue
        .join('')
        .split('')
        .some((x)=> isNaN(Number(x)))
    ) {
      return {
        name: '( ' + enumValue.map((x) => `'${x}'`).join(' | ') + ' )',
        value: [],
        modelName: modelName,
        hash: '999999',
        isPremitive: true
      };
    }
    return {
      name: '( ' + enumValue.join(' | ') + ' )',
      value: [],
      modelName: modelName,
      hash: '9999999',
      isPremitive: true
    };
  }

  return {
    name: `${pascalCase(currentName)}Set`,
    modelName: modelName,
    value: extractedEnum,
    hash: hashName.toString(16),
    isPremitive: false
  };
}
