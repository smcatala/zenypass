/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
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

import reducer, { RouteAutomataState, LinkAutomataState } from './reducer'
import {
  AuthenticationPageType,
  actionFromMenuItem,
  actionFromError,
  actionFromAuthenticationPageType
} from './dispatchers'
import {
  injectParamsFromUrl,
  openLinkOnCloseInfo,
  signoutOnLogout
} from './effects'
import MENUS, { DEFAULT_LOCALE } from './options'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { tap } from 'rxjs/operators'
import { MenuSpec } from 'utils'
const log = label => console.log.bind(console, label)

export type RouterProps<P extends RouterSFCProps> =
  Rest<P, RouterSFCProps>

export interface RouterSFCProps extends RouterSFCHandlerProps {
  locale: string
  path?: string
  email?: string
  session?: string
  menu?: MenuSpec
  error?: string
  info?: boolean
  params?: { [prop: string]: unknown }
}

export interface RouterSFCHandlerProps {
  onAuthenticated?: (session?: string) => void
  onAuthenticationPageType?: (type?: AuthenticationPageType) => void
  onEmailChange?: (email?: string) => void
  onError?: (error?: any) => void
  onCloseInfo?: (event: MouseEvent) => void
  onSelectMenuItem?: (target: HTMLElement) => void
}

interface RouterState {
  props: RouterProps<RouterSFCProps>
  locale: string
  email?: string
  session?: string
  path: RouteAutomataState
  info: LinkAutomataState
  error?: any
  link?: HTMLLinkElement
}

function mapStateToProps (
  { props, locale, path, info, email, session, error }: RouterState
): Rest<RouterSFCProps, RouterSFCHandlerProps> {
  const menu = MENUS[path]
  const lang = locale || DEFAULT_LOCALE
  return {
    ...props,
    locale: lang,
    path,
    menu: menu && menu[lang],
    info: info === 'info',
    email,
    session,
    error
  }
}

const mapDispatchToProps:
(dispatch: (event: any) => void) => RouterSFCHandlerProps =
createActionDispatchers({
  onAuthenticated: 'AUTHENTICATED',
  onAuthenticationPageType: actionFromAuthenticationPageType,
  onEmailChange: 'EMAIL',
  onSelectMenuItem: actionFromMenuItem,
  onError: actionFromError,
  onCloseInfo: 'CLOSE_INFO'
})

export function router <P extends RouterSFCProps> (
  RouterSFC: SFC<P>
): ComponentConstructor<RouterProps<P>> {
  return componentFromEvents<RouterProps<P>, P>(
    RouterSFC,
    () => tap(log('router:event:')),
    redux(
      reducer,
      injectParamsFromUrl,
      openLinkOnCloseInfo,
      signoutOnLogout
    ),
    () => tap(log('router:state:')),
    connect<RouterState, RouterSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => tap(log('router:view-props:'))
  )
}
