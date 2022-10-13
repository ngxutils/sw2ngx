import { paramCase, pascalCase } from 'change-case';
import { SimHash } from './simhash/simhash';
let simHash = new SimHash();
function getSimHash() {
    if (!simHash) {
        simHash = new SimHash();
    }
    return simHash;
}
const extractEnumDescription = (description) => {
    const result = [];
    const indexOf = description.search(/\(\d/gi);
    if (indexOf !== -1) {
        description = description.substr(indexOf + 1).replace(')', '');
        const temp = description.split(',');
        for (const tmp of temp) {
            const [value, name] = tmp.split('=');
            result.push({
                key: name,
                val: isNaN(Number(value)) ? value : Number(value),
            });
        }
        return result;
    }
    else {
        return null;
    }
};
export function mergeDuplicateEnums(enumsMap, insertEnum) {
    const withParentName = `${pascalCase(paramCase(insertEnum.modelName) + '-' + paramCase(insertEnum.name))}`;
    const duplicate = enumsMap.has(insertEnum.name)
        ? [...enumsMap.keys()].filter((x) => x.replace(/\d+$/gi, '') === insertEnum.name)
        : [];
    const extDuplicate = [...enumsMap.keys()].filter((x) => x.replace(/\d+$/gi, '') === withParentName);
    if (duplicate.length > 0) {
        const equals = duplicate
            .map((x) => enumsMap.get(x))
            .filter((x) => !!x)
            .filter((x) => {
            if (x.hash === insertEnum.hash) {
                const p = x.value
                    .map((x) => x.key)
                    .sort()
                    .join('|');
                const f = insertEnum.value
                    .map((x) => x.key)
                    .sort()
                    .join('|');
                return p === f;
            }
            return false;
        });
        if (equals.length > 0) {
            return insertEnum.name;
        }
        else {
            if (extDuplicate.length > 0) {
                insertEnum.name = `${withParentName}${duplicate.length}`;
            }
            else {
                insertEnum.name = withParentName;
            }
        }
    }
    enumsMap.set(insertEnum.name, insertEnum);
    return insertEnum.name;
}
export function resolveEnumFn(description, enumValue, propType, currentName, modelName) {
    const extractedEnum = extractEnumDescription(description ? description : '');
    const hashName = getSimHash().hash(enumValue.join('|'));
    if (extractedEnum === null) {
        if (enumValue
            .join('')
            .split('')
            .some((x) => isNaN(Number(x)))) {
            return {
                name: `${pascalCase(currentName)}`,
                value: enumValue.map((val, index) => {
                    return {
                        key: String(val),
                        val: propType !== 'string' ? index : String(val),
                    };
                }),
                modelName: modelName,
                hash: hashName.toString(16),
                isPremitive: false,
            };
        }
        return {
            name: '( ' + enumValue.join(' | ') + ' )',
            value: [],
            modelName: modelName,
            hash: '9999999',
            isPremitive: true,
        };
    }
    return {
        name: `${pascalCase(currentName)}`,
        modelName: modelName,
        value: extractedEnum,
        hash: hashName.toString(16),
        isPremitive: false,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZS1lbnVtLmZuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9wYXJzZXIvdXRpbHMvcmVzb2x2ZS1lbnVtLmZuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBSXBELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUU1QyxJQUFJLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0FBRTVCLFNBQVMsVUFBVTtJQUNqQixJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ1osT0FBTyxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7S0FDekI7SUFDRCxPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDO0FBRUQsTUFBTSxzQkFBc0IsR0FBRyxDQUFDLFdBQW1CLEVBQUUsRUFBRTtJQUNyRCxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDbEIsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM3QyxJQUFJLE9BQU8sS0FBSyxDQUFDLENBQUMsRUFBRTtRQUNsQixXQUFXLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMvRCxNQUFNLElBQUksR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BDLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO1lBQ3RCLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNWLEdBQUcsRUFBRSxJQUFJO2dCQUNULEdBQUcsRUFBRSxLQUFLLENBQUMs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