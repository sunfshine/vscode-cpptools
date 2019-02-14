/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All Rights Reserved.
 * See 'LICENSE' in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from "vscode";
import * as util from '../common';
import * as path from 'path';
import * as os from 'os';

// Registers DebugAdapterDescriptorFactory for `cppdbg` and `cppvsdbg`. If it is not ready, it will prompt a wait for the download dialog.
// NOTE: This file is not automatically tested.

abstract class DebugAdapterDescriptorFactoryWithContext implements vscode.DebugAdapterDescriptorFactory {
    protected readonly context: vscode.ExtensionContext;

    // This is important for the Mock Debugger since it can not use src/common
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    abstract createDebugAdapterDescriptor(session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): vscode.ProviderResult<vscode.DebugAdapterDescriptor>;
}

export class CppdbgDebugAdapterDescriptorFactory extends DebugAdapterDescriptorFactoryWithContext {
    public static DEBUG_TYPE : string = "cppdbg";

    constructor(context: vscode.ExtensionContext) {
        super(context);
    }

    createDebugAdapterDescriptor(session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
        return util.isExtensionReady().then(ready => {
            if (ready) {
                let command: string = path.join(this.context.extensionPath, './debugAdapters/OpenDebugAD7');

                // Windows has the exe in debugAdapters/bin.
                if (os.platform() === 'win32') {
                    command = path.join(this.context.extensionPath, "./debugAdapters/bin/OpenDebugAD7.exe");
                }

                return new vscode.DebugAdapterExecutable(command, []);
            } else {
                throw new Error(util.extensionNotReadyString);
            }
        });
    }
}

export class CppvsdbgDebugAdapterDescriptorFactory extends DebugAdapterDescriptorFactoryWithContext {
    public static DEBUG_TYPE : string = "cppvsdbg";

    constructor(context: vscode.ExtensionContext) {
        super(context);
    }

    createDebugAdapterDescriptor(session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
        if (os.platform() !== 'win32') {
            vscode.window.showErrorMessage("Debugger type 'cppvsdbg' is not avaliable for non-Windows machines.");
            return null;
        } else {
            return util.isExtensionReady().then(ready => {
                if (ready) {
                    return new vscode.DebugAdapterExecutable(
                        path.join(this.context.extensionPath, './debugAdapters/vsdbg/bin/vsdbg.exe'),
                        ['--interpreter=vscode']
                    );
                } else {
                    throw new Error(util.extensionNotReadyString);
                }
            });
        }
    }
}