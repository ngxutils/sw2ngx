export const GeneratorParams: IGeneratorParam[] = [
  {
    name: 'config',
    keys: ['-c', '--c', '-conf'],
    noValue: false,
    description: 'Swagger doc path'
  },
  {
    name: 'out',
    keys: ['-o', '--o','-out'],
    noValue: false,
    description: 'Output directory'
  },
  {
    name: 'ext',
    keys: ['-e', '--e','-ext'],
    noValue: false,
    description: 'Path from process dir to extend config'
  },
  {
    name: 'templateFolder',
    keys: ['-t', '--t', '-tmpl'],
    noValue: false,
    description: 'Template Folder'
  },
  {
    name: 'readonlyModels',
    keys: ['-rlm', '--read-only-models'],
    noValue: true,
    description: 'Generation models with `redonly`'
  },
  {
    name: 'withoutModule',
    keys: ['-no-module', '--no-module'],
    noValue: true,
    description: 'No generate root module'
  },
  {
    name: 'providedIn',
    keys: ['-provided-in', '--provided-in', '-in'],
    noValue: false,
    description: 'provided in palace for all services'
  },
  {
    name: 'help',
    keys: ['-h', '--h', 'help', '-help'],
    noValue: true,
    description: 'Call help'
  }
];

export interface IGeneratorParam {
  name: string;
  keys: string[];
  noValue: boolean;
  description: string;
}
