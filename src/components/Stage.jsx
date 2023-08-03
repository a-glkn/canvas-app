import React, { useEffect, useRef, createRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { isArray } from 'lodash'


import BaseGroup from './BaseGroup';
import ImageObject from './objects/ImageObject';
import ShapeObject from './objects/ShapeObject';
import TextObject from './objects/TextObject';


import PropTypes from 'prop-types';

import useStore from '../store';

const StageComponent = ({objects, textRef}) => {
  const stageRef = useRef();
  const setSelected = useStore(state => state.setSelected);
  const setSelectedGroup = useStore(state => state.setSelectedGroup);
  const splitObjectsIntoGroups = useStore(state => state.splitObjectsIntoGroups);
  const getCanvasWidth = useStore(state => state.getCanvasWidth);
  const getCanvasHeight = useStore(state => state.getCanvasHeight);
  const canvasHeight = useStore(state => state.canvasHeight);

  const canvasScale = useStore(state => state.canvasScale);
  const adjustCanvasScale = useStore(state => state.adjustCanvasScale);

  const splittedObjects = splitObjectsIntoGroups(objects);

  
  function handleStageMouseDown(e) {
    const clickedOnEmpty = e.target === e.target.getStage();
    
    if (clickedOnEmpty) {
      setSelected(null);
      setSelectedGroup(null);
    }
  }

  function _getComponent(type) {
    let Component;

    switch (type) {
      case 'shape':
        Component = ShapeObject;
        break;
      case 'text':
        Component = TextObject;
        break;
      case 'image':
        Component = ImageObject;
        break;
      default:
        Component = ShapeObject;
    }

    return Component;
  }
  
  function _prepareOutput() {
    const out = [];

    if( ! splittedObjects)
      return;
    
    splittedObjects.forEach((item, indx) => {
      let Component;

      if( isArray(item) ) {
        const group = [];
        let groupID;

        let grRef = createRef();

        item.forEach((el, i) => {
          Component = _getComponent(el.type);

          groupID = el.group;

          group.push(<Component
            key={ `object-${indx}-${i}` }
            dataObject={ el }
            groupTrRef={ grRef }
            textRef={ el.type === 'text' ? textRef : null }
          />);
          
        });

        // const groupAttrs = objects[1].find(el => el.group === groupID)

        out.push(
          <BaseGroup 
            key={ `group-${indx}` }
            groupID={ groupID }
            groupTrRef={ grRef }
            // {...groupAttrs.attrs}
          >
            { group.map(el => el) }
          </BaseGroup>
        );
      }
      else {
        Component = _getComponent(item.type);

        out.push(<Component
          key={ `object-${indx}` }
          draggable
          dataObject={ item }
          textRef={ item.type === 'text' ? textRef : null }
        />);
      }
    });

    return out;
  }



  useEffect(() => {
    adjustCanvasScale();

    window.addEventListener('resize', adjustCanvasScale);

    return () => {
      window.removeEventListener('resize', adjustCanvasScale);
    }
  }, []);
    

  return (
    <>
      <Stage
        ref={ stageRef }
        width={ getCanvasWidth() * canvasScale }
        height={ getCanvasHeight()  * canvasScale}
        scaleX={ canvasScale }
        scaleY={ canvasScale }
        className="canvas"
        onMouseDown={ handleStageMouseDown }
      >
        <Layer>
          { _prepareOutput() }
        </Layer>
      </Stage>
    </>
  );
};


StageComponent.propTypes = {
  objects: PropTypes.array.isRequired
};


export default StageComponent;