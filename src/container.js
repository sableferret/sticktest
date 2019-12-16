import React, { useEffect } from 'react';

import ListHeader from './ListHeader'
import ListItems from './ListItems'

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
            _firstChildWrapper: firstHeaderObj ? firstHeaderObj.refs.headerContainer : null,
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
          const headerHeight = parseInt(currentHeader.style.height, 10)
          const nextNode = (index < arr.length - 1) ? arr[index + 1] : null;
     
          if (c.originalPosition < (currentWindowScrollTop + _headerFixedPosition + index * headerHeight)) {
            Object.assign(currentHeader.style, props.styles.fixedPosition)
            // apply top value
            currentHeader.style.top = `${_headerFixedPosition}px`

          } else {
            currentHeader.style.position = '';
            currentHeader.style.top = '';
          }
        })
    };

    let _refIndex = 0
    let makeRef = (elem) => {
        headerRefs[`ListHeader-${_refIndex++}`] = elem;
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