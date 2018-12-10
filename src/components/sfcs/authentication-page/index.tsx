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
import { SigninForm, SigninFormProps } from './signin-form'
import { SignupForm, SignupFormProps } from './signup-form'
import { SplashCard, SplashFooterCard } from '../splash-card'
import { Dropdown, DropdownItemSpec } from '../../dropdown'
import { FAIcon } from '../fa-icon'
import { Button, CardBody, CardTitle, Row } from 'bootstrap'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface AuthenticationPageProps
extends SigninFormProps, SignupFormProps {
  locales?: DropdownItemSpec[]
  signup?: boolean
  pending?: boolean
  onSelectLocale?: (item?: HTMLElement) => void
  onToggleSignup?: (event: Event) => void
}

export type UnknownProps = { [prop: string]: unknown }

export function AuthenticationPage ({
  locale,
  locales,
  signup,
  emails,
  email,
  password,
  confirm,
  cleartext,
  pending,
  enabled,
  error,
  onChange,
  onSelectLocale,
  onSelectEmail,
  onSubmit,
  onToggleSignup,
  onEmailInputRef,
  onPasswordInputRef,
  onConfirmInputRef,
  ...attrs
}: AuthenticationPageProps & UnknownProps) {
  const formProps = {
    id: 'authentication-form',
    locale,
    email,
    password,
    cleartext,
    enabled,
    error,
    onChange,
    onSubmit,
    onEmailInputRef,
    onPasswordInputRef
  }
  const t = l10ns[locale]
  const title = t(
    signup ? 'Create your ZenyPass account' : 'Login to your ZenyPass account'
  )
  const question = t(
    signup ? 'Already have an account' : 'You don\'t have an account'
  )
  return (
    <section className='container bg-light' {...attrs}>
      <Row className='justify-content-center' >
        <SplashCard >
          <CardTitle className='mt-3'>
            {title}
          </CardTitle>
          <CardBody className='px-0' >
            {
              signup
              ? (
                <SignupForm
                  {...formProps}
                  confirm={confirm}
                  onConfirmInputRef={onConfirmInputRef}
                />
              )
              : (
                <SigninForm
                  {...formProps}
                  emails={emails}
                  onSelectEmail={onSelectEmail}
                />
              )
            }
            <Dropdown
              icon={locales[0].icon}
              outline
              items={locales.slice(1)}
              onSelectItem={onSelectLocale}
              className='float-left'
            />
            <Button
              type='submit'
              form='authentication-form'
              color='info'
              disabled={enabled !== true}
              className='float-right'
            >
              {
                !pending ? null : (
                  <FAIcon icon='spinner' animate='spin' className='mr-1'/>
                )
              }
              {t(signup ? 'Create your account' : 'Login')}
            </Button>
          </CardBody>
        </SplashCard>
      </Row>
      <Row className='justify-content-center' >
        <a
          href={t('help-link')}
          target='_blank'
          className='text-info'
        >
          <small>{t('Online-help')}</small>
        </a>
      </Row>
      <Row className='justify-content-center' >
        <SplashFooterCard>
          <CardBody>
            <p><small>{question} ?</small></p>
            <Button color='info' onClick={onToggleSignup} disabled={pending} >
              {t(signup ? 'Login' : 'Create your account')}
            </Button>
          </CardBody>
        </SplashFooterCard>
      </Row>
    </section>
  )
}
