/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All Rights Reserved.
 * See 'LICENSE' in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { Logger, logger, LoggingDebugSession, InitializedEvent, TerminatedEvent } from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';

interface LaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
    /** An absolute path to the "program" to debug. */    
    program: string;

    /** enable logging the Debug Adapter Protocol */    
    logPath?: string;
}

export class MockDebugSession extends LoggingDebugSession
{
    public constructor() {
        super("mock-debug.txt");
    }

    protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {
		// build and return the capabilities of this debug adapter:
        response.body = response.body || {};
        
		this.sendResponse(response);
		// since this debug adapter can accept configuration requests like 'setBreakpoint' at any time,
		// we request them early by sending an 'initializeRequest' to the frontend.
		// The frontend will end the configuration sequence by calling 'configurationDone' request.
		this.sendEvent(new InitializedEvent());

	}

	protected async launchRequest(response: DebugProtocol.LaunchResponse, args: LaunchRequestArguments) {
		// make sure to 'Stop' the buffered logging if 'trace' is not set
		logger.setup(args.logPath ? Logger.LogLevel.Verbose : Logger.LogLevel.Stop, args.logPath);

		this.sendResponse(response);

		// Terminate after launch. 
		this.sendEvent(new TerminatedEvent());
	}
}