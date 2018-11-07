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
import {
  Dropdown as BSDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle
} from 'bootstrap'
import { classes } from 'utils'

export interface DropdownProps extends DropdownItemSpec {
  navItem?: boolean
  active?: boolean
  expanded?: boolean
  items?: DropdownItemSpec[]
  onClickItem?: (event: MouseEvent) => void
  onClickToggle?: (event: MouseEvent) => void
  innerRef?: (element?: HTMLElement | null) => void
  [prop: string]: unknown
}

export interface DropdownItemSpec {
  label?: string
  icon?: string[] | string
  href?: string
  disabled?: boolean
}

export function Dropdown ({
  navItem,
  active,
  disabled,
  expanded,
  label,
  icon,
  items,
  onClickItem,
  onClickToggle,
  innerRef,
  ...attrs
}: DropdownProps) {
  return (
    <BSDropdown
      navItem={navItem}
      active={active}
      disabled={disabled}
      expanded={expanded}
      innerRef={innerRef}
    >
      <DropdownToggle onClick={onClickToggle} nav={navItem} {...attrs}>
        <MenuItemIcon icon={icon} />
        {label}
      </DropdownToggle>
      <DropdownMenu
        expanded={expanded}
        className={navItem && 'bg-info border-info'}
      >
        {dropdownMenuItems({ items, onClickItem, className: navItem && 'text-light' })}
      </DropdownMenu>
    </BSDropdown>
  )
}

export interface DropdownMenuItemsProps {
  items?: DropdownItemSpec[]
  className?: string
  onClickItem?: (event: MouseEvent) => void
}

// TODO convert this to a Fragment component with Inferno@6
function dropdownMenuItems ({
  items,
  className,
  onClickItem
}: DropdownMenuItemsProps) {
  if (!items || !items.length) return null
  let key = items.length
  const entries = new Array<JSX.Element>(key)
  while (key--) {
    const { label, icon, ...attrs } = items[key]
    entries[key] = (
      <DropdownItem className={className} onClick={onClickItem} {...attrs}>
        <MenuItemIcon icon={icon} />
        {label}
      </DropdownItem>
    )
  }
  return entries
}

export interface MenuItemIconProps {
  icon?: string[] | string
  className?: string
  [prop: string]: unknown
}

export function MenuItemIcon ({ icon, className, ...attrs }: MenuItemIconProps) {
  if (!icon) return null
  return !icon ? null : Array.isArray(icon)
  ? <MenuItemIcons icons={icon} className={className} {...attrs} />
  : <i className={classes(icon, 'mr-1', className)} {...attrs} />
}

interface MenuItemIconsProps extends MenuItemIconProps {
  icon?: never
  icons: string[]
  [prop: string]: unknown
}

function MenuItemIcons ({ icons, ...attrs }: MenuItemIconsProps) {
  let i = icons.length
  const elements = new Array<JSX.Element>(i)
  while (i--) {
    const icon = icons[i]
    elements[i] = !icon ? null : <MenuItemIcon icon={icon} {...attrs} />
  }
  return <span>{elements}</span>
}
