/*--------------------------------------------------------------------------------------------- 
 *  Copyright (c) Microsoft Corporation. All rights reserved. 
 *  Licensed under the MIT License. See License.txt in the project root for license information. 
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as assert from 'assert';
 
suite(`Debug Integration Test: `, function(): void {
    suiteSetup(async function(): Promise<void> { 
        let extension: vscode.Extension<any> = vscode.extensions.getExtension("ms-vscode.cpptools"); 
        if (!extension.isActive) {
            await extension.activate(); 
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