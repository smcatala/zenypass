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

import reducer, { AutomataState } from './reducer'
import { actionsFromSelectMenuItem, openLinkOnHelp } from './effects'
import componentFromEvents, {
  ComponentClass,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { tap } from 'rxjs/operators'
import { localizeMenu, MenuSpec } from 'utils'
import createL10ns, { KVs } from 'basic-l10n'
const log = label => console.log.bind(console, label)

const MENUS: { [path in AutomataState]?: KVs<MenuSpec> } = {
  '/': localizeMenu(
    createL10ns(require('./locales.json')),
    require('./options.json')
  )
}

export type RouterProps<P extends RouterSFCProps> =
  RouterHocProps & Rest<P, RouterSFCProps>

export interface RouterHocProps {
  locale: string
}

export interface RouterSFCProps extends RouterSFCHandlerProps {
  locale: string
  session?: string
  path?: string
  params?: { [prop: string]: unknown }
}

export interface RouterSFCHandlerProps {
  onSelectMenuItem?: (target: HTMLElement) => void
}

interface RouterState {
  props: RouterProps<RouterSFCProps>
  locale: string
  session: string
  path: string
}

function mapStateToProps (
  { props, locale, path, session }: RouterState
): Rest<RouterSFCProps, RouterSFCHandlerProps> {
  const menu = MENUS[path]
  const lang = locale || props.locale
  const params = { menu: menu && menu[lang] }
  return { ...props, locale: lang, path, session, params }
}

const mapDispatchToProps:
(dispatch: (event: any) => void) => RouterSFCHandlerProps =
createActionDispatchers({
  onSelectMenuItem: 'SELECT_MENU_ITEM'
})

export function router <P extends RouterSFCProps> (
  RouterSFC: SFC<P>
): ComponentClass<RouterProps<P>> {
  return componentFromEvents<RouterProps<P>, P>(
    RouterSFC,
    () => tap(log('router:event:')),
    redux(
      reducer,
      actionsFromSelectMenuItem,
      openLinkOnHelp
    ),
    () => tap(log('router:state:')),
    connect<RouterState, RouterSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => tap(log('router:view-props:'))
  )
}
