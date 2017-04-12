/*
 * Copyright (c) 2017 Samsung Electronics Co., Ltd., All Rights Reserved.
 */

/**
 * The customized FabricJS image that supports zoom/pan inside its bound.
 * @author SVMC
 * @version 1.0
 */
fabric.ZoomablePannableImage = fabric.util.createClass(fabric.Image, {
  type: 'zoomablepannableimage',
  async: true,

  /**
   * Initialize a new instance.
   * @param Object element the HTML5 image element
   * @param Array options the options
   */
  initialize: function (element, options) {
    options || (options = {});
    this.callSuper('initialize', element, options);
    this.set({
      orgSrc: element.src,
      clipX: 0,
      clipY: 0,
      clipWidth: element.width,
      clipHeight: element.height
    });
  },

  /**
   * Zoom/Pan the image.
   * @param Number x the pan by x, negative to pan left, positive to pan right
   * @param Number y the pan by y, negative to pan up, positive to pan down 
   * @param Number z the zoom by, negative to zoom out (larger), negative to zoom in (smaller)
   * @param Function callback the callback function
   */
  zoomPanBy: function (x, y, z, callback) {
    this.clipX += x;
    this.clipY += y;

    if (z) {
      this.clipWidth -= z;

      var clipHeightDelta = z / (this.width / this.height);
      this.clipHeight -= clipHeightDelta;

      this.clipX += z / 2;
      this.clipY += clipHeightDelta / 2;
    }

    if (this.clipWidth > this.width) {
      this.clipWidth = this.width;
    }
    if (this.clipHeight > this.height) {
      this.clipHeight = this.height;
    }
    if (this.clipWidth < 1) {
      this.clipWidth = 1;
    }
    if (this.clipHeight < 1) {
      this.clipHeight = 1;
    }
    if (this.clipX < 0) {
      this.clipX = 0;
    }
    if (this.clipY < 0) {
      this.clipY = 0;
    }
    if (this.clipX > this.width - this.clipWidth) {
      this.clipX = this.width - this.clipWidth;
    }
    if (this.clipY > this.height - this.clipHeight) {
      this.clipY = this.height - this.clipHeight;
    }

    this.rerender(callback);
  },

  /**
   * The rerender.
   * @param callback Function the callback function
   */
  rerender: function (callback) {
    var img = new Image();
    var obj = this;

    img.crossOrigin = 'Anonymous';

    img.onload = function () {

      // Resize the original image to fit the viewport
      var canvas = fabric.util.createCanvasElement();
      canvas.width = obj.width;
      canvas.height = obj.height;
      canvas.getContext('2d').drawImage(
        this,
        0,
        0,
        obj.width,
        obj.height
      );

      img.onload = function () {

        // Draw to the viewport
        canvas = fabric.util.createCanvasElement();
        canvas.width = obj.width;
        canvas.height = obj.height;
        canvas.getContext('2d').drawImage(
          this,
          obj.clipX,
          obj.clipY,
          obj.clipWidth,
          obj.clipHeight,
          0,
          0,
          obj.width,
          obj.height
        );

        img.onload = function () {
          obj.setElement(this);

          // Uncomment following line to apply image filters.
          // Note that it needs to refer to the parent canvas.
          // obj.applyFilters(parentCanvas.renderAll.bind(parentCanvas));

          obj.set({
            left: obj.left,
            top: obj.top,
            angle: obj.angle
          });
          obj.setCoords();

          if (callback) {
            callback(obj);
          }
        };
        img.src = canvas.toDataURL('image/png');
      };

      img.src = canvas.toDataURL('image/png');
    };

    img.src = this.orgSrc;
  },

  /**
   * Convert to serializable object.
   * @returns the seriablizable object
   */
  toObject: function () {
    return fabric.util.object.extend(this.callSuper('toObject'), {
      orgSrc: this.orgSrc,
      clipX: this.clipX,
      clipY: this.clipY,
      clipWidth: this.clipWidth,
      clipHeight: this.clipHeight
    });
  },

  /**
   * Create a new instance from a seriablizable object.
   * @param Object object the serializable object
   * @param Function callback the callback function
   */
  fromObject: function (object, callback) {
    fabric.util.loadImage(object.src, function (img) {
      fabric.Image.prototype._initFilters.call(object, object, function (filters) {
        object.filters = filters || [];
        var instance = new fabric.ZoomablePannableImage(img, object);
        if (callback) { callback(instance); }
      });
    }, null, object.crossOrigin);
  }
});
