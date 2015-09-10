/**
 * Created by jfengjiang on 2015/1/13.
 */


(function(name, definition) {
    if (typeof define === 'function'){
        define(definition);
    } else {
        this[name] = definition();
    }
})('Swiper', function(){

    /**
     *
     * @param options
     * @constructor
     */
    function Swiper(options){
        this.version = '2.0.1';
        this._default = {container: '.swiper', item: '.item', direction: 'vertical', threshold: 50, duration: 300};
        this._options = extend(this._default, options);
        this._start = {};
        this._move = {};
        this._end = {};
        this._prev = 0;
        this._current = 0;
        this._offset = 0;
        this._cache = {};

        this.$container = document.querySelector(this._options.container);
        this.$items = this.$container.querySelectorAll(this._options.item);
        this.count = this.$items.length;

        this._width = this.$container.offsetWidth;
        this._height = this.$container.offsetHeight;

        this._init();
        this._bind();
    }

    /**
     *
     * @private
     */
    Swiper.prototype._init = function(){
        var me = this;
        var width = me._width;
        var height = me._height;

        var w = width;
        var h = height * me.count;

        if(me._options.direction === 'horizontal'){
            w = width * me.count;
            h = height;
        }

        me.$container.style.width = w + 'px';
        me.$container.style.height = h + 'px';

        Array.prototype.forEach.call(me.$items, function ($item, key) {
            $item.style.width = width + 'px';
            $item.style.height = height + 'px';
        });

        me.$items[0].classList.add('active');
    };

    /**
     *
     * @private
     */
    Swiper.prototype._bind = function(){
        var me = this;

        this.$container.addEventListener('touchstart', function (e) {
            me._start.x = e.changedTouches[0].pageX;
            me._start.y = e.changedTouches[0].pageY;

            me.$container.style['-webkit-transition'] = 'none';
            me.$container.style.transition = 'none';

        }, false);

        this.$container.addEventListener('touchmove', function (e) {
            me._move.x = e.changedTouches[0].pageX;
            me._move.y = e.changedTouches[0].pageY;

            var distance = me._move.y - me._start.y;
            var transform = 'translate3d(0, ' + (distance - me._offset) + 'px, 0)';

            if (me._options.direction === 'horizontal'){
                distance = me._move.x - me._start.x;
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
            if (me._options.direction === 'horizontal'){
                distance = me._end.x - me._start.x;
            }

            me._prev = me._current;
            if (distance >= me._options.threshold){
                me._current = me._current === 0 ? 0 : --me._current;
            }
            else if (distance < - me._options.threshold){
                me._current = me._current < (me.count - 1) ? ++me._current : me._current;
            }

            me._show(me._current);

            e.preventDefault();
        }, false);

        this.$container.addEventListener('transitionEnd', function (e) {
            //do nothing
        }, false);

        this.$container.addEventListener('webkitTransitionEnd', function (e) {
            if (e.target !== me.$container){
                return false;
            }

            if (me._current != me._prev) {
                me.$items[me._current].classList.add('active');
                me.$items[me._prev].classList.remove('active');
            }else{

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

        if (this._options.direction === 'horizontal'){
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
     *
     * @param target
     * @param source
     * @returns {*}
     */
    function extend(target, source) {
        for(var key in source){
            target[key] = source[key];
        }

        return target;
    }

    /**
     * export
     */
    return Swiper;
});