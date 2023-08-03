import React from 'react';

import { Transformer } from 'react-konva';
import config from '../config';
import useStore from '../store';

export default ({trRef, isText}) => {
  const canvasScale = useStore(state => state.canvasScale);

  return(<Transformer 
    ref={ trRef }
  
    anchorFill={ config.transformer.anchorFill } 
    anchorStroke={ config.transformer.anchorStroke }
    anchorStrokeWidth={ config.transformer.anchorStrokeWidth  }
    anchorSize={ config.transformer.anchorSize }
    anchorCornerRadius={ config.transformer.anchorCornerRadius }
    enabledAnchors={ isText ? config.transformer.enabledAnchorsText : config.transformer.enabledAnchors }
  
    borderStroke={ config.transformer.borderStroke }
    borderDash={ isText ? config.transformer.borderDash : null }
    borderStrokeWidth={ isText ? config.transformer.borderStrokeWidth / canvasScale : null }
  
    rotateAnchorOffset={ config.transformer.rotateAnchorOffset }
    rotationSnaps={ config.transformer.rotationSnaps }
  
    boundBoxFunc={ isText ? config.transformer.boundBoxFuncText : config.transformer.boundBoxFunc }
  />);
};