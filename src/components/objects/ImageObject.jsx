import React, { useRef, useEffect } from 'react';
import { Image } from "react-konva";
import useImage from "use-image";

import BaseObject from './BaseObject';


export default (props) => {
  const { dataObject } = props;
  const { url } = dataObject;
  const ref = useRef();
  const [ image ] = useImage(url, "Anonymous");


  useEffect(() => {
    if (!image)
      return;
  }, [image]);


  return (
    <>
      <BaseObject
        component={ Image }
        ref={ ref }
        image={ image } 
        { ...props }
      />
    </>
  );
};
