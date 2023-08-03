import { isEqual } from 'lodash'

export const  RGBtoInline = rgb => {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
};

/* mutate array */
export const deleteSelectedFromObjects = objects => {
  objects.forEach(page => { 
    page[0].forEach(object => {
      delete object.selected;
    });
  });
}

/* mutate array */
export const deleteSelectedFromPage = page => {
  page.forEach(object => {
    delete object.selected;
  });
}


export const getPageNumByChangesInHistory = (oldHistory, newHistory) => {
  let newPageNum;

  oldHistory.forEach((item, i) => {
    if( newHistory[i] && !isEqual(item, newHistory[i]) ) {
      newPageNum = i;
      return;
    }
  });
  
  return newPageNum;
}

export const getWindowSize = () => {

  return {
    width: window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth,

    height: window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight,
  };
}