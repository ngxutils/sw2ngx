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
    name: 'templateFolder',
    keys: ['-t', '--t', '-tmpl'],
    noValue: false,
    description: 'Template Folder'
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
