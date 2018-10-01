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
import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import {
  catchError,
  ignoreElements,
  filter,
  first,
  last,
  map,
  mapTo,
  pluck,
  share,
  switchMap,
  startWith,
  takeUntil,
  tap,
  withLatestFrom
} from 'rxjs/operators'
import { Observable, of as observable } from 'rxjs'

const log = (label: string) => console.log.bind(console, label)
const ofType = type => filter(isOfType(type))

const onServerError = createActionFactory('SERVER_ERROR')
const unauthorized = createActionFactory('UNAUTHORIZED')
const authenticationDone = createActionFactory('AUTHENTICATION_DONE')

export const callOnCancel = callHandlerOnEvent('onCancel', 'CANCEL')
export const callOnSubmit = callHandlerOnEvent(
  'onSubmit',
  'SUBMIT',
  ({ value }: { value: string }) => value
)

export type KV<V> = { [k: string]: V }
export type Handler<V> = (value?: V) => void

export function callHandlerOnEvent <
  H extends string,
  S extends { props: P } & T,
  P extends { [prop in H]?: Handler<V> } = { [prop in H]?: Handler<V> },
  T extends {} = {},
  V = void,
  L = void
> (
  handler: H,
  type: string,
  project?: (state: T, event: StandardAction<L>) => V
) {
  return function (
    event$: Observable<StandardAction<any>>,
    state$: Observable<S>
  ) {
    return event$.pipe(
      ofType(type),
      withLatestFrom(state$),
      tap(
        ([event, state]: [StandardAction<L>, S]) =>
          callHandler(state.props[handler], project && project(state, event))
      ),
      ignoreElements()
    )
  }
}

function callHandler <V> (handler?: Handler<V>, value?: V) {
  handler && handler(value)
}

// TODO remove
export function authenticateOnSubmit ({ authenticate }) {
  return function (event$, state$) {
    const unmount$ = state$.pipe(last(), share())

    return event$.pipe(
      ofType('SUBMIT'),
      withLatestFrom(state$),
      pluck('1'),
      filter<any>(hasHandler('onAuthenticated')),
      switchMap(authenticateUntilCancel),
      takeUntil(unmount$)
    )

    function authenticateUntilCancel ({ props, value }) {
      const { onAuthenticated } = props
      const cancel$ = event$.pipe(ofType('CANCEL'))

      return authenticate(value).pipe(
        takeUntil(unmount$),
        takeUntil(cancel$),
        tap(onAuthenticated),
        mapTo(void 0),
        map(authenticationDone),
        catchError(dealWithError)
      )
    }
  }
}

function dealWithError (err) {
  const status = err && err.status || 501
  return observable(err && err.message || `ERROR ${status}`).pipe(
    map(status === 401 ? unauthorized : onServerError)
  )
}

function hasHandler (prop) {
  return function ({ props }) {
    return !!props[prop]
  }
}

function isOfType (type) {
  return function (event) {
    return event.type === type
  }
}

export interface AuthorizationEffectSpec {
  requested: string
  rejected: string
  resolved: string
}

const DEFAULT_SPECS: AuthorizationEffectSpec = {
  requested: 'AUTHENTICATION_REQUESTED',
  rejected: 'AUTHENTICATION_REJECTED',
  resolved: 'AUTHENTICATION_RESOLVED'
}

export function abortOrAuthorize (
  rejected,
  request,
  opts?: AuthorizationEffectSpec
) {
  return function (event$, state$) {
    return function (err) {
      return err && err.status !== 401
        ? observable(rejected(err))
        : authorize(request, opts)(event$, state$)
    }
  }
}

export function authorize (
  request,
  opts?: AuthorizationEffectSpec
) {
  const { requested, rejected, resolved } = { ...DEFAULT_SPECS, ...opts }
  const authenticate = createActionFactory(requested)

  return function (event$, state$) {
    const cancel$ = event$.pipe(filter(isOfType(rejected)))

    return event$.pipe(
      filter(isOfType(resolved)),
      first(),
      takeUntil(cancel$),
      withLatestFrom(state$),
      pluck('1'),
      switchMap(request),
      startWith(authenticate())
    )
  }
}
