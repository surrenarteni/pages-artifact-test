import { contextBridge, ipcRenderer } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';

// Define valid encoding types
type ValidEncoding = 'utf8' | 'utf-8' | 'ascii' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'base64url' | 'latin1' | 'binary' | 'hex';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'electron',
    {
        ipcRenderer: {
            send: (channel: string, data: any) => {
                ipcRenderer.send(channel, data);
            },
            on: (channel: string, func: (...args: any[]) => void) => {
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            },
            invoke: (channel: string, ...args: any[]) => {
                return ipcRenderer.invoke(channel, ...args);
            }
        }
    }
);

// Expose file system methods
contextBridge.exposeInMainWorld(
    'fs',
    {
        readdir: async (dir: string) => {
            try {
                const artifactsPath = path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
                return await fs.readdir(artifactsPath);
            } catch (error) {
                console.error('Error reading directory:', error);
                throw error;
            }
        },
        readFile: async (filePath: string, options?: { encoding?: ValidEncoding }) => {
            try {
                const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
                if (options?.encoding) {
                    return await fs.readFile(fullPath, { 
                        encoding: options.encoding as BufferEncoding 
                    });
                }
                return await fs.readFile(fullPath);
            } catch (error) {
                console.error('Error reading file:', error);
                throw error;
            }
        },
        writeFile: async (filePath: string, data: string) => {
            try {
                const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
                await fs.writeFile(fullPath, data);
            } catch (error) {
                console.error('Error writing file:', error);
                throw error;
            }
        },
        mkdir: async (dirPath: string, options?: { recursive?: boolean }) => {
            try {
                const fullPath = path.isAbsolute(dirPath) ? dirPath : path.join(process.cwd(), dirPath);
                await fs.mkdir(fullPath, options);
            } catch (error) {
                console.error('Error creating directory:', error);
                throw error;
            }
        }
    }
);