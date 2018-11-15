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
/** @jsx createElement */
import { createElement } from 'create-element'
import { SearchField } from '../search-field'
import { FAIconButton } from '../fa-icon'
import { NavbarMenu, MenuSpecs } from '../../navbar-menu'
import { FilteredRecordCards, Record } from '../filtered-record-cards'
import { InfoModal } from '../info-modal'
import { Observer } from 'component-from-props'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export { Record }

export interface HomePageProps {
  locale: string
  menu: MenuSpecs
  records?: Record[]
  busy?: boolean
  error?: string
  session?: string
  filter?: boolean[]
  tokens?: string[]
  debounce?: string | number
  onAuthenticationRequest?: (res$: Observer<string>) => void
  onSelectMenuItem?: (target: HTMLElement) => void
  onSearchFieldRef?: (ref: HTMLElement) => void
  onTokensChange?: (tokens: string[]) => void
  onTokensClear?: (event: MouseEvent) => void
  onToggleFilter?: (event: MouseEvent) => void
  onCloseModal?: (event: MouseEvent) => void
}

export function HomePage ({
  locale,
  menu,
  records = [],
  busy,
  error,
  filter,
  session,
  tokens,
  debounce,
  onAuthenticationRequest,
  onSelectMenuItem,
  onSearchFieldRef,
  onTokensChange,
  onTokensClear,
  onToggleFilter,
  onCloseModal,
  ...attrs
}: HomePageProps & { [prop: string]: unknown}) {
  const t = l10ns[locale]

  return (
    <section {...attrs}>
      <InfoModal
        locale={locale}
        expanded={!!error || !!busy}
        progress={busy && '100'}
        onCancel={!busy && onCloseModal}
      >
        <p>
          {t(busy ? 'Creating new card' : 'Sorry, something went wrong')}...<br/>
          {busy ? null : error}
        </p>
      </InfoModal>
      <header className='sticky-top'>
        <NavbarMenu
          menu={menu}
          onSelectItem={onSelectMenuItem}
        >
          <FAIconButton
            icon='search'
            color='info'
            onClick={onToggleFilter}
            active={!!filter}
          />
        </NavbarMenu>
        {
          !filter ? null : (
            <SearchField
              innerRef={onSearchFieldRef}
              className='col-12 col-md-6 col-xl-4 px-0 py-1 bg-white'
              tokens={tokens}
              debounce={debounce}
              onChange={onTokensChange}
              onClear={onTokensClear}
            />
          )
        }
      </header>
      <FilteredRecordCards
        locale={locale}
        records={records}
        filter={filter}
        session={session}
        onAuthenticationRequest={onAuthenticationRequest}
        onFilterCancel={onToggleFilter}
      />
    </section>
  )
}
