export const GeneratorParams: IGeneratorParam[] = [
    {
        name: 'config',
        keys: ['-c', '--c'],
        noValue: false,
        description: 'Swagger doc path'
    },
    {
        name: 'out',
        keys: ['-o', '--o'],
        noValue: false,
        description: 'Output directory'
    },
    {
        name: 'help',
        keys: [
            '-h', '--h', 'help', '-help'
        ],
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