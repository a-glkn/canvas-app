import React from 'react';
import useStore from '../../store';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip'

const Handle = Slider.Handle;

const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      prefixCls="rc-slider-tooltip"
      overlay={value}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle value={value} {...restProps} />
    </Tooltip>
  );
};

export default () => {
  const manipulatingInstance = useStore(state => state.manipulatingInstance);
  const deleteObject = useStore(state => state.deleteObject);
  const getSelected = useStore(state => state.getSelected);
  const upObject = useStore(state => state.upObject);
  const downObject = useStore(state => state.downObject);
  const flipVerticalObject = useStore(state => state.flipVerticalObject);
  const flipHorizontalObject = useStore(state => state.flipHorizontalObject);
  const selectedObject = getSelected();
  const isManipulating = !!manipulatingInstance;
  const pageNum = useStore(state => state.pageNum);
  const windowHeight = useStore(state => state.windowHeight);
  const updateObject = useStore(state => state.updateObject);
  const selectedGroup = useStore(state => state.selectedGroup);
  const editingObject = useStore(state => state.editingObject);
  const getObject = useStore(state => state.getObject);
  const duplicateObject = useStore(state => state.duplicateObject);

  ///Правила для показа тулбара при изменении текста в группе
  // if( !selectedObject && (selectedObject || !editingObject || !selectedGroup) )
  //   return(<></>);

  // const workingObject = ( ! selectedObject && editingObject) ? getObject(editingObject) : selectedObject; 


  if( !selectedObject )
    return(<></>);

  const workingObject  = selectedObject;


  const clientRect = workingObject.attrs.clientRect;
  const heightOffset = (windowHeight - document.querySelector('.canvas').clientHeight) / 2 + (pageNum * windowHeight);
  const widthOffset = (document.querySelector('.stage').clientWidth - document.querySelector('.canvas').clientWidth - 20) / 2 ;


  const computedStyle = {
    top: clientRect.y + heightOffset,
    left: clientRect.x + 11  + widthOffset + clientRect.width + 20
  };


  function toggleInner(e) {
    const inner = e.target.querySelector('.toolbar__action-inner');

    if( ! inner)
      return;

    const displayStyle =  inner.style.display;

    inner.style.display = displayStyle && displayStyle === 'block' ? 'none' : 'block';
  }

  function handleOpacitySliderChange(value) {
    const object = {...workingObject};
    const attrs = {...object.attrs};
    attrs.opacity = value / 100;

    object.attrs = attrs;

    updateObject(workingObject.ID, {...object}, true);
  }

  function handleOpacitySliderAfterChange(value) {
    const object = {...workingObject};
    const attrs = {...object.attrs};
    attrs.opacity = value / 100;

    object.attrs = attrs;

    updateObject(workingObject.ID, {...object});
  }

  
  return(
    <>
      {!isManipulating && <div className="toolbar" style={ computedStyle }>
        <div className="toolbar__action toolbar__action_delete" 
          onClick={deleteObject}>
          У
        </div>

        { workingObject.type !== "text" && 
          <>
            <div className="toolbar__action" 
              onClick={flipVerticalObject}>
                ⇅
            </div>

            <div className="toolbar__action" 
              onClick={flipHorizontalObject}>
                ⇄
            </div>          
          </>
        }

        <div className="toolbar__action" 
          onClick={upObject}>
          ↑
        </div>

        <div className="toolbar__action" 
          onClick={downObject}>
          ↓
        </div>

        <div className="toolbar__action" 
          onClick={toggleInner} title="Изменить прозрачность">
          П

          <div className="toolbar__action-inner">
            <Slider min={0} max={100} defaultValue={100} onChange={handleOpacitySliderChange} onAfterChange={handleOpacitySliderAfterChange} handle={handle} />
          </div>
        </div>

        <div className="toolbar__action" 
          onClick={duplicateObject} title="Дублировать">
          Д
        </div>
      </div>}
    </>
  );
};
