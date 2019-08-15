import invariant from 'fbjs/lib/invariant'

/**
 * Reserved props
 */
export const PROPS_RESERVED = {
  children: true,
  parent: true,
}

const filterProps = (props: Record<string, any>): Record<string, any> => {
  return Object.keys(props).reduce((filteredProps, key) => {
    if (Object.keys(PROPS_RESERVED).indexOf(key) === -1) {
      return {
        ...filteredProps,
        [key]: props[key],
      }
    }

    return {
      ...filteredProps,
    }
  }, {})
}

export function applyDefaultProps(
  instance: any,
  oldProps: Record<string, any>,
  newProps: Record<string, any>
) {
  invariant(
    Phaser.GameObjects.GameObject.prototype.isPrototypeOf(instance),
    'instance needs to be typeof `Phaser.GameObjects.GameObject`, ' +
      'got `%s`',
    typeof instance
  )

  const props = filterProps(newProps)

  Object.keys(props).forEach(key => {
    instance[key] = props[key]
  })
}