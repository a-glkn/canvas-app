import React, { useState } from 'react';
import useStore from '../../store';
import classNames from 'classnames';
import { RGBtoInline } from '../../helpers'

import { SwatchesPicker } from 'react-color';
import Colorpickr from '@mapbox/react-colorpickr'
import config from '../../config';


const ColorPicker = ({styles, onChangeSwathes, onChangePicker, color}) => {
  const [ mode, setMode ] = useState('swatches');

  const handleMount = picker => {
    picker.overrideValue(color);
  };

  return (
    <>
      <div className="color-picker" style={ styles }>
        {
          mode === 'swatches' ? <SwatchesPicker 
            width={240} 
            height={177} 
            onChangeComplete={onChangeSwathes}
          /> : <Colorpickr onChange={onChangePicker}  initialValue={color} mounted={handleMount} />
        }
        <div>
          <button className="color-picker__toggler btn btn--grey btn--s" onClick={() => {
            setMode( mode === 'swatches' ? 'picker' : 'swatches');
          }}>переключить</button>
        </div>
      </div>
    </>
  );
};


export default ({textRef}) => {
  const objectPrototypes = { ...config.objectPrototypes }; 

  const [ fontStyle, setFontStyle ] = useState(objectPrototypes.text.attrs.fontStyle);
  const [ textAlign, setTextAlign ] = useState(objectPrototypes.text.attrs.align);
  const [ isColorPicking, setColorPicking ] = useState(false);
  const [ color, setColor ] = useState(objectPrototypes.text.attrs.fill);

  const manipulatingInstance = useStore(state => state.manipulatingInstance);
  const updateObject = useStore(state => state.updateObject);
  const pageNum = useStore(state => state.pageNum);
  const windowHeight = useStore(state => state.windowHeight);
  const selectedGroup = useStore(state => state.selectedGroup);
  const editingObject = useStore(state => state.editingObject);
  const getSelected = useStore(state => state.getSelected);
  const getObject = useStore(state => state.getObject);
  const selectedObject = getSelected();

  if( !selectedObject && (selectedObject || !editingObject || !selectedGroup) )
    return(<></>);

  const workingObject = ( ! selectedObject && editingObject) ? getObject(editingObject) : selectedObject; 

  const { ID } = workingObject;


  const isManipulating = !!manipulatingInstance;
  const textarea = textRef.current;

  const clientRect = workingObject.attrs.clientRect;
  const heightOffset = (windowHeight - document.querySelector('.canvas').clientHeight) / 2 + (pageNum * windowHeight);
  const widthOffset = (document.querySelector('.stage').clientWidth - document.querySelector('.canvas').clientWidth - 20) / 2 ;

  const fromTop = clientRect.y + clientRect.height + 30 + heightOffset;
  const fromLeft = clientRect.x + clientRect.width - 226 + widthOffset; // 234 - width of container


  const computedStyle = {
    top: fromTop,
    left: fromLeft
  };


  function handleSwacthesChange(color, event) {
    const RgbInlineStyle = RGBtoInline(color.rgb);
    
    textarea.style.color = RgbInlineStyle;

    updateObject(ID, {
      ...workingObject,
      attrs: {
        ...workingObject.attrs,
        fill: RgbInlineStyle
      }
    });

    setColor(RgbInlineStyle);
  }

  function handlePickerChange(color) {
    const rgba = {
      r: color.r,
      g: color.g,
      b: color.b,
      a: color.a
    }
    const RgbInlineStyle = RGBtoInline(rgba);

    textarea.style.color = RgbInlineStyle;

    updateObject(ID, {
      ...workingObject,
      attrs: {
        ...workingObject.attrs,
        fill: RgbInlineStyle
      }
    });

    setColor(RgbInlineStyle);
  }

  function handleOutsideClick(e) {
    const textToolbar = document.querySelector('.text-toolbar');
    const colorPicker = document.querySelector('.color-picker');

    var isToolbar = e.target === textToolbar || (textToolbar && textToolbar.contains(e.target));
    var isColorPicker = e.target === colorPicker || (colorPicker && colorPicker.contains(e.target));

    if (!isToolbar && !isColorPicker) {
      setColorPicking(false);

      window.removeEventListener('mousedown', handleOutsideClick);

    }
  }

  function _getAlignProps(align) {
    return {
      className: classNames({
        'text-toolbar__action': true,
        'text-toolbar__action_active': textAlign === align
      }),
    
      onClick: () => {
        textarea.style.textAlign = align;
  
        updateObject(ID, {
          ...workingObject,
          attrs: {
            ...workingObject.attrs,
            align: align
          }
        });
  
        setTextAlign(align);
      }
    };
  }

  function _getFontStyleProps(style) {
    return {
      className: classNames({
        'text-toolbar__action': true,
        'text-toolbar__action_active': fontStyle === style
      }),

      onClick: () => {
        const newFontStyle = fontStyle === style ? 'normal' : style;

        if(style === 'bold') {
          textarea.style.fontWeight = newFontStyle;
        }
        else{
          textarea.style.fontStyle = newFontStyle;
        }

        updateObject(ID, {
          ...workingObject,
          attrs: {
            ...workingObject.attrs,
            fontStyle: newFontStyle
          }
        });

        setFontStyle(newFontStyle);
      }
    };
  }
  

  return(
    <>
      {
        workingObject && isColorPicking && !isManipulating && <ColorPicker styles={{
            top: fromTop + 34 + 10,
            left: fromLeft
          }} 
          color={color}
          onChangeSwathes={handleSwacthesChange}
          onChangePicker={handlePickerChange}
        />
      }

      {workingObject.type === "text" && !isManipulating && <div className="text-toolbar" style={ computedStyle }>
          <div 
            className={classNames({
              'text-toolbar__action': true,
              'text-toolbar__action_color': true
            })}
            onClick={ () => {
              setColorPicking(!isColorPicking);

              window.addEventListener('mousedown', handleOutsideClick);
            }}
          >

          </div>

          <div {..._getFontStyleProps('bold')}>
            B
          </div>
          <div  {..._getFontStyleProps('italic')}>
            I
          </div>

          <div {..._getAlignProps('left')}>
            Л
          </div>
          <div {..._getAlignProps('center')}>
            Ц
          </div>
          <div {..._getAlignProps('right')}>
            П
          </div>
      </div>}
    </>
  );
};