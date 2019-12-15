import React, { Component } from 'react'
import ListHeader from './lib/ListHeader'
import ListItems from './lib/ListItems'
import PropTypes from 'prop-types'

export default class ReactListView extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    headerAttName: PropTypes.string.isRequired,
    itemsAttName: PropTypes.string.isRequired,
    styles: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      events: ['scroll', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll', 'resize', 'touchmove', 'touchend'],
      _firstChildWrapper: '',
      _headerFixedPosition: '',
      _headers: {}
    }

 
    this.listView = React.createRef();
  }

  componentDidMount() {
    this.initStickyHeaders()
  }

  componentWillUnmount() {
    // unRegister events listeners with the listview div
    this.state.events.forEach((type) => {
      if (window.addEventListener) {
        this.listView.current.removeEventListener(type, this.onScroll.bind(this), false)
      } else {
        this.listView.current.detachEvent('on' + type, this.onScroll.bind(this), false)
      }
    })
  }

  refsToArray(ctx, prefix) {
    let results = []
    for (let i = 0; ; i++) {
      let ref = ctx.refs[prefix + '-' + String(i)]
      if (ref) results.push(ref)
      else return results
    }
  }

  initStickyHeaders() {
    let listHeaders = this.refsToArray(this, 'ListHeader')
    let _originalPositions = listHeaders.map((l) => {
      let headerAndPosInfo = {
        headerObj: l,
        originalPosition: l.refs.header.getBoundingClientRect().top
      }
      return headerAndPosInfo
    })
    this.setState({
      _headers: _originalPositions,
      _firstChildWrapper: listHeaders[0].refs.followWrap,
      _headerFixedPosition: listHeaders[0].refs.header.getBoundingClientRect().top
    })

    // Register events listeners with the listview div
    this.state.events.forEach((type) => {
      if (window.addEventListener) {
        this.listView.current.addEventListener(type, this.onScroll.bind(this), false)
      } else {
        this.listView.current.attachEvent('on' + type, this.onScroll.bind(this), false)
      }
    })
  }

  onScroll() {
    let currentWindowScrollTop = this.state._headerFixedPosition - this.state._firstChildWrapper.getBoundingClientRect().top
    this.state._headers.forEach((c, index, arr) => {
      const currentHeader = c.headerObj.refs.header
      const currentHeaderHeight = parseInt(currentHeader.style.height, 10)
      const nextNode = (index < arr.length - 1) ? arr[index + 1] : null;
 
      let ignoreCheck = false
      if (index === 0) {
        if (currentWindowScrollTop === c.originalPosition) {
          currentHeader.style.position = ''
          ignoreCheck = true
        }
      }
      if (!ignoreCheck && (c.originalPosition) < (currentWindowScrollTop + this.state._headerFixedPosition + index * currentHeaderHeight)) {
        Object.assign(currentHeader.style, this.props.styles.fixedPosition)
        // apply top value
        currentHeader.style.top = `${this.state._headerFixedPosition}px`
        if (currentWindowScrollTop + index * currentHeaderHeight > nextNode.originalPosition) {
          currentHeader.style.position = 'absolute'
        }
      } else {
        currentHeader.style.position = ''
      }
    })
  }

  render() {
    const { data, headerAttName, itemsAttName } = this.props
    const { styles: { outerDiv, ul, listHeader, listItems, li } } = this.props
    let _refi = 0
    let makeRef = () => {
      return `ListHeader-${_refi++}`
    }

    return (
      <div ref={this.listView} style={outerDiv}>
        <ul style={ul}>
          {
            Object.keys(data).map((k) => {
              const header = data[k][headerAttName]
              const items = data[k][itemsAttName]
              return (
                <li key={k}>
                  <ListHeader
                    ref={makeRef()}
                    header={header}
                    styles={listHeader}
                  />
                  <ListItems
                    items={items}
                    styles={listItems}
                  />
                </li>
              )
            })
          }
        </ul>
      </div>
    )
  }
}
