import React from 'react'

const ListHeader = React.forwardRef((props, ref) => {
    const { header, styles } = props;
    const { innerRef, outerRef } = ref;
    return (
      <div ref={outerRef}>
        <div ref={innerRef} style={styles}>{header}</div>
      </div>
    )
});

export default ListHeader;