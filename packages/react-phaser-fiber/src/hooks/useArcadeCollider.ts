import { Scene } from 'phaser'
import { useLayoutEffect, useMemo, useCallback } from 'react'
import { findGameObjectsByName } from '../utils'
import { useScene } from './useScene'
import { useSceneEvent } from './useSceneEvent'
import { toArray } from '../utils/toArray'

export type ArcadeColliderObject =
  | Phaser.GameObjects.GameObject
  | Phaser.Physics.Arcade.Group
  | string

/**
 * Creates a collider between objects or arrays of objects. If provided values are strings, it will
 * search for all objects by that name in the scene.
 */
export function useArcadeCollider<
  T1 extends ArcadeColliderObject,
  T2 extends ArcadeColliderObject
>(
  obj1: T1 | T1[],
  obj2: T2 | T2[],
  args: {
    overlapOnly?: boolean
    onCollide: (
      obj1: T1 extends string ? any : T1,
      obj2: T2 extends string ? any : T2
    ) => any
    onProcess?: (
      obj1: T1 extends string ? any : T1,
      obj2: T2 extends string ? any : T2
    ) => boolean
  }
) {
  const { onCollide, onProcess, overlapOnly } = args
  const scene = useScene()

  const collider = useMemo(
    () =>
      scene.physics.add.collider(
        createObjectsArray(scene, obj1),
        createObjectsArray(scene, obj2),
        onCollide,
        onProcess
      ),
    []
  )

  // destroy collider on unmount
  useLayoutEffect(() => {
    return () => {
      collider.destroy()
    }
  }, [])

  // it is much more performant to update the collider via mutations
  // rather than destroy() and recreate in the above useLayoutEffect
  useLayoutEffect(() => {
    collider.object1 = createObjectsArray(scene, obj1)
    collider.object2 = createObjectsArray(scene, obj2)
  }, [...toArray(obj1), ...toArray(obj2)])

  // update callback refs
  useLayoutEffect(() => {
    collider.collideCallback = onCollide
    collider.processCallback = onProcess
    collider.overlapOnly = overlapOnly
  }, [onCollide, onProcess, overlapOnly])

  // update string references in obj1/obj2 when a child is added to the scene
  useSceneEvent(
    'CHILD_ADDED',
    useCallback(
      (object: Phaser.GameObjects.GameObject) => {
        if (object.name) {
          const obj1Strings = toArray(obj1).filter(
            obj => typeof obj === 'string'
          ) as string[]

          const obj2Strings = toArray(obj2).filter(
            obj => typeof obj === 'string'
          ) as string[]

          if (obj1Strings.includes(object.name)) {
            collider.object1 = [...(collider.object1 as any[]), object]
          }

          if (obj2Strings.includes(object.name)) {
            collider.object2 = [...(collider.object2 as any[]), object]
          }
        }
      },
      [...toArray(obj1), ...toArray(obj2)]
    )
  )
}

/**
 * Returns the gameobject instances for any objects that are string references
 */
function createObjectsArray(
  scene: Scene,
  objects: ArcadeColliderObject | ArcadeColliderObject[]
) {
  return toArray(objects).reduce(
    (total: Phaser.GameObjects.GameObject[], object) => {
      if (typeof object === 'string') {
        return [...total, ...findGameObjectsByName(scene, object)]
      }

      return [...total, object]
    },
    []
  ) as Phaser.GameObjects.GameObject[]
}
