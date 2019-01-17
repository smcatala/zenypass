/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
 * @author Hadrien Boulanger
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
import { NavbarMenu } from 'components'
import { storiesOf } from '@storybook/react'
import preventDefaultAction from './helpers/prevent-default'
import { MENU } from './helpers/consts'

const attr = {
  menu: MENU,
  onClickItem: preventDefaultAction('CLICK_ITEM')
}

storiesOf('NavbarMenu', module).add('default', () => (
  <NavbarMenu {...attr}>
    <span className="text-light">***</span>
  </NavbarMenu>
))
