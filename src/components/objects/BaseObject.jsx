import React, { forwardRef, useEffect, useRef } from 'react';

import { v4 as uuidv4 } from 'uuid';

import BaseTransformer from '../BaseTransformer';
import useStore from '../../store';
import config from '../../config';


//Базовый объект, вынесем сюда все общие параметры
export default forwardRef((props, ref) => {
  const { component, dataObject, groupTrRef, ...restProps } = props;
  const { attrs, ID, group } = dataObject;
  const Component = component;
  const isTextObject = !!props.trRef; 
  const trRef = isTextObject ? props.trRef : useRef();

  const isSelected = dataObject.selected;

  const setManipulating = useStore(state => state.setManipulating);
  const updateObject = useStore(state => state.updateObject);
  const getSelected = useStore(state => state.getSelected);
  const setSelected = useStore(state => state.setSelected);
  const selectedGroup = useStore(state => state.selectedGroup);
  const setSelectedGroup = useStore(state => state.setSelectedGroup);
  const isObjectGrouped = useStore(state => state.isObjectGrouped);
  const getObjectIdsOfGroup = useStore(state => state.getObjectIdsOfGroup);
  const groupObjects = useStore(state => state.groupObjects);
  const canvasScale = useStore(state => state.canvasScale);


  function handleTransform(e) {
    const node = ref.current;
    const w = node.width();
    const h = node.height();
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const imageFlippedHorizontally = scaleX < 0;

    const offsetX = (imageFlippedHorizontally) ? node.offsetX() * Math.abs(scaleX) : node.offsetX();
    

    node.scaleX(imageFlippedHorizontally ? -1 : 1);
    node.scaleY(1);

    if(imageFlippedHorizontally) {
      node.offsetX(offsetX);
    }

    const newAttrs = {
      ...attrs,
      width: Math.abs(w * scaleX),
      height: Math.abs(h * scaleY),
      x: node.x(),
      y: node.y(),
      offsetX,
      clientRect: node.getClientRect()
    };

    updateObject(ID, {
      ...dataObject,
      attrs: newAttrs
    }, true);

    setManipulating(ID);
  }

  function handleTransformEnd(e) {
    const node = ref.current;

    const newAttrs = {
      width: node.width(),
      height: node.height(),
      rotation: node.rotation(),
      x: node.x(),
      y: node.y(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
      offsetX: node.offsetX(),
      offsetY: node.offsetY(),
      clientRect: node.getClientRect()
    };
              
    updateObject(ID, {
      ...dataObject,
      attrs: {
        ...attrs,
        ...newAttrs
      }
    });

    setManipulating(null);
  }

  function _setStroke(bool) {

    const strokeWidth = config.strokeWidth / canvasScale; 

    if(!!dataObject.attrs.strokeWidth !== bool) {
      updateObject(ID, {
        ...dataObject,
        attrs: {
          ...attrs,
          strokeWidth: bool ? strokeWidth : 0
        }
      });
    }
  }

  function handleDragStart(e) {
    setManipulating(ID);
  }

  function handleDragEnd(e) {
    updateObject(ID, {
      ...dataObject,
      attrs: {
        ...attrs,
        x: e.target.x(),
        y: e.target.y(),
        clientRect: e.target.getClientRect()
      }
    });

    setManipulating(null);
  }

  function handleObjectClick(e) {
    if( !e.evt.shiftKey) {
      setSelected(null);
      setSelectedGroup(null);
      setSelected(ID);
      

      updateObject(ID, {
        ...dataObject,
        attrs: {
          ...attrs,
          strokeWidth: 0,
          clientRect: e.target.getClientRect()
        }
      });

      return;
    }

    const selectedObject = getSelected();
    let objectsToGroup = [];
    let groupID;

    if(selectedGroup) {
      //Группа
      const groupedObjectsGroupID = isObjectGrouped(ID);
      objectsToGroup = getObjectIdsOfGroup(selectedGroup);

      if( groupedObjectsGroupID ) {
        //+ Группа
        // groupID = groupedObjectsGroupID;
        // objectsToGroup = objectsToGroup.concat( getObjectIdsOfGroup(groupedObjectsGroupID) );
        return;
      } else {
        //+ Объект
        groupID = selectedGroup;
        objectsToGroup.push(ID);
      }
      
    } else if(selectedObject) {
      // Объект
      if(selectedObject.ID === ID)
        return;

      const groupedObjectsGroupID = isObjectGrouped(ID);

      if( groupedObjectsGroupID ) {
        //+ Группа
        groupID = groupedObjectsGroupID;
        objectsToGroup = objectsToGroup.concat( getObjectIdsOfGroup(groupedObjectsGroupID) );
      } else {
        //+ Объект
        groupID = uuidv4();
        objectsToGroup.push(ID);
      }

      objectsToGroup.push(selectedObject.ID);
    } 

    groupObjects(objectsToGroup, groupID);
  }

  function handleMouseenter(e) {
    const selectedObject = getSelected();

    if(!selectedObject) {
      _setStroke(true);
      return;
    } 
     
    if(selectedObject.ID !== ID) {
      _setStroke(true);
    }
  }

  function handleMouseleave(e) {
    const selectedObject = getSelected();
    
    if(!selectedObject) {
      _setStroke(false);
      return;
    } 
     
    if(selectedObject.ID !== ID) {
      _setStroke(false);
    }

  }


  useEffect(() => {
    if (isSelected) {
      trRef.current.setNode(ref.current);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, ref, trRef]);

  useEffect(() => {
    const node = ref.current;

    const newAttrs = {
      clientRect: node.getClientRect()
    };
              
    updateObject(ID, {
      ...dataObject,
      attrs: {
        ...attrs,
        ...newAttrs
      }
    });
  }, [ref]);

  const attrsObj = {...attrs};

  return (
    <>
        <Component 
            ref={ ref }
            onClick={ handleObjectClick }
            onDragStart={ handleDragStart }
            onDragEnd={ handleDragEnd }
            onTransform={ handleTransform }
            onTransformEnd={ handleTransformEnd }
            onMouseenter={handleMouseenter}
            onMouseleave={handleMouseleave}
            groupTrRef={groupTrRef}
            { ...attrsObj }
            
            { ...restProps }
        />

        { isSelected &&  <BaseTransformer trRef={trRef} isText={isTextObject}/>}
    </>
  );
});