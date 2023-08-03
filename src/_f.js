  const _f = {
    history: {
      getAll: () => {
        return [...history];
      },

      getStep: (step) => {
        return [..._f.history.getAll()[step]];
      },

      update: (pagesToUpdate, skipChanges = false) => {
        if(skipChanges) {
          return;
        }

        const newHistory = _f.history.getAll().slice(0, historyStep + 1);
        newHistory.push(pagesToUpdate);

        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
      },

      undo: () => {
        if (historyStep === 0) {
          return;
        }
        
        // TODO: select page where changes appears
        const newHistoryStep = historyStep - 1;
        const oldHistoryStepPages = _f.history.getStep(historyStep);
        const historyStepPages = _f.history.getStep(newHistoryStep);

        if(oldHistoryStepPages.length !== historyStepPages.length) {
          _f.page.setNum( historyStepPages.length - 1 );
        }
        
        //убираем выделение со всех слоев
        historyStepPages.forEach((page) => { 
          page.forEach((object) => {
            delete object.selected;
          });
        });
    
        setHistoryStep(newHistoryStep);
        setObjects(historyStepPages);
      },

      redo: () => {
        if (historyStep === history.length - 1) {
          return;
        }
    
        const newHistoryStep = historyStep + 1;
        const historyStepPages = _f.history.getStep(newHistoryStep);
        
        //убираем выделение со всех слоев
        historyStepPages.forEach((page) => { 
          page.forEach((object) => {
            delete object.selected;
          });
        });
        
        setHistoryStep(newHistoryStep);
        setObjects(historyStepPages);
      }
    },

    
    page: {
      getNum: () => {
        return pageNum;
      },
      setNum: (pageNum) => {
        setPageNum(pageNum);
      },
      getCount: () => {
        return objects.length;
      },
      getAll: () => {
        return [...objects];
      },
      add: () => {
        //TODO: title?
        const pages = _f.page.getAll();

        pages.push([]);
        
        _f.history.update(pages);
        setObjects(pages);
      },
      get: (pageNum = null) => {
        const pageNumber = pageNum ? pageNum : _f.page.getNum();
        const pages = _f.page.getAll();

        return [...pages[pageNumber]] ? [...pages[pageNumber]] : null;
      },
      update: (objectsToUpdate, pageNum = null, skipChanges = false) => {
        const pageNumber = pageNum ? pageNum : _f.page.getNum();
        const pages = _f.page.getAll();

        pages[pageNumber] = objectsToUpdate;

        console.log({objectsToUpdate});

        _f.history.update(pages, skipChanges);
        setObjects(pages);
      },
    },


    object: {
      status: {
        selected: {
          get: () => {
            const foundSelectedObject = _f.page.get().find(item => item.selected === true);

            return foundSelectedObject ? foundSelectedObject : null;
          },
          set: (id) => {
            const foundSelectedObject = _f.object.status.selected.get();

            if(foundSelectedObject && foundSelectedObject.id === id) {
              return;
            }

            const objs = _f.page.get();

            objs.forEach((item) => { 
              delete item.selected;
            });

            if(id) {
              objs.find(item => item.id === id).selected = true;
            }

            _f.page.update(objs, null, true);
          }
        },

        manipulating: {
          get: () => {
            const foundObject = _f.object.getById(manipulatingObjectId);

            return foundObject ? foundObject : null;
          },
          set: (id) => {
            setObjectManipulatingStatus(id);
          }
        },

        editing: {
          get: () => {
            const foundSelectedObject = _f.page.get().find(item => item.editing === true);

            return foundSelectedObject ? foundSelectedObject : null;
          },
          set: (id) => {
            const foundSelectedObject = _f.object.status.editing.get();

            if(foundSelectedObject && foundSelectedObject.id === id) {
              return;
            }

            const objs = _f.page.get();

            objs.forEach((item) => { 
              delete item.editing;
            });

            if(id) {
              objs.find(item => item.id === id).editing = true;
            }

            _f.page.update(objs, null, true);
          }
        }
      },

      getById: (id) => {
        const objs = _f.page.get();
        const foundIndex = _f.object.getIndex(id);

        if(foundIndex === -1)
          return;

        return {...objs[foundIndex]};
      },

      getIndex: (id) => {
        const objs = _f.page.get();
        const foundIndex = objs.findIndex(item => item.id === id);

        return foundIndex;
      },

      add: (proto) => {
        const objs = _f.page.get();

        objs.forEach((item) => { 
          delete item.selected;
        });

        objs.push({
          ...proto,
          selected: true,
          id: uuidv1()
        });

        _f.page.update(objs);
      },

      delete: () => {
        const selectedObject = _f.object.status.selected.get();
        if(!selectedObject || !selectedObject.id) {
          return;
        }

        const objectsToUpdate = _f.page.get().filter(item => item.id !== selectedObject.id);
        _f.page.update(objectsToUpdate);
      },

      update: (index, newProto, skipChanges = false) => {
        const pageObjects = _f.page.get();
        pageObjects[index] = newProto;

        _f.page.update(pageObjects, null, skipChanges);
      },

      up: () => {
        const selectedObject = _f.object.status.selected.get();
        if(!selectedObject || !selectedObject.id) {
          return;
        }

        const id = selectedObject.id;
        const foundObject = _f.object.getById(id);
        const foundIndex = _f.object.getIndex(id);
        const objs = _f.page.get();

        // [0, 1, (2), 3, 4]
        // [0,1] [3] [(2)] [4]
        if( foundIndex < objs.length - 1 ) {
          const arrStart = objs.slice(0, foundIndex);
          const arrNext = objs.slice(foundIndex + 1, foundIndex + 2 );
          const arrEnd = objs.slice(foundIndex + 2);

          const newContent = arrStart.concat(arrNext, foundObject, arrEnd);

          _f.page.update( newContent );
        }
      },

      down: () => {
        const selectedObject = _f.object.status.selected.get();
        if(!selectedObject || !selectedObject.id) {
          return;
        }

        const id = selectedObject.id;
        const foundObject = _f.object.getById(id);
        const foundIndex = _f.object.getIndex(id);
        const objs = _f.page.get();

        // [0, 1, (2), 3, 4]
        // [0] [(2)] [1] [3,4]
        if( foundIndex !== 0 ) {
          const arrStart = objs.slice(0, foundIndex - 1);
          const arrPrev = objs.slice(foundIndex - 1, foundIndex );
          const arrEnd = objs.slice(foundIndex + 1);

          const newContent = arrStart.concat(foundObject, arrPrev, arrEnd);

          _f.page.update( newContent );
        }
      },

      flipVertical: () => {
        const selectedObject = _f.object.status.selected.get();
        if(!selectedObject || !selectedObject.id) {
          return;
        }

        const id = selectedObject.id;
        const foundObject = _f.object.getById(id);
        const foundIndex = _f.object.getIndex(id);


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

        _f.object.update(foundIndex, foundObject);
      },

      flipHorizontal: () => {
        const selectedObject = _f.object.status.selected.get();
        if(!selectedObject || !selectedObject.id) {
          return;
        }

        const id = selectedObject.id;
        const foundObject = _f.object.getById(id);
        const foundIndex = _f.object.getIndex(id);
        const attrs = {...foundObject.attrs};
        const scaleX = (attrs.scaleX) ? attrs.scaleX : 0;

        attrs.scaleX = (scaleX < 0) ? 1 : -1;
        attrs.offsetX = (scaleX < 0) ? 0 : attrs.width;
        
        foundObject.attrs = attrs;

        _f.object.update(foundIndex, foundObject);
      }
    }
    
  };
