import React, { useEffect, useRef } from 'react';

import { Group } from 'react-konva';
import BaseTransformer from './BaseTransformer';

import useStore from '../store';


export default (props) => {
  const { groupID, groupTrRef } = props;
  const setSelectedGroup = useStore(state => state.setSelectedGroup);
  const selectedGroup = useStore(state => state.selectedGroup);
  const setManipulating = useStore(state => state.setManipulating);
  const updateGroup = useStore(state => state.updateGroup);

  const isGroupSelected = selectedGroup === groupID;

  const ref = useRef();
  const trRef = groupTrRef;

  // console.log('BaseGroup');

  function handleTransformEnd(e) {
    // console.log(e.target.children);
    updateGroup(groupID, e.target.attrs, e.target.children);
    setManipulating(null);
  }

  function handleTransform(e) {
    setManipulating(groupID);
  }

  function handleGroupClick(e) {
    setSelectedGroup(groupID);
  }

  function handleDragStart(e) {
    setManipulating(groupID);
  }

  function handleDragEnd(e) {
    updateGroup(groupID, e.target.attrs, e.target.children);
    setManipulating(null);
  }


  useEffect(() => {
    if (isGroupSelected) {
      trRef.current.setNode(ref.current);
      trRef.current.getLayer().batchDraw();
    }
  }, [isGroupSelected]);


  return(
    <>
      <Group 
        ref={ ref }
        draggable
        onDragStart={ handleDragStart }
        onDragEnd={ handleDragEnd }
        onClick={ handleGroupClick }
        onTransform={ handleTransform }
        onTransformEnd={ handleTransformEnd }
        // {...props}
      >
      { props.children }
      </Group>

      { isGroupSelected &&  <BaseTransformer trRef={trRef} />}
    </>
  );
};
    