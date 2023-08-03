import { create } from "zustand";
import { v4 as uuidv4 } from 'uuid';
import Konva from 'konva';
import { isEqual } from 'lodash';


import { deleteSelectedFromObjects, deleteSelectedFromPage, getPageNumByChangesInHistory, getWindowSize } from './helpers';

const windowSize = getWindowSize();



const useStore = create((set, get) => ({

  canvasScale: 1,
  setCanvasScale: canvasScale => set({ canvasScale }),

  windowWidth: windowSize.width,
  windowHeight: windowSize.height,
  setWindowSize: ({ width, height }) => {
    set({ windowWidth: width, windowHeight: height })
  },

  canvasWidth: null,
  canvasHeight: null,

  getCanvasWidth: () => get().canvasWidth || get().canvasSizes[get().defaultCanvasSize].width,
  getCanvasHeight: () => get().canvasHeight || get().canvasSizes[get().defaultCanvasSize].height,
  setCanvasSize: ({ width, height }) => {
    set({ canvasWidth: width, canvasHeight: height })
  },


  defaultCanvasSize: 1,
  canvasSizes: [
    {
      label: 'Instagramm story',
      width: 1080,
      height: 1920
    },
    {
      label: 'Working',
      width: 800,
      height: 500
    },
    {
      label: 'Facebook cover',
      width: 850,
      height: 315
    },
    {
      label: 'Twitter header',
      width: 1500,
      height: 500
    }
  ],
  
  
  adjustCanvasScale: () => {
    const realWidth = get().windowWidth - document.querySelector('.left-panel').offsetWidth - document.querySelector('.page-swithcher').offsetWidth - 22; // sidebar + pageSwitcher + 20-padding + 2-border 
    const realHeight = get().windowHeight - 22; // 20-padding + 2-border
    let scale;

    if(get().getCanvasWidth() >= get().getCanvasHeight()) {
      //landscape

      scale = realWidth / get().getCanvasWidth();

      const scaledHeight = scale * get().getCanvasHeight();
      if(scaledHeight >= realHeight) {
        const diff = (scaledHeight - realHeight) / get().getCanvasHeight(); 

        scale -= diff;
      }
      
    } else {
      //portrait

      scale = realHeight / get().getCanvasHeight();

      const scaledWidth = scale * get().getCanvasWidth();
      if(scaledWidth >= realWidth) {
        const diff = (scaledWidth - realWidth) / get().getCanvasWidth(); 

        scale -= diff;
      }
    }

    get().setCanvasScale(scale);
  },

  /////////////

  history: [[[[],[]]]],
  historyStep: 0,

  objects: [[[],[]]],
  
  manipulatingInstance: null, //group or object
  editingObject: null,

  selectedGroup: null,

  pageNum: 0,


  /* history methods */
  getHistoryStep: step => {
    const stepContent = get().history[step];

    return stepContent ? [...stepContent] : null;
  },
  
  updateHistory: (pagesToUpdate, skipChanges = false) => {
    if(skipChanges) {
      return;
    }
    
    const historyStep = get().historyStep;
    const history = [...get().history];
    const newHistory = history.slice(0, historyStep + 1);

    if( isEqual(newHistory[newHistory.length-1], pagesToUpdate) ) {
      // console.log('updateHistory:isEqual');
      return;
    }

    newHistory.push(pagesToUpdate);

    set({
      history: newHistory,
      historyStep: newHistory.length - 1
    });
  },

  undoHistory: () => {
    const historyStep = get().historyStep;
    if (historyStep === 0) {
      return;
    }

    get().setSelected(null);
    get().setSelectedGroup(null);
    
    const newHistoryStep = historyStep - 1;
    const oldHistoryStepPages = get().getHistoryStep(historyStep);
    const newHistoryStepPages = get().getHistoryStep(newHistoryStep);

    //Смещение фокуса на страницу, где произошли изменения
    let newPageNum = getPageNumByChangesInHistory(oldHistoryStepPages, newHistoryStepPages);

    //убираем выделение со всех слоев
    deleteSelectedFromObjects(newHistoryStepPages);

    get().setPageNum( newPageNum );

    set({
      objects: newHistoryStepPages,
      historyStep: newHistoryStep
    });
  },

  redoHistory: () => {
    const historyStep = get().historyStep;
    const history = get().history;

    if (historyStep === history.length - 1) {
      return;
    }

    get().setSelected(null);
    get().setSelectedGroup(null);

    const newHistoryStep = historyStep + 1;
    const oldHistoryStepPages = history[historyStep];
    const newHistoryStepPages = get().getHistoryStep(newHistoryStep);
    
    //Смещение фокуса на страницу, где произошли изменения
    let newPageNum = getPageNumByChangesInHistory(oldHistoryStepPages, newHistoryStepPages);
    
    //убираем выделение со всех слоев
    deleteSelectedFromObjects(newHistoryStepPages);

    get().setPageNum( newPageNum );
    
    set({
      objects: newHistoryStepPages,
      historyStep: newHistoryStep
    });
  },

  /* --------------- */

  
  /* page methods */
  setPageNum: pageNum => {
    if(pageNum !== get().pageNum) {
      get().setSelected(null);
      get().setSelectedGroup(null);
    }
    set({ pageNum })
  },

  getPageCount: () => {
    const objects = get().objects;

    return objects.length;
  },

  addPage: () => {
    //TODO: title?
    const objects = [...get().objects];
    objects.push([[], []]);

    get().updateHistory(objects);
    set({objects})

  },

  getPage:( pageNumber = null ) => {
    const pageN = pageNumber ? pageNumber : get().pageNum;

    return get().objects[pageN] ? [...get().objects[pageN]] : [];
  },

  //TODO: убрать массив для groupsToUpdate
  updatePage: (objectsToUpdate, pageNum = null, skipChanges = false, groupsToUpdate = null) => {
    const pageN = pageNum ? pageNum : get().pageNum;
    const objects = [...get().objects];
    const newObjects = [];

    objects.forEach( (page, pageIndex) => {
      const newPage = [...page];
      if(pageIndex === pageN) {
        
        if(objectsToUpdate) {
          newPage[0] = objectsToUpdate
        }

        if(groupsToUpdate) {
          newPage[1] = groupsToUpdate;
        }
      } 
      newObjects.push(newPage)
    });

    get().updateHistory(newObjects, skipChanges);
    set({objects: newObjects});
  },
  /* --------------- */


  /* object methods */
  getObject: id => {
    const pageObjects = get().getPage();

    if(pageObjects[0].length === 0)
      return null;

    return pageObjects[0].find(object => object.ID === id);
  },

  getObjectIndex: id => {
    const pageObjects = get().getPage();
    const foundIndex = pageObjects[0].findIndex(item => item.ID === id);

    return foundIndex;
  },

  addObject: proto => {
    const ID = uuidv4();
    const pageObjects = get().getPage();
    const objects = [...get().objects];

    //BUG: почему работает мутация?
    deleteSelectedFromObjects(objects);
    
    get().setSelectedGroup(null);



    pageObjects[0].push({
      ...proto,
      selected: true,
      ID: ID
    });

    get().updatePage(pageObjects[0]);
  },

  deleteObject: () => {
    const selectedObject = get().getSelected();
    if( !selectedObject ) {
      return;
    }

    let pageObjects = get().getPage();

    pageObjects[0] = pageObjects[0].filter(item => selectedObject.ID !== item.ID );

    get().updatePage(pageObjects[0]);
  },

  updateObject: (id, newProto, skipChanges = false) => {
    let pageObjects = [...get().getPage()[0]];
    if(pageObjects.length === 0)
      return;

    const index = get().getObjectIndex(id);

    pageObjects[index] = newProto;

    get().updatePage(pageObjects, null, skipChanges);
  },
  /* --------------- */


  /* object-manipulation methods */
  duplicateObject:() => {
    const selectedObject = get().getSelected();
    if(!selectedObject || !selectedObject.ID) {
      return;
    }

    const pageObjects = get().getPage();
    const ID = uuidv4();
    pageObjects[0].push({
      ...selectedObject,
      ID,
      attrs:{
        ...selectedObject.attrs,
        x: selectedObject.attrs.x + 20, 
        y: selectedObject.attrs.y + 20,
        clientRect: {
          ...selectedObject.attrs.clientRect,
          x: selectedObject.attrs.clientRect.x + 20, 
          y: selectedObject.attrs.clientRect.y + 20
        }
      }
    });

    get().updatePage( pageObjects[0] );
    get().setSelected(null);
    get().setSelected(ID);
  },

  upObject: () => {
    //TODO: Учесть группы
    const selectedObject = get().getSelected();
    if(!selectedObject || !selectedObject.ID) {
      return;
    }

    const id = selectedObject.ID;
    const foundObject = get().getObject(id);
    const foundIndex = get().getObjectIndex(id);
    const pageObjects = get().getPage();

    // [0, 1, (2), 3, 4]
    // [0,1] [3] [(2)] [4]
    if( foundIndex < pageObjects[0].length - 1 ) {
      const arrStart = pageObjects[0].slice(0, foundIndex);
      const arrNext = pageObjects[0].slice(foundIndex + 1, foundIndex + 2 );
      const arrEnd = pageObjects[0].slice(foundIndex + 2);

      const newContent = arrStart.concat(arrNext, foundObject, arrEnd);

      get().updatePage( newContent );
    }
  },

  downObject: () => {
    //TODO: Учесть группы
    const selectedObject = get().getSelected();
    if(!selectedObject || !selectedObject.ID) {
      return;
    }

    const id = selectedObject.ID;
    const foundObject = get().getObject(id);
    const foundIndex = get().getObjectIndex(id);
    const pageObjects = get().getPage();

    // [0, 1, (2), 3, 4]
    // [0] [(2)] [1] [3,4]
    if( foundIndex !== 0 ) {
      const arrStart = pageObjects[0].slice(0, foundIndex - 1);
      const arrPrev = pageObjects[0].slice(foundIndex - 1, foundIndex );
      const arrEnd = pageObjects[0].slice(foundIndex + 1);

      const newContent = arrStart.concat(foundObject, arrPrev, arrEnd);

      get().updatePage( newContent );
    }
  },

  flipVerticalObject: () => {
    const selectedObject = get().getSelected();
    if(!selectedObject || !selectedObject.ID) {
      return;
    }

    const id = selectedObject.ID;
    const foundObject = get().getObject(id);


    const attrs = {...foundObject.attrs};
    let rotation = attrs.rotation;
    const rotationDest = rotation + 180;

    const rotatePoint = ({ x, y }, rad) => {
      const rcos = Math.cos(rad);
      const rsin = Math.sin(rad);
      return { x: x * rcos - y * rsin, y: y * rcos + x * rsin };
    };
    
    const topLeft = { x: -attrs.width / 2, y: -attrs.height / 2 };
    const current = rotatePoint(topLeft, Konva.getAngle(rotation));
    const rotated = rotatePoint(topLeft, Konva.getAngle(rotationDest));
    const dx = rotated.x - current.x,
      dy = rotated.y - current.y;
  
    attrs.rotation = rotationDest;
    attrs.x = attrs.x + dx;
    attrs.y = attrs.y + dy;
    
    foundObject.attrs = attrs;

    get().updateObject(id, {...foundObject});
  },

  flipHorizontalObject: () => {
    const selectedObject = get().getSelected();
    if(!selectedObject || !selectedObject.ID) {
      return;
    }

    const id = selectedObject.ID;
    const foundObject = get().getObject(id);

    const attrs = { ...foundObject.attrs };
    const scaleX = (attrs.scaleX) ? attrs.scaleX : 0;

    attrs.scaleX = (scaleX < 0) ? 1 : -1;
    attrs.offsetX = (scaleX < 0) ? 0 : attrs.width;
    
    foundObject.attrs = attrs;

    get().updateObject(id, {...foundObject});
  },
  /* ----------- */


  /* Groups */
  /**
   * Проверка объекта на принадлежность группе
   * @param {string} id - id объекта.
   * @returns {(string|boolean))} id группы, если имеется или false
   */
  isObjectGrouped: id => {
    const object = get().getObject(id);

    return object && object.group ? object.group : false;
  },

  groupObjects: (objectsToGroup, groupID) => {
    if( !objectsToGroup || !objectsToGroup.length ) {
      return;
    }

    get().setSelected(null);
    get().setSelectedGroup(null);

    const pageObjects = get().getPage();
    const newPageObjects = [[],[]];
    newPageObjects[1] = pageObjects[1];

    const foundGroupIndex = newPageObjects[1].findIndex(el => el.group === groupID);

    pageObjects[0].forEach((object, index) => {
      const newObject = {...object};

      if( objectsToGroup.includes(newObject.ID)) {
        // объект находиться в списке на группировку 

        const newObjectAttrs = {...newObject.attrs};

        if( newObject.group ) {
          if(newObject.group === groupID) {
            // элементы поглощающей группы  
          } 
          else {
            // элементы сливающейся группы
          }
        } 
        else {
          // + Объект
          
          if(newObject.group !== groupID) {
            console.log({newObject});
            //Новый объект группы - необходимо сделать поправку в координатах на смещение группы

            //Записываем значения до группировки в отдельное св-во
            //TODO: Баг смещения для новго члена группы при наличии трансформации
            newObject.transformedAttrs = {...newObjectAttrs};

            // Задаем смещение
            if(foundGroupIndex !== -1) {
              newObjectAttrs.x -= newPageObjects[1][foundGroupIndex].attrs.x;
              newObjectAttrs.y -= newPageObjects[1][foundGroupIndex].attrs.y;
            }

            newObject.attrs = newObjectAttrs;
          }
          
          newObject.group = groupID;
        }
      }
        
      newPageObjects[0].push(newObject);
    });

    if(foundGroupIndex === -1) {
      newPageObjects[1].push({
        group: groupID,
        attrs: {
          x: 0,
          y: 0
        }
      });
    }

    get().updatePage(newPageObjects[0], null, false, newPageObjects[1]);

    get().setSelectedGroup(groupID);
  },

  updateGroup: (groupID, attrsToChange, groupChildren, skipChanges = false) => {
    console.log({attrsToChange, groupChildren});
    const pageObjects = get().getPage();
    //TODO: учесть историю
    if(pageObjects[0].length === 0)
      return;

    const newPageObjects = [[], []];
    newPageObjects[1] = pageObjects[1];
    
    let index = 0;
    pageObjects[0].forEach((object, i) => {
      const newObject = {...object};

      if(!object.group || object.group !== groupID) {
        newPageObjects[0].push(newObject);
        return;
      }

      const attrs = { ...newObject.attrs };

      const clientRect = groupChildren[index].getClientRect();
      const absolutePosition = groupChildren[index].absolutePosition();

      attrs.clientRect = clientRect;
      attrs.x = absolutePosition.x / get().canvasScale;
      attrs.y = absolutePosition.y / get().canvasScale;
      
      if(attrsToChange.rotation) {
        attrs.rotation += attrsToChange.rotation;
      }

      if(attrsToChange.scaleX && attrsToChange.scaleY) {
        attrs.scaleX *= attrsToChange.scaleX;
        attrs.scaleY *= attrsToChange.scaleY;
      }

      newObject.transformedAttrs = attrs;
      newPageObjects[0].push(newObject);

      index++;
    });

    //Записываем данные о группе
    newPageObjects[1].forEach((el, index) => {
      if(el.group === groupID) {
        newPageObjects[1][index].attrs.x = attrsToChange.x;
        newPageObjects[1][index].attrs.y = attrsToChange.y;
      }
    });
    
    get().updatePage(newPageObjects[0], null, skipChanges, newPageObjects[1]);
  },

  ungroupObjects: () => {
    const selectedGroup = get().selectedGroup;
    if( !selectedGroup ) {
      return;
    }

    const pageObjects = get().getPage();
    const newPageObjects = [[], []];
    newPageObjects[1] = [...pageObjects[1]];


    pageObjects[0].forEach(object => {
      const newObject = {...object};

      if( newObject.group === selectedGroup ) {

        newObject.attrs = newObject.transformedAttrs ? newObject.transformedAttrs : newObject.attrs;

        newObject.attrs.strokeWidth = 0;
        delete newObject.transformedAttrs;
        delete newObject.group;
      }

      newPageObjects[0].push(newObject);
    });


    newPageObjects[1] = newPageObjects[1].filter(el => el.group !== selectedGroup);

    get().updatePage(newPageObjects[0], null, false, newPageObjects[1]);

    get().setSelectedGroup(null);
  },

  getObjectIdsOfGroup: groupID => {
    const pageObjects = get().getPage();
    const objectIdsOfGroup = [];

    pageObjects[0].forEach(object => {
      if(!object.group)
        return;

      if( object.group === groupID ) {
        objectIdsOfGroup.push(object.ID)
      }
    });

    return objectIdsOfGroup.length ? objectIdsOfGroup : [];
  },

  setSelectedGroup: group_id => {
    set({selectedGroup: group_id});
  },

  deleteGroup: () => {
    const selectedGroup = get().selectedGroup;
    if( !selectedGroup ) {
      return;
    }

    let pageObjects = [...get().getPage()];

    pageObjects[0] = pageObjects[0].filter(item => selectedGroup !== item.group );
    pageObjects[1] = pageObjects[1].filter(item => selectedGroup !== item.group );

    //TODO: add group deleting
    get().updatePage(pageObjects[0], null, true, pageObjects[1]);
    get().setSelectedGroup(null);
  },

  splitObjectsIntoGroups: objects => {
    //single, single, ...[grouped, grouped, grouped], single, single, ...

    const usedGroups = [];
    let  reorganizedObjects = [];

    objects[0].forEach(item => {
      if(item.group) {
        if(usedGroups.includes(item.group)) {
          return;
        } 
        else {
          const groupedElements = objects[0].filter(el => el.group === item.group);
          
          reorganizedObjects.push(groupedElements);
          usedGroups.push(item.group);
        }
      }
      else {
        reorganizedObjects.push(item)
      }
    });

    return reorganizedObjects;
  },
  /* ----------- */


  /* Object status methods */
  getSelected: () => {
    const pageObjects = get().getPage();

    const foundSelectedObject = pageObjects[0].find(item => item.selected === true);

    return foundSelectedObject ? foundSelectedObject : null;
  },

  setSelected: id => {
    const foundSelectedObject = get().getSelected();
    const selectingObject = get().getObject(id);

    if((foundSelectedObject && foundSelectedObject.ID === id) 
      || (selectingObject && selectingObject.group)) {
      return;
    }

    const pageObjects = get().getPage();

    if(pageObjects[0].length === 0)
      return;

    deleteSelectedFromPage(pageObjects[0]);

    if(id) {
      pageObjects[0].find(item => item.ID === id).selected = true;
    }

    get().updatePage(pageObjects[0], null, true);
  },

  setEditing: id => {
    set({editingObject: id});
  },

  setManipulating: id => {
    set({manipulatingInstance: id});
  }
  /* --------------- */

}));

export default useStore;
