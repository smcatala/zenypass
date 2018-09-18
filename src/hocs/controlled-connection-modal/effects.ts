/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
 * @author Clement Bonet
 * @license Apache Version 2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */
//
import { not } from 'utils'
import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import {
  catchError,
  concatMap,
  distinctUntilKeyChanged,
  filter,
  map,
  partition,
  pluck,
  share,
  skip,
  tap,
  withLatestFrom
} from 'rxjs/operators'
import { Observable, of as observable, merge, pipe, zip } from 'rxjs'
import copyToClipboard from 'clipboard-copy'

const CLIPBOARD_CLEARED = 'Clipboard cleared by ZenyPass'

const windowOpenResolved = createActionFactory('WINDOW_OPEN_RESOLVED')
const windowOpenRejected = createActionFactory('WINDOW_OPEN_REJECTED')
const copyError = createActionFactory('COPY_ERROR')
const clipboardCleared = createActionFactory('CLIPBOARD_CLEARED')
const cancelled = createActionFactory('CANCELLED')

const log = (label: string) => console.log.bind(console, label)

export function clearClipboardOnClearingClipboard (
  _: any,
  state$: Observable<any>
) {
  return state$.pipe(
    sampleOnTransitionToState('clearing-clipboard'),
    concatMap(() => copyToClipboard(CLIPBOARD_CLEARED)),
    map(clipboardCleared),
    catchError(() => observable(copyError('clear-clipboard')))
  )
}

export function callOnCancelOnCancelling (_: any, state$: Observable<any>) {
  return state$.pipe(
    sampleOnTransitionToState('cancelling'),
    tap(({ props }) => props.onCancel && props.onCancel()),
    map(() => cancelled())
  )
}

export function openWindowOnClickCopy (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return event$.pipe(
    filter(({ type }) => type === 'CLICK_COPY'),
    pluck('payload'),
    withLatestFrom(state$),
    map(([ event, { windowref } ]) => openWindow(event, windowref)),
    map(ref => ref ? windowOpenResolved(ref) : windowOpenRejected())
  )
}

function openWindow (event, windowref) {
  if (!windowref) { // || windowref.closed) {
    const { target } = event
    if (!target.href) return
    const ref = window.open(target.href, target.target)
    return ref
  }
  windowref.focus()
  return windowref
}

function sampleOnTransitionToState (target) {
  return function (state$) {
    return state$.pipe(
      distinctUntilKeyChanged('state'),
      skip(1), // initial state
      filter(({ state }) => state === target)
    )
  }
}
