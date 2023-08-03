import React, { useState } from "react";
import { Rect } from 'react-konva';
import useStore from '../store';
import config from '../config';

const imgs = [
  `image-1.jpg`,
  `image-2.jpg`
];


export  default () => {
  const [inputs, setInputs] = useState(null);
  const [canvasType, setCanvasType] = useState(null);

  const objectPrototypes = { ...config.objectPrototypes }; 

  const canvasSizes = useStore(state => state.canvasSizes);
  const defaultCanvasSize = useStore(state => state.defaultCanvasSize);

  const addObject = useStore(state => state.addObject);
  const undoHistory = useStore(state => state.undoHistory);
  const redoHistory = useStore(state => state.redoHistory);
  const history = useStore(state => state.history);
  const objects = useStore(state => state.objects);
  const historyStep = useStore(state => state.historyStep);
  const setCanvasSize = useStore(state => state.setCanvasSize);
  const adjustCanvasScale = useStore(state => state.adjustCanvasScale);
  const setSelected = useStore(state => state.setSelected);
  const setSelectedGroup = useStore(state => state.setSelectedGroup);


  function _addImage(url) {
    const proto = {...objectPrototypes.image};
    proto.url = url;
    addObject(proto);
  }


  function handleCanvasSizeSelect(e) {
    if(e.target.value !== "x") { 
      // x = custom size
      const size = canvasSizes[+e.target.value];

      setCanvasSize({
        width: size.width,
        height: size.height
      });

      adjustCanvasScale();
    }

    setCanvasType(e.target.value);
  }

  function handleInputChange(e) {
    const target = e.target;
    const value = target.value;
    const name = target.name;
    const inp = {...inputs};

    inp[name] = value;

    setInputs(inp);
  }

  function handleChangeCanvasSizeForm(e) {
    e.preventDefault();

    setCanvasSize({
      width: inputs.width,
      height: inputs.height
    });

    adjustCanvasScale();

    setSelected(null);
    setSelectedGroup(null);
  }

  return (
    <div className="controls">
      <button
        className="btn btn--s round"
        onClick={undoHistory}
      >
        назад
      </button>
      
      <button
        className="btn btn--s round"
        onClick={redoHistory}
      >
        вперед
      </button>

      <br/>
      <br/>

      <p><strong>Размер холста</strong></p>


      <select 
        onChange={handleCanvasSizeSelect}
        defaultValue={defaultCanvasSize}
      >
        {
          canvasSizes.map((size, index) => <option key={`canvas-size-${index}`} value={index}>{size.label} - {size.width} x {size.height}</option>)
        }
        <option value="x">Custom size</option>
      </select>

      {
        canvasType === "x" && <form className='flex-parent' onSubmit={handleChangeCanvasSizeForm}>
        <input type="number" name="width" onChange={handleInputChange} value={inputs && inputs.width ? inputs.width : ""} required className="input input--s" placeholder="Ширина"/>
        <input type="number" name="height" onChange={handleInputChange} value={inputs && inputs.height ? inputs.height : ""} required className="input input--s" placeholder="Высота"/>
        <button className='btn round'>Ok</button>
      </form>
      }

      <br/>
      <br/>

      <button
        className="btn btn--s round"
        onClick={() => {
          const rectProto = { ...objectPrototypes.shape.rect };
          rectProto.component = Rect;
          
          addObject(rectProto);
        }}
      >
        Добавить элемент
      </button>
      
      <br/>
      <br/>
      
      <button
      className="btn btn--s round"
        onClick={() => {
          addObject(objectPrototypes.text);
        }}
      >
        Добавить текст
      </button>
      <br/>
      <br/>
      <p>
        <strong>Изображения</strong>
      </p>

      <ul>
        {imgs.map((path, i) => (
            <li key={`img-` + i}>
              <img 
                src={ path }
                alt="" 
                width="80"
                onClick={() => {
                  _addImage(path);
                }}
              />
            </li>
          ))
        }
      </ul>

      <button 
      className="btn btn--s round"
      onClick={() => {
          console.log(
            {objects, history, historyStep}
          );
        }}>Показать историю в консоле</button>

      <br/>
      <br/>

      <small>
        Для группировки выделить объект и кликнуть с зажатым SHIFT по нужному объекту
      </small>

     
    </div>
  );
};
