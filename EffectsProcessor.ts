import { getFirstPair } from 'common/utils/firebase'
import * as firebase from 'firebase'
import ParseXerCommand from 'src/commands/ParseXer/ParseXerCommand'
import XerFormatter from 'src/commands/ParseXer/XerJsonFormatter'
import XerParser from 'src/commands/ParseXer/XerParser'
import Project from 'src/models/Project'
import IProjectRepository from 'src/repositories/IProjectRepository'
import IUserRepository from 'src/repositories/IUserRepository'
import { EffectMap } from 'src/stores/EventStore/EventStore'
import IEffect, {
  IGetAllEffect,
  IGetByIdEffect,
} from 'src/stores/EventStore/IEffect'

import UpsertSchedule from '../../../../common/commands/UpsertSchedule'

export default class EffectsProcessor<EventTypes> {
  constructor(
    public db: firebase.database.Reference,
    public projectRepository: IProjectRepository,
    public userRepository: IUserRepository,
  ) {}

  process(
    store,
    { dispatch, dispatchN, db }: EffectMap<EventTypes>,
  ): Promise<any> {
    this.handleDispatchNEffect(store, dispatchN)
    this.handleDispatchEffect(store, dispatch)
    return this.handleDbEffect(store, db)
  }

  handleDispatchEffect(store, event) {
    if (!event) {
      return
    }
    store.dispatch(...event)
  }

  handleDispatchNEffect(store, events) {
    if (!events) {
      return
    }

    events.forEach(event => this.handleDispatchEffect(store, event))
  }

  public handleDbEffect(store, effect) {
    if (!effect) {
      return Promise.resolve()
    }

    switch (effect.type) {
      case 'none':
        return Promise.resolve()

      case 'upsert-project':
        return this.handleResult(
          store,
          effect,
          upsertProject(
            this.projectRepository,
            this.userRepository,
            this.db,
            effect,
          ),
        )

      case 'get-by-id':
        return this.handleResult(
          store,
          effect,
          getById(this.db, effect as IGetByIdEffect),
        )

      case 'get-all':
        return this.handleResult(
          store,
          effect,
          getAll(this.db, effect as IGetAllEffect),
        )

      default:
        throw new Error(
          `Unknown db effect received ${JSON.stringify(effect, null, 2)}`,
        )
    }
  }

  handleResult(store, effect, returnValue: any) {
    return Promise.resolve(returnValue)
      .then(result => store.dispatch(...effect.onSuccess.concat(result)))
      .catch(error => store.dispatch(...effect.onError.concat(error)))
  }
}

function upsertProject(projects, userRepository, db, effect): Promise<void> {
  const ctx: any = {}
  const { xer, name, uid } = effect
  const p = new Project()
  p.name = name

  return projects
    .create(p)
    .then(project => {
      ctx.project = project
      return userRepository.addProject(uid, project, {})
    })
    .then(() => {
      return new ParseXerCommand(new XerParser(xer), XerFormatter).execute()
    })
    .then(xerJson => {
      return new UpsertSchedule(ctx.project.scheduleId, db, xerJson).execute()
    })
}

function getById(db, effect: IGetByIdEffect): Promise<void> {
  const { id, collection } = effect as IGetByIdEffect

  if (!id) {
    return Promise.reject(new Error('Id is required'))
  }

  if (!collection) {
    return Promise.reject(new Error('Collection is required'))
  }

  return db
    .child(collection)
    .orderByKey()
    .equalTo(id)
    .once('value')
    .then(snapshot => {
      if (!snapshot.exists()) {
        throw new Error(`No record in ${collection} with id of ${id} found`)
      }
      return getFirstPair(snapshot)
    })
}

function getAll(db, effect: IGetAllEffect): Promise<void> {
  const { collection } = effect as IGetAllEffect
  if (!collection) {
    throw new Error('Collection is required')
  }

  return db
    .child(collection)
    .once('value')
    .then(snapshot => {
      if (!snapshot.exists()) {
        throw new Error(`No data found for collection named ${collection}`)
      }

      return snapshot.toJSON()
    })
}
