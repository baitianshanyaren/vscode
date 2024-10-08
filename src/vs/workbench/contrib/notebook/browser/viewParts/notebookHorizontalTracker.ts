/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { addDisposableListener, EventType, getWindow } from '../../../../../base/browser/dom.js';
import { IMouseWheelEvent } from '../../../../../base/browser/mouseEvent.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { isChrome } from '../../../../../base/common/platform.js';
import { CodeEditorWidget } from '../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import { INotebookEditorDelegate } from '../notebookBrowser.js';

export class NotebookHorizontalTracker extends Disposable {
	constructor(
		private readonly _notebookEditor: INotebookEditorDelegate,
		private readonly _listViewScrollablement: HTMLElement,
	) {
		super();

		this._register(addDisposableListener(this._listViewScrollablement, EventType.MOUSE_WHEEL, (event: IMouseWheelEvent) => {
			if (event.deltaX === 0) {
				return;
			}

			const hoveringOnEditor = this._notebookEditor.codeEditors.find(editor => {
				const editorLayout = editor[1].getLayoutInfo();
				if (editorLayout.contentWidth === editorLayout.width) {
					// no overflow
					return false;
				}

				const editorDOM = editor[1].getDomNode();
				if (editorDOM && editorDOM.contains(event.target as HTMLElement)) {
					return true;
				}

				return false;
			});

			if (!hoveringOnEditor) {
				return;
			}

			const targetWindow = getWindow(event);
			const evt = {
				deltaMode: event.deltaMode,
				deltaX: event.deltaX,
				deltaY: 0,
				deltaZ: 0,
				wheelDelta: event.wheelDelta && isChrome ? (event.wheelDelta / targetWindow.devicePixelRatio) : event.wheelDelta,
				wheelDeltaX: event.wheelDeltaX && isChrome ? (event.wheelDeltaX / targetWindow.devicePixelRatio) : event.wheelDeltaX,
				wheelDeltaY: 0,
				detail: event.detail,
				shiftKey: event.shiftKey,
				type: event.type,
				defaultPrevented: false,
				preventDefault: () => { },
				stopPropagation: () => { }
			};

			(hoveringOnEditor[1] as CodeEditorWidget).delegateScrollFromMouseWheelEvent(evt as any);
		}));
	}
}
