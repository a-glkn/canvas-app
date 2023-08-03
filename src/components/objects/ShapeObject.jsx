import React, { useRef } from 'react';

import BaseObject from './BaseObject';

export default (props) => {
  const { dataObject } = props;
  const { component } = dataObject;
  const Component = component;

  const ref = useRef();

  return (
    <>
      <BaseObject
        component={ Component }
        ref={ ref }
        { ...props }
      />
    </>
  );
};