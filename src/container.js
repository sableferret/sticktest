import React, { useEffect } from 'react';

import ListHeader from './lib/ListHeader'
import ListItems from './lib/ListItems'

function Container(props) {

    const containerView = React.createRef();
    const containerState = React.createRef();
    const headerRefs = {};
    const events = ['scroll', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll', 'resize', 'touchmove', 'touchend'];

    const initStickyHeaders = () => {

        const headers = Object.getOwnPropertyNames(headerRefs).map(key => {

            const headerObj = headerRefs[key];

            return {
                headerObj,
                originalPosition: headerObj.refs.header.getBoundingClientRect().top
            };
        });

        const firstHeaderObj = headers && headers.length > 0 ? headers[0].headerObj : null;

        containerState.current = {
            _headers: headers,
            _firstChildWrapper: firstHeaderObj ? firstHeaderObj.refs.followWrap : null,
            _headerFixedPosition: firstHeaderObj ? firstHeaderObj.refs.header.getBoundingClientRect().top : 0
        };
    
        // Register events listeners with the listview div
        events.forEach((type) => {
          if (window.addEventListener) {
            containerView.current.addEventListener(type, onScroll, false)
          } else {
            containerView.current.attachEvent('on' + type, onScroll, false)
          }
        })
    }

    useEffect(() => {
        initStickyHeaders();
        return function cleanup() {
            events.forEach((type) => {
                if (window.addEventListener) {
                    containerView.current.removeEventListener(type, onScroll, false)
                } else {
                    containerView.current.detachEvent('on' + type, onScroll, false)
                } 
            });       
        };
    }, []);

    const onScroll = () => {
        const { _headerFixedPosition, _firstChildWrapper, _headers } = containerState.current;
        
        const currentWindowScrollTop = _headerFixedPosition - _firstChildWrapper.getBoundingClientRect().top;
        
        _headers.forEach((c, index, arr) => {
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
          if (!ignoreCheck && (c.originalPosition) < (currentWindowScrollTop + _headerFixedPosition + index * currentHeaderHeight)) {
            Object.assign(currentHeader.style, props.styles.fixedPosition)
            // apply top value
            currentHeader.style.top = `${_headerFixedPosition}px`
            if (currentWindowScrollTop + index * currentHeaderHeight > nextNode.originalPosition) {
              currentHeader.style.position = 'absolute'
            }
          } else {
            currentHeader.style.position = ''
          }
        })
    };

    let _refi = 0
    let makeRef = (elem) => {
        headerRefs[`ListHeader-${_refi++}`] = elem;
    }

    const { data, headerAttName, itemsAttName } = props
    const { styles: { outerDiv, ul, listHeader, listItems, li } } = props

    return (
        <div ref={containerView} style={outerDiv}>
          <ul style={ul}>
            {
              Object.keys(props.data).map((k) => {
                const header = data[k][headerAttName]
                const items = data[k][itemsAttName]
                return (
                  <li key={k}>
                    <ListHeader
                      ref={elem => makeRef(elem)}
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
    );
}

export { Container };