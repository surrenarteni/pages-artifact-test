export {};

type ValidEncoding = 'utf8' | 'utf-8' | 'ascii' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'base64url' | 'latin1' | 'binary' | 'hex';

interface IpcRenderer {
    send(channel: string, data: unknown): void;
    on(channel: string, func: (data: unknown) => void): void;
}

declare global {
    interface Window {
        electron: {
            ipcRenderer: IpcRenderer;
        };
        fs: {
            readdir(dir: string): Promise<string[]>;
            readFile(path: string, options?: { encoding?: ValidEncoding }): Promise<string | Buffer>;
        };
    }
}

interface IpcRenderer {
    send(channel: string, data: unknown): void;
    on(channel: string, func: (data: unknown) => void): void;
    invoke(channel: string, ...args: any[]): Promise<any>; // Add this line
}