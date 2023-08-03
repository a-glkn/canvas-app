import React, { useRef, useEffect } from "react";
import classNames from 'classnames';

import Stage from "./Stage";

import ObjectToolbar from './tools/ObjectToolbar';
import TextToolbar from './tools/TextToolbar';
import GroupToolbar from './tools/GroupToolbar';

import useStore from '../store';

import animateScrollTo from 'animated-scroll-to';
import { getWindowSize } from '../helpers';


export default () => {
  const objects = useStore(state => state.objects);
  const pageNum = useStore(state => state.pageNum);
  const pageCount = useStore(state => state.getPageCount());
  const addPage = useStore(state => state.addPage);
  const setPageNum = useStore(state => state.setPageNum);
  const setWindowSize = useStore(state => state.setWindowSize);
  const windowHeight = useStore(state => state.windowHeight);
  const textRef = useRef();

  function handleAddPageClick() {
    setPageNum( pageCount );
    addPage();

    setTimeout(()=>{
      animateScrollTo(document.querySelector('.stage-' + pageCount));
    }, 1);
  }

  function handlePageClick(index) {
    setPageNum(index);

    animateScrollTo(document.querySelector('.stage-' + index));
  }

  function adjustWindowSize() {
    const windowSize = getWindowSize();

    setWindowSize({
      width: windowSize.width,
      height: windowSize.height
    });
  }

  function handleStageMouseEnter(e) {
    const index = e.target.getAttribute('data-index');
    setPageNum(+index);
  }

  useEffect(() => {
    adjustWindowSize();

    window.addEventListener('resize', adjustWindowSize);

    return () => {
      window.removeEventListener('resize', adjustWindowSize);
    }
  }, []);

  useEffect(() => {
    document.querySelectorAll('.stage').forEach(item => {
      item.addEventListener('mouseenter', handleStageMouseEnter);
    });

    return () => {
      document.querySelectorAll('.stage').forEach(item => {
        item.removeEventListener('mouseenter', handleStageMouseEnter);
      });
    }
  });
  
  return(
    <>
      <div className="stage-wrapper">
        <textarea
          className="text"
          ref={textRef}
          style={{
            display: 'none'
          }}
        >
        </textarea>

        <TextToolbar textRef={textRef} />
        <ObjectToolbar />
        <GroupToolbar />
          
        {objects && objects.map((page, i) => {
          return(
            <div key={`stage-` + i} 
              className={classNames('stage', 'stage-' + i, {
                'stage_active': pageNum === i
              })}
              data-index={i}
              style={{
                height: windowHeight
              }}
            >

              <Stage objects={page} index={i} textRef={textRef} />
            </div>
          );
        })}
      </div>

      <div className="page-swithcher">
        {objects && objects.map((page, i) => {
          return(
            <div 
              key={`page-` + i} 
              
              className={classNames({
                'page-swithcher__item': true,
                'page-swithcher__item_active': pageNum === i
              })}

              onClick={() => {
                handlePageClick(i);
              }}
            >
              <span> Страница { i + 1 }</span>
            </div>
          );
        })}

        <div key={`page-plus`}  className="page-swithcher__item page-swithcher__item_plus" onClick={handleAddPageClick}>
          <span>+</span>
        </div>
      </div>
    </>
  );
};
