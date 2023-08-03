import React, { useRef, useEffect } from 'react';
import { Text } from 'react-konva';

import BaseObject from './BaseObject';

import useStore from '../../store';


const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
const isEdge = document.documentMode || /Edge/.test(navigator.userAgent);


export default (props) => {
  const editingObject = useStore(state => state.editingObject);
  const setEditing = useStore(state => state.setEditing);
  const updateObject = useStore(state => state.updateObject);
  const pageNum = useStore(state => state.pageNum);
  const height = useStore(state => state.height);
  const setSelected = useStore(state => state.setSelected);
  const windowHeight = useStore(state => state.windowHeight);
  const canvasScale = useStore(state => state.canvasScale);

  

  const { dataObject, textRef, groupTrRef } = props;
  const { attrs, ID } = dataObject;
  const ref = useRef();
  const trRef = useRef();

  const isEditing = ID === editingObject;
  

  function handleOutsideClick(e) {
    if(!isEditing)
      return;

    const textToolbar = document.querySelector('.text-toolbar');
    const colorPicker = document.querySelector('.color-picker');

    var isToolbar = e.target === textToolbar || (textToolbar && textToolbar.contains(e.target));
    var isColorPicker = e.target === colorPicker || (colorPicker && colorPicker.contains(e.target));
      

    const textarea = textRef.current;

    //Клик вне textarea 
    //TODO: пофиксить баги текста
    if (e.target !== textarea && !isToolbar && !isColorPicker) {

      if(textarea.value !== attrs.text) {
        updateObject(ID, {
          ...dataObject,
          attrs: {
            ...attrs,
            text: textarea.value
          }
        });
      }

      _removeTextarea();
    }
  };
  

  function handleKeyboardKeydown(e) {
    if(!isEditing)
      return;

    const textarea = textRef.current;

    // hide on enter, don't hide on shift + enter || esc
    if ( (e.keyCode === 13 && !e.shiftKey) || (e.keyCode === 27) ) {

      if(textarea.value !== attrs.text) {
        updateObject(ID, {
          ...dataObject,
          attrs: {
            ...attrs,
            text: textarea.value,
            width: textarea.scrollWidth,
            height: textarea.scrollHeight
          }
        });
      }
      
      _removeTextarea();
    }
  }

  function handleDblclick(e) {
    if(isEditing)
      return;

    setEditing(ID);

    console.log('Dblclick');
    
    let tr;
    if(trRef && trRef.current) {
      tr = trRef.current;
      tr.hide();
    }

    const textNode = ref.current;
    const layer = textNode.getLayer()
    const scale = textNode.getAbsoluteScale().x;
    const textarea = textRef.current;


    textNode.hide();
    layer.draw();

    const textPosition = textNode.absolutePosition();

    const areaPosition = {
      x: textPosition.x + 13,
      y: textPosition.y -3
    };
    

    const heightOffset = (windowHeight - document.querySelector('.canvas').clientHeight) / 2 + (pageNum * windowHeight);
    const widthOffset = (document.querySelector('.stage').clientWidth - document.querySelector('.canvas').clientWidth - 20) / 2 ;

    //TODO: разобраться со стилями
    textarea.value = textNode.text();
    textarea.style.display = 'block';
    textarea.style.position = 'absolute';
    textarea.style.top = heightOffset + areaPosition.y + 'px';
    textarea.style.left = widthOffset + areaPosition.x + 'px';
    textarea.style.width = textNode.width() + 'px';
    textarea.style.height = textNode.height() + 'px';
    textarea.style.fontSize = textNode.fontSize() * canvasScale + 'px';
    textarea.style.border = '2px solid grey';
    textarea.style.padding = '0px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = textNode.fontSize() * canvasScale * 1.2 + 'px';
    textarea.style.fontFamily = textNode.fontFamily();
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = textNode.align();
    textarea.style.color = textNode.fill();


    //TODO: Сделать подстройку высоты
    _setTextareaWidth(textNode.width() * scale);
    
    const rotation = textNode.rotation();
    let transform = '';
    if (rotation) {
      transform += 'rotateZ(' + rotation + 'deg)';
    }

    let px = 0;
    if (isFirefox) {
      px += 2 + Math.round(textNode.fontSize() / 20);
    }
    transform += 'translateY(-' + px + 'px)';

    textarea.style.transform = transform;

    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 3 + 'px';

    textarea.focus();
  }

  function _showTransformer() {

    if(!trRef || !trRef.current) {
      return;
    }

    const tr = trRef.current;

    tr.show();
    tr.forceUpdate();
    tr.getLayer().batchDraw();
  }

  function _drawGroupTransformer() {

    if(!groupTrRef || !groupTrRef.current) {
      return;
    }

    const groupTr = groupTrRef.current;

    groupTr.width(500);
    console.log(groupTr.height());
    console.log();
    groupTr.forceUpdate();
    groupTr.getLayer().batchDraw();
  }


  

  function _removeTextarea() {
    if(!isEditing)
      return;

    setEditing(null);

    const textNode = ref.current;
    const textarea = textRef.current;
    
    textarea.style.display = 'none';

    if(textNode) {
      textNode.show();
      textNode.getLayer().batchDraw();
    }

    // _showTransformer();
  }

  function _setTextareaWidth(newWidth) {
    const textarea = textRef.current;

    if (isSafari || isFirefox) {
      newWidth = Math.ceil(newWidth);
    }
    if (isEdge) {
      newWidth += 1;
    }

    textarea.style.width = newWidth + 'px';
  }

  function _adjustTextareaSize(e) {
    const textarea = textRef.current;
    const textNode = ref.current;

    let scale = textNode.getAbsoluteScale().x;
    _setTextareaWidth(textNode.width() * scale * canvasScale);
    textarea.style.height = 'auto';
    textarea.style.height =
      textarea.scrollHeight + textNode.fontSize() * canvasScale + 'px';
  }
  

  useEffect(() => {
    const textarea = textRef.current;

    textarea.addEventListener('keydown', _adjustTextareaSize);
    textarea.addEventListener('keydown', handleKeyboardKeydown);
    window.addEventListener('mousedown', handleOutsideClick);
    
    return () => {
      textarea.removeEventListener('keydown', _adjustTextareaSize);
      textarea.removeEventListener('keydown', handleKeyboardKeydown);
      window.removeEventListener('mousedown', handleOutsideClick);
    }
  });


  return (
    <>
      <BaseObject
          component={ Text }
          ref={ ref }
          trRef={ trRef }
          { ...props }
          onDblclick={ handleDblclick }
      />
    </>
  );
}