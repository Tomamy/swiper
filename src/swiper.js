/*!
 * iswiper - swiper.js
 * @version v1.4.1
 * @link https://github.com/weui/swiper.git
 * @license MIT
 */

(function (name, definition) {
    if (typeof define === 'function') {
        define(definition);
    } else {
        this[name] = definition();
    }
})('Swiper', function () {

    /**
     *
     * @param options
     * @constructor
     */
    function Swiper(options) {
        this.version = '1.4.1';
        this._default = {
            container: '.swiper', 
            item: '.item', 
            direction: 'vertical', 
            activeClass: 'active',
            bounce: false,
            lazyLoading: false,
            preloadImages: true,
            loadingSrc: '../../b_waiting.gif', 
            threshold: 50, 
            duration: 300,
            touchendCall: function(){}
        };
        this._options = extend(this._default, options);
        this._start = {};
        this._move = {};
        this._end = {};
        this._prev = 0;
        this._current = 0;
        this._offset = 0;
        this._goto = -1;
        this.imagesLoaded = [];
        this._eventHandlers = {};

        this.$container = document.querySelector(this._options.container);
        this.$items = this.$container.querySelectorAll(this._options.item);
        this.count = this.$items.length;

        this._width = this.$container.offsetWidth;
        this._height = this.$container.offsetHeight;

        this._init();
        this._bind();
    }

    /**
     * initial
     * @private
     */
    Swiper.prototype._init = function () {
        var me = this;
        var width = me._width;
        var height = me._height;


        var w = width;
        var h = height * me.count;

        if (me._options.direction === 'horizontal') {
            w = width * me.count;
            h = height;
        }

        me.$container.style.width = w + 'px';
        me.$container.style.height = h + 'px';

        Array.prototype.forEach.call(me.$items, function ($item, key) {
            $item.style.width = width + 'px';
            $item.style.height = height + 'px';
        });

        me._activate(0);

        if(me._options.lazyLoading) {
            me._lazyLoadImage(); 
        }
    };

    /**
     * bind event listener
     * @private
     */
    Swiper.prototype._bind = function () {
        var me = this;

        this.$container.addEventListener('touchstart', function (e) {
            me._start.x = e.changedTouches[0].pageX;
            me._start.y = e.changedTouches[0].pageY;

            me.$container.style['-webkit-transition'] = 'none';
            me.$container.style.transition = 'none';
            
            me._bounce = true;

        }, false);

        this.$container.addEventListener('touchmove', function (e) {
            me._move.x = e.changedTouches[0].pageX;
            me._move.y = e.changedTouches[0].pageY;

            var distance = me._move.y - me._start.y;

            var realOffset = distance - me._offset;
            if(me._options.bounce && me._current === 0 && realOffset >= 0 || me._options.bounce && me._current == (me.count-1) && realOffset <= 0){
                return; 
            }
            var transform = 'translate3d(0, ' + (distance - me._offset) + 'px, 0)';

            if (me._options.direction === 'horizontal') {
                distance = me._move.x - me._start.x;
                realOffset = distance - me._offset;
                if(me._options.bounce && me._current === 0 && realOffset >= 0 || me._options.bounce && me._current == (me.count-1) && realOffset <= 0){
                    return; 
                }
                transform = 'translate3d(' + (distance - me._offset) + 'px, 0, 0)';
            }

            me.$container.style['-webkit-transform'] = transform;
            me.$container.style.transform = transform;

            e.preventDefault();
        }, false);

        this.$container.addEventListener('touchend', function (e) {

            me._end.x = e.changedTouches[0].pageX;
            me._end.y = e.changedTouches[0].pageY;


            var distance = me._end.y - me._start.y;
            if (me._options.direction === 'horizontal') {
                distance = me._end.x - me._start.x;
            }

            me._prev = me._current;
            if (distance > me._options.threshold) {
                me._current = me._current === 0 ? 0 : --me._current;
                me._lazyLoadImage();
            } else if (distance < -me._options.threshold) {
                me._current = me._current < (me.count - 1) ? ++me._current : me._current;
                me._lazyLoadImage();
            }

            me._show(me._current);
            me._options.touchendCall();

        }, false);

        this.$container.addEventListener('transitionEnd', function (e) {
        }, false);

        this.$container.addEventListener('webkitTransitionEnd', function (e) {
            if (e.target !== me.$container) {
                return false;
            }

            if (me._current != me._prev || me._goto > -1) {
                me._activate(me._current);
                var cb = me._eventHandlers.swiped || noop;
                cb.apply(me, [me._prev, me._current]);
                me._goto = -1;
            }
            e.preventDefault();
        }, false);
    };

    /**
     * show
     * @param index
     * @private
     */
    Swiper.prototype._show = function (index) {
        this._offset = index * this._height;
        var transform = 'translate3d(0, -' + this._offset + 'px, 0)';

        if (this._options.direction === 'horizontal') {
            this._offset = index * this._width;
            transform = 'translate3d(-' + this._offset + 'px, 0, 0)';
        }

        var duration = this._options.duration + 'ms';

        this.$container.style['-webkit-transition'] = duration;
        this.$container.style.transition = duration;
        this.$container.style['-webkit-transform'] = transform;
        this.$container.style.transform = transform;
    };

    /**
     * activate
     * @param index
     * @private
     */
    Swiper.prototype._activate = function (index){
        var clazz = this._options.activeClass;
        Array.prototype.forEach.call(this.$items, function ($item, key){
            $item.classList.remove(clazz);
            if (index === key) {
                $item.classList.add(clazz);
            }
        });
    };

    /**
        is exits
    **/
    Swiper.prototype._isExitsLoaded = function(pos){
        for(var i=0;i<this.imagesLoaded.length;i++){
            if(pos == this.imagesLoaded[i]){
                return true; 
            } 
        } 
        return false; 
    }

    /**
        preload images
    **/
    Swiper.prototype._preloadImages = function (){
        var count = this._current + 3;
        count = count > this.count?this.count:count;
        for(var i=this._current;i<count;i++){
            if(this._isExitsLoaded(i)){
                continue; 
            }
            var image = new Image();
            image.src = this.$items[i].querySelector(".swiper-lazy").getAttribute("data-src");
            this.imagesLoaded.push(i);
        }
    };

    /**
        lazy load image
    **/
    Swiper.prototype._lazyLoadImage = function(){
        var obj = this.$items[this._current].querySelector(".swiper-lazy");         
        this._preloadImages();
        if(obj.getAttribute("src")){
            return; 
        }
        var loadDom = document.createElement("div");
        loadDom.setAttribute("class","loading");
        loadDom.innerHTML = '<img src="'+this._options.loadingSrc+'"/>';
        this.$items[this._current].appendChild(loadDom);
        var img = new Image();
        img.src = obj.getAttribute("data-src");
        if(img.complete){
            loadDom.remove();
            obj.setAttribute("src",img.src);
            return;
        }
        img.onload = function(){
            loadDom.remove();
            obj.setAttribute("src",img.src);
        };
    };

    /**
     * goto x page
     */
    Swiper.prototype.go = function (index) {
        if(index < 0 || index > this.count - 1 || index === this._current){
            return;
        }
        
        if (index === 0) {
            this._current = 0;
            this._prev = 0;
        }else{
            this._current = index;
            this._prev = index - 1;
        }

        this._goto = index;
        this._show(this._current);

        return this;
    };

    /**
     * show next page
     */
    Swiper.prototype.next = function () {
        if (this._current >= this.count - 1) {
            return;
        }
        this._prev = this._current;
        this._show(++this._current);
        return this;
    };

    /**
     *
     * @param {String} event
     * @param {Function} callback
     */
    Swiper.prototype.on = function (event, callback) {
        if (this._eventHandlers[event]) {
            throw new Error('event ' + event + ' is already register');
        }
        if (typeof callback !== 'function') {
            throw new Error('parameter callback must be a function');
        }

        this._eventHandlers[event] = callback;

        return this;
    };

    /**
        get curent pos
    **/
    Swiper.prototype.getCurrent = function(){
        return this._current; 
    };

    /**
        get total item
    **/
    Swiper.prototype.getTotal = function(){
        return this.count; 
    };

    /**
     * simple `extend` method
     * @param target
     * @param source
     * @returns {*}
     */
    function extend(target, source) {
        for (var key in source) {
            target[key] = source[key];
        }

        return target;
    }

    /**
     * noop
     */
    function noop() {

    }

    /**
     * export
     */
    return Swiper;
});
