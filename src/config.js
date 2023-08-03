const config = {
  strokeWidth: 2,

  transformer: {
    anchorFill: 'orange',
    anchorStroke: 'blue',
    anchorStrokeWidth: 1,
    anchorSize: 12,
    anchorCornerRadius: 6,
    borderDash: [5],
    borderStroke: 'grey',
    borderStrokeWidth: 2,
    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    enabledAnchorsText: ['middle-left', 'middle-right'],
    rotateAnchorOffset: 30,
    rotationSnaps: [0, 90, 180, 270],

    boundBoxFunc: (oldBox, newBox) => {
      // const ratio = newBox.width / newBox.height;

      // TODO: fix flipping
      // if (newBox.height < 100 / ratio) {
      //   console.log(oldBox);
      //   return oldBox;
      // }
      return newBox;
    },

    boundBoxFuncText: (oldBox, newBox) => {
      newBox.width = Math.max(30, newBox.width);
      return newBox;
    }
  },
  objectPrototypes: {
    shape: {
      rect: {
        type: 'shape',
        attrs: {
          x: 50,
          y: 50,
          width: 100,
          height: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          fill: 'purple',
          opacity: 1,
          stroke: '#00dde6',
          strokeWidth: 0,
          clientRect: {
            x: 50,
            y: 50,
            width: 100,
            height: 100
          }
        }
      }
    },
    text: {
      type: 'text',
      attrs: {
        text: 'Какой-то текст',
        x: 50,
        y: 50,
        fontSize: 20,
        fontFamily: 'Times',
        fontStyle: 'normal',
        align: 'left',
        width: 160,
        height: 30,
        rotation: 0,
        fill: 'rgba(0,0,0,1)',
        opacity: 1,
        lineHeight: 1.2,
        // stroke: '#00dde6',
        // strokeWidth: 0,
        clientRect: {
          x: 50,
          y: 50,
          width: 100,
          height: 30,
        }
      }
    },
    image: {
      type: 'image',
      attrs: {
        x: 50,
        y: 50,
        width: 160,
        height: 120,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        offsetX: 0,
        offsetY: 0,
        opacity: 1,
        stroke: '#00dde6',
        strokeWidth: 0,
        clientRect: {
          x: 100,
          y: 100,
          width: 160,
          height: 120,
        }
      }
    }
  }
};

export default config;