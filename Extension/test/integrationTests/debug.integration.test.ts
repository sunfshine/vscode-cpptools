/*--------------------------------------------------------------------------------------------- 
 *  Copyright (c) Microsoft Corporation. All rights reserved. 
 *  Licensed under the MIT License. See License.txt in the project root for license information. 
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as assert from 'assert';
import * as util from '../../src/common';
import * as fs from 'fs';
import * as path from 'path';
 
suite(`Debug Integration Test: `, function(): void {
    let origFactoryFile: string;
    let tempFactoryFile: string;
    let hijackedFactoryFile: string;

    suiteSetup(async function(): Promise<void> {
        // extension.activate() must be first or else util.extensionContext will be undefined.
        let extension: vscode.Extension<any> = vscode.extensions.getExtension("ms-vscode.cpptools"); 
        if (!extension.isActive) {
            await extension.activate(); 
        }

        console.log(extension.extensionPath);

        // The following block below is to hijack the debug adapter for the debug F5 scenario. 
        if (process.env.MOCK_DEBUG)
        {
            console.log("MOCK_DEBUG ENABLED");
            origFactoryFile = path.join(util.extensionContext.extensionPath, "./out/src/Debugger/debugAdapterDescriptorFactory.js");
            tempFactoryFile = origFactoryFile + ".tmp";
            hijackedFactoryFile = path.join(util.extensionContext.extensionPath, "./out/test/integrationTests/MockDebugger/debugAdapterDescriptorFactory.js");

            fs.renameSync(origFactoryFile, tempFactoryFile);
            fs.copyFileSync(hijackedFactoryFile, origFactoryFile);  

            console.log("Does Hijacked File Exist? " + fs.existsSync(hijackedFactoryFile));
        }
    });

    suiteTeardown(async function(): Promise<void> {
        if (process.env.MOCK_DEBUG)
        {
            // restore hijacked .js file.
            fs.copyFileSync(tempFactoryFile, origFactoryFile);
        }
    });
 
    test("Starting (gdb) Launch from the workspace root should create an Active Debug Session", async function() { 
        await vscode.debug.startDebugging(vscode.workspace.workspaceFolders[0], "(gdb) Launch");

        let debugSessionTerminated: Promise<void> = new Promise(resolve => {
            vscode.debug.onDidTerminateDebugSession((e) => resolve());
        });

        try {
            assert.equal(vscode.debug.activeDebugSession.type, "cppdbg");
        } catch (e) {
            assert.fail("Debugger failed to launch. Did the extension activate correctly?");
        }

        await debugSessionTerminated;
    });
}); 