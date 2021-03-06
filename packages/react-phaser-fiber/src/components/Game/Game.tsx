import * as Phaser from 'phaser'
import React from 'react'
import { FiberRoot } from 'react-reconciler'
import { PACKAGE_NAME, PhaserFiber, VERSION } from '../../reconciler'
import GameContext from './GameContext'

export interface GameProps extends Phaser.Types.Core.GameConfig {
  children?: JSX.Element | JSX.Element[] | React.ReactNode
}

class Game extends React.Component<GameProps, { booting: boolean }> {
  static displayName = 'Game'
  mountNode: FiberRoot
  game: Phaser.Game

  state = {
    booting: true,
  }

  componentDidMount() {
    const { children, canvas, ...config } = this.props

    this.game = new Phaser.Game({ ...config })

    this.game.events.on('ready', () => {
      this.setState({ booting: false })
    })

    this.mountNode = PhaserFiber.createContainer(this.game, false, false)

    injectDevtools()

    if (process.env.NODE_ENV === 'development') {
      // @ts-ignore
      window.game = this.game
    }

    PhaserFiber.updateContainer(
      this.getChildren(),
      this.mountNode,
      this,
      null as any
    )
  }

  componentDidUpdate() {
    // flush fiber
    PhaserFiber.updateContainer(
      this.getChildren(),
      this.mountNode,
      this,
      null as any
    )
  }

  getChildren() {
    const children = this.state.booting ? null : this.props.children

    return (
      <GameContext.Provider value={this.game}>{children}</GameContext.Provider>
    )
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error(`Error occurred in \`Game\`.`)
    console.error(error)
    console.error(errorInfo)
  }

  componentWillUnmount() {
    PhaserFiber.updateContainer(null, this.mountNode, this, null as any)
    this.game.destroy(true)
  }

  render() {
    return null as JSX.Element
  }
}

export default Game

/**
 * Inject into React Devtools
 */
function injectDevtools() {
  PhaserFiber.injectIntoDevTools({
    bundleType: process.env.NODE_ENV !== 'production' ? 1 : 0,
    version: VERSION,
    rendererPackageName: PACKAGE_NAME,
    findFiberByHostInstance: PhaserFiber.findHostInstance as any,
  })
}
