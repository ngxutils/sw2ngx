"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveEnumFn = exports.mergeDuplicateEnums = void 0;
const change_case_1 = require("change-case");
const simhash_1 = require("./simhash/simhash");
let simHash = new simhash_1.SimHash();
function getSimHash() {
    if (!simHash) {
        simHash = new simhash_1.SimHash();
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
function mergeDuplicateEnums(enumsMap, insertEnum) {
    const withParentName = `${change_case_1.pascalCase(change_case_1.paramCase(insertEnum.modelName) + '-' + change_case_1.paramCase(insertEnum.name))}`;
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
exports.mergeDuplicateEnums = mergeDuplicateEnums;
function resolveEnumFn(description, enumValue, propType, currentName, modelName) {
    const extractedEnum = extractEnumDescription(description ? description : '');
    const hashName = getSimHash().hash(enumValue.join('|'));
    if (extractedEnum === null) {
        if (enumValue
            .join('')
            .split('')
            .some((x) => isNaN(Number(x)))) {
            return {
                name: `${change_case_1.pascalCase(currentName)}`,
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
        name: `${change_case_1.pascalCase(currentName)}`,
        modelName: modelName,
        value: extractedEnum,
        hash: hashName.toString(16),
        isPremitive: false,
    };
}
exports.resolveEnumFn = resolveEnumFn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZS1lbnVtLmZuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9wYXJzZXIvdXRpbHMvcmVzb2x2ZS1lbnVtLmZuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUFvRDtBQUlwRCwrQ0FBNEM7QUFFNUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxpQkFBTyxFQUFFLENBQUM7QUFFNUIsU0FBUyxVQUFVO0lBQ2pCLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDWixPQUFPLEdBQUcsSUFBSSxpQkFBTyxFQUFFLENBQUM7S0FDekI7SUFDRCxPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDO0FBRUQsTUFBTSxzQkFBc0IsR0FBRyxDQUFDLFdBQW1CLEVBQUUsRUFBRTtJQUNyRCxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDbEIsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM3QyxJQUFJLE9BQU8sS0FBSyxDQUFDLENBQUMsRUFBRTtRQUNsQixXQUFXLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMvRCxNQUFNLElBQUksR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BDLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO1lBQ3RCLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNWLEdBQUcsRUFBRSxJQUFJO2dCQUNULEdBQUcsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFB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