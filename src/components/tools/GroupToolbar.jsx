import React from 'react';
import useStore from '../../store';


export default () => {
  const manipulatingInstance = useStore(state => state.manipulatingInstance);
  const deleteGroup = useStore(state => state.deleteGroup);
  const ungroupObjects = useStore(state => state.ungroupObjects);
  const selectedGroup = useStore(state => state.selectedGroup);
  const isManipulating = !!manipulatingInstance;
  const pageNum = useStore(state => state.pageNum);
  const windowHeight = useStore(state => state.windowHeight);


  if(!selectedGroup)
    return(<></>);


  const heightOffset = (windowHeight - document.querySelector('.canvas').clientHeight) / 2 + (pageNum * windowHeight);
  const widthOffset = (document.querySelector('.stage').clientWidth - document.querySelector('.canvas').clientWidth - 20) / 2 ;


  const computedStyle = {
    top: 0 + heightOffset,
    left: widthOffset - 34
  };

  
  return(
    <>
      {!isManipulating && <div className="toolbar" style={ computedStyle }>
        <div className="toolbar__action toolbar__action_delete" 
          onClick={deleteGroup}>
          У
        </div>

        <div className="toolbar__action" 
          onClick={ungroupObjects} title="Разгруппировать">
          Р
        </div>
      </div>}
    </>
  );
};
