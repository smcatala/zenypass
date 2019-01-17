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
import reducer, { AutomataState } from './reducer'
import {
  callOnDoneOnCancelling,
  clearClipboardOnClearingClipboard,
  openWindowOnClickCopyWhenNotManual
} from './effects'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import {
  createActionDispatchers,
  createActionFactory,
  createActionFactories
} from 'basic-fsa-factories'
import { preventDefault, shallowEqual } from 'utils'
import { distinctUntilChanged, tap } from 'rxjs/operators'
const log = (label: string) => console.log.bind(console, label)

export type ConnectionModalProps<
  P extends ConnectionModalSFCProps
> = ConnectionModalControllerProps & Rest<P, ConnectionModalSFCProps>

export interface ConnectionModalControllerProps {
  onDone?: () => void
}

export interface ConnectionModalSFCProps
  extends ConnectionModalSFCHandlerProps {
  manual?: boolean
  cleartext?: boolean
  error?: boolean
  copy?: 'all' | 'password' | 'username' | '' | false
}

export interface ConnectionModalSFCHandlerProps {
  onCancel?: (err?: any) => void
  onToggleManual?: (event: MouseEvent) => void
  onToggleCleartext?: (event: MouseEvent) => void
  onClickCopy?: (event: MouseEvent) => void
  onUsernameCopied?: (success: boolean) => void
  onPasswordCopied?: (success: boolean) => void
}

interface ConnectionModalState {
  props: ConnectionModalProps<ConnectionModalSFCProps>
  state: AutomataState
  manual?: boolean
  cleartext?: boolean
  error?: boolean
  windowref?: any
}

const STATE_TO_COPY_PROP = {
  'copy-any': 'all',
  'copying-any': 'all',
  'copy-password': 'password',
  'copying-password': 'password',
  'copy-username': 'username',
  'copying-username': 'username'
}

function mapStateToProps({
  props,
  manual,
  cleartext,
  error,
  state
}: ConnectionModalState): Rest<
  ConnectionModalSFCProps,
  ConnectionModalSFCHandlerProps
> {
  const copy = STATE_TO_COPY_PROP[state]
  const { onDone, ...attrs } = props
  return { ...attrs, manual, cleartext, error, copy }
}

const copied = createActionFactories({
  username: 'USERNAME_COPIED',
  password: 'PASSWORD_COPIED'
})

const copyError = createActionFactory('COPY_ERROR')

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => ConnectionModalSFCHandlerProps = createActionDispatchers({
  onCancel: 'CANCEL',
  onToggleManual: 'TOGGLE_MANUAL',
  onToggleCleartext: 'TOGGLE_CLEARTEXT',
  onClickCopy: ['CLICK_COPY', preventDefault],
  onUsernameCopied: onFieldCopied('username'),
  onPasswordCopied: onFieldCopied('password')
})

function onFieldCopied(field: 'username' | 'password') {
  return function(success: boolean) {
    return success ? copied[field]() : copyError(field)
  }
}

export function connectionModal<P extends ConnectionModalSFCProps>(
  ConnectionModal: SFC<P>
): ComponentConstructor<ConnectionModalProps<P>> {
  return componentFromEvents<ConnectionModalProps<P>, P>(
    ConnectionModal,
    () => tap(log('controlled-connection-modal:event:')),
    redux(
      reducer,
      callOnDoneOnCancelling,
      clearClipboardOnClearingClipboard,
      openWindowOnClickCopyWhenNotManual
    ),
    () => tap(log('controlled-connection-modal:state:')),
    connect<ConnectionModalState, ConnectionModalSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => distinctUntilChanged(shallowEqual),
    () => tap(log('controlled-connection-modal:view-props:'))
  )
}
