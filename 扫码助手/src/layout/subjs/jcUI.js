// 素材库网站 https://icon-icons.com/zh/

const jcUI = function () {
    function jcUI() {
        importPackage(android.widget);
        importPackage(android.graphics);
        importPackage(android.view);
        importPackage(android.text);
        importPackage(android.app);
        importPackage(androidx.viewpager.widget);
        importPackage(android.provider);
        importPackage(java.net);
        importPackage(android.os);
        importPackage(android.content);
        importPackage(android.content.res);
        importPackage(android.graphics.drawable);
        importPackage(android.util);
        importPackage(androidx.cardview.widget);
        importPackage(java.util);
        this.Width = device.getScreenWidth()
        this.Height = device.getScreenHeight();
        this.popWindow = null;
        logw('UI插件成功 更新时间 2025-6-19 16:07:43');
    }

    const instance = new jcUI(); // 只创建一次实例

//////////////-------------------关闭EC自带UI-------------------//////////////

    jcUI.prototype.EC = {

        /**
         * @description 设置全局背景(对多标签栏也生效)
         * @param {string|Drawable|null} arg 必填,可以是以下几种类型之一：
         * - 16进制颜色;例如 "#ff0000"
         * - res目录下图片的名字;例如 "demo.png"
         * - Drawable对象;例如 jcUI.Drawable.MiaoBian("#ff00ff")
         * - null;表示取消背景
         * @param touMing {number} 可选,透明度,取值0-255,数值越大越不透明(只对图片生效)
         */
        setBackground: function (arg, touMing) {
            //这个是全局的背景,设置这个连带多标签那也可以生效
            let rootview = ui.getActivity().getWindow().getDecorView().getChildAt(0).getChildAt(1).getChildAt(0).getChildAt(1).getChildAt(0).getChildAt(1).getChildAt(0)
            if (rootview) {
                instance.setBackground(rootview, arg, touMing);
            }
        },
        /**
         * @description 隐藏启动按钮
         */
        hideStarButton: function () {
            ui.getActivity().getWindow().getDecorView().getChildAt(0).getChildAt(1).getChildAt(0).getChildAt(1).getChildAt(0).getChildAt(1).getChildAt(0).getChildAt(1).setVisibility(View.GONE);
        },
        /**
         * @description 隐藏侧边栏
         */
        hideSideView: function () {
            ui.getActivity().getWindow().getDecorView().getChildAt(0).getChildAt(1).getChildAt(0).getChildAt(1).getChildAt(0).getChildAt(1).getChildAt(0).getChildAt(0).getChildAt(0).setVisibility(View.GONE);
            ui.getActivity().getWindow().getDecorView().getChildAt(0).getChildAt(1).getChildAt(0).getChildAt(1).getChildAt(0).getChildAt(0).setVisibility(View.GONE);
        },
        /**
         * @description 设置顶部状态栏颜色
         * @param {string} color 必填,16进制颜色
         */
        setStatusBarColor: function (color) {
            try {
                let Color = instance.parseColor(color);
                if (Color) {
                    ui.getActivity().getWindow().setStatusBarColor(Color);
                }
            } catch (e) {
                loge('setStatusBarColor: ' + e);
            }
        },
        /**
         * @description 设置底部状态栏颜色
         */
        setNavigationBarColor: function (color) {
            try {
                let Color = instance.parseColor(color);
                if (Color) {
                    ui.getActivity().getWindow().setNavigationBarColor(Color);
                }
            } catch (e) {
                loge('setNavigationBarColor: ' + e);
            }
        },
        /**
         * @description 获取多标签所有选项卡视图
         * @returns {Array} 返回数组
         * @example
         *  设置选项卡背景:
         *  let TabViewArr = jcUI.EC.getTabViewEx();
         *  for (let i = 0; i < TabViewArr.length; i++) {
         *      jcUI.setBackground(TabViewArr[i], '#ff0000')
         *  }
         */
        getTabViewEx: function () {
            let TabViewArr = [];
            try {
                let rootview = ui.getActivity().getWindow().getDecorView().getChildAt(0).getChildAt(1).getChildAt(0).getChildAt(1).getChildAt(0).getChildAt(1).getChildAt(0).getChildAt(0).getChildAt(1).getChildAt(0);
                if (rootview) {
                    let allChildView = rootview.getChildCount();
                    for (let i = 0; i < allChildView; i++) {
                        let TabView = rootview.getChildAt(i);
                        TabViewArr.push(TabView)
                    }
                }
            } catch (e) {
                loge('getTabViewEx: ' + e);
            }
            return TabViewArr;
        },
        /**
         * @description 获取所有选项卡TextView控件
         * @return {Array} 返回数组
         * @example
         *  设置标签文字颜色
         *  let tabArr = jcUI.EC.getTabViewTextView();
         *  for (let i = 0; i < tabArr.length; i++) {
         *      jcUI.setTextColor(tabArr[i], '#ec6d71')
         *  }
         */
        getTabViewTextView: function () {
            let TextArray = [];
            try {
                let rootview = ui.getActivity().getWindow().getDecorView().getChildAt(0).getChildAt(1).getChildAt(0).getChildAt(1).getChildAt(0).getChildAt(1).getChildAt(0).getChildAt(0).getChildAt(1).getChildAt(0);
                let allChildView = rootview.getChildCount();
                for (let i = 0; i < allChildView; i++) {
                    let textView = rootview.getChildAt(i).getChildAt(2);
                    if (textView) {
                        TextArray.push(textView);
                    }
                }
            } catch (e) {
                loge('setTabViewTextColor: ' + e);
            }
            return TextArray;
        }
    }

    jcUI.prototype.Utils = {
        /**
         * @description 显示对话框
         * @param Title {string} Title 可选,对话框标题
         * @param Message {string} Message 可选,对话框内容
         * @param showCancelBtn {boolean} 可选,是否显示取消按钮
         * @param titleIcon {string} 可选,对话框标题图标,(res目录;如: icon.png)
         * return {*} 无
         */
        showDialog: function (Title, Message, showCancelBtn, titleIcon) {
            try {
                let builder = new AlertDialog.Builder(ui.getActivity());
                builder.setTitle(Title);//设置对话框标题
                builder.setMessage(Message);//设置对话框消息
                if (titleIcon) {
                    let icon = ui.resResAsDrawable(titleIcon);
                    if (icon) {
                        builder.setIcon();
                    } else {
                        logw('res目录找不到 ' + titleIcon);
                    }
                }

                // dialog.getWindow().setLayout(800, 800); // 设置对话框的宽高  width 宽度 height 高度 单位像素
                builder.setPositiveButton("确定", function (dialog, which) {
                    dialog.dismiss();//关闭对话框
                    return true;
                });
                if (showCancelBtn) {
                    builder.setNegativeButton("取消", function (dialog, which) {
                        dialog.dismiss();//关闭对话框
                        return false;
                    });
                }
                // builder.setNeutralButton("其他", function (dialog, which) {
                //     // 其他事件处理
                //     dialog.dismiss();//关闭对话框
                // });


                //对话框显示的监听事件
                // dialog.setOnShowListener(new DialogInterface.OnShowListener({
                //         onShow: function (dialog) {
                //             logd("展示了");
                //         }
                //     }
                // ));
                //对话框消失的监听事件
                // dialog.setOnCancelListener(new DialogInterface.OnCancelListener({
                //     onCancel: function (dialog) {
                //         logd("关闭了");
                //     }
                // }));
                let dialog = builder.create();
                dialog.setCancelable(false);//表示点空白处取消不了
                dialog.show();
            } catch (e) {
                loge('showDialog' + e);
            }
        },
        /**
         * @description 创建一个窗口并打开,如果已经创建过了,就直接打开
         * @param xml {string} Title 必填,需要加载的xml窗口文件
         * @param parentViewTag {view} 必填,需要被加载的控件tag
         * @param inputData {string} 可选,需要添加的内容
         * @param width {number} 可选,窗口宽度,默认为与其父视图的宽度相同
         * @param height {number} 可选,窗口高度,默认600
         * return {boolean} 成功返回true,失败返回false
         */
        createPopupWindow: function (xml, parentViewTag, inputData, width, height) {
            try {
                if (instance.popWindow) {
                    instance.popWindow.showAtLocation(parentViewTag, Gravity.BOTTOM, 0, 0);
                    return instance.popWindow.isShowing();
                }
                if (!xml) {
                    logw('请先填写需要加载的xml文件');
                    return false;
                }
                if (!parentViewTag) {
                    logw('找不到父控件tag,请先设置父控件tag');
                    return false;
                }//查找父控件的tag,也就是pop窗口需要显示在哪个父控件上,一般是取main.xml顶层LinearLayout的tag
                let opitem = ui.parseView(xml); // 解析自定义xml布局文件为view对象
                if (!opitem) {
                    logw(xml + '加载失败,请检查文件名字');
                    return false;
                }
                width = width || ViewGroup.LayoutParams.MATCH_PARENT;
                height = height || 600;
                let popWnd = new PopupWindow(context);
                popWnd.setWidth(width); // 设置窗口宽度
                popWnd.setHeight(height); // 设置窗口高度
                popWnd.setContentView(opitem);// 设置PopupWindow的内容视图
                let img = ui.resResAsDrawable('pop.png');
                // popWnd.setBackgroundDrawable(new ColorDrawable(Color.parseColor("#00000000")));//设置窗口颜色,和下面的背景二选一
                if (img) {
                    img.setAlpha(180); // 设置透明度
                    popWnd.setBackgroundDrawable(img);
                }
                popWnd.setOutsideTouchable(false);//设置弹出窗口外部是否可触摸,实际测试好像没卵用
                popWnd.setFocusable(true);//设置弹出窗口是否可以获得焦点
                instance.popWindow = popWnd;
                //动态添加控件
                //在opitem对象的xml中查找list_View视图,list_View是LinearLayout这种级别的,也就是你想在那个布局下面动态添加子控件
                let list_View = opitem.findViewWithTag("list_View");
                if (list_View) {
                    let dataList = ['广东省广州市白云区站台路火车站东广场', '广东省广州市白云区站台路火车站东广场', '广东省广州市白云区站台路火车站东广场', '广东省广州市白云区站台路火车站东广场', '广东省广州市白云区站台路火车站东广场', '广东省广州市白云区站台路火车站东广场']
                    for (let i = 0; i < dataList.length; i++) {
                        let textView = new TextView(context);  //新建TextView视图
                        textView.setPadding(textView.getPaddingLeft(), 10, textView.getPaddingRight(), 10);
                        textView.setText(dataList[i]);       //设置TextView视图的text
                        instance.setTextColor(textView, '#dcdddd')
                        instance.setTextSize(textView, 22);       //设置TextView视图的text文字大小
                        textView.setGravity(Gravity.CENTER);          //设置TextView视图的对齐方式,CENTER是居中对齐
                        list_View.addView(textView);      //在list_View中挨个添加TextView视图
                        // 监听设置点击事件
                        textView.setOnClickListener(new View.OnClickListener(function (view) {
                                logd('被点击的对象: ' + instance.getText(view));
                                ui.当前位置.setText(instance.getText(view));
                                popWnd.dismiss();//关闭窗口
                            })
                        )
                    }
                }
                this.createPopupWindow(xml, parentViewTag, width, height);
            } catch (e) {
                loge('createPopupWindow: ' + e);
            }
            return false;
        },
    }

//////////////-------------------控件类-------------------//////////////
    jcUI.prototype.View = {
        /**
         * @description  获取所有View控件的tag属性 (这个作用主要是用来监听事件)
         * @returns {Array} 返回数组
         */
        get_All_Tag: function () {
            return instance.get_All_Tag('View');
        },
        /**
         * @description  获取所有View控件对象 (这个作用主要是用来设置颜色大小等其他参数)
         * @returns {Array} 返回数组
         */
        get_All_view: function () {
            return instance.get_All_Tag('View', true);
        },
        /**
         * @description  设置背景颜色或图片
         * @param {view} View 必填,ui对象
         * @param {string|Drawable|null} arg 必填,可以是以下几种类型之一：
         * - 16进制颜色;例如 "#ff0000"
         * - res目录下图片的名字;例如 "demo.png"
         * - Drawable对象;例如 jcUI.Drawable.MiaoBian("#ff00ff")
         * - null;表示取消背景
         * @param touMing {number} 可选,透明度,取值0-255,数值越大越不透明(只对图片生效)
         * @return {*}    无
         */
        setBackground: function (View, arg, touMing) {
            instance.setBackground(View, arg, touMing);
        },
        /**
         * @description 设置控件的宽度和高度
         * @param {view} View 必填,ui对象
         * @param {int} width 可选,需要设置的宽度
         * @param {int} height 可选,需要设置的高度
         * @return {*} 无
         */
        setViewWidthAndHeight: function (View, width, height) {
            instance.setViewWidthAndHeight(View, width, height);
        },
        /**
         * @description  设置控件显示状态
         * @param {view} View 必填,ui对象
         * @param {int} state 必填,需要设置的显示状态;4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件;
         * @return {*} 无
         */
        setVisibility: function (View, state) {
            instance.setVisibility(View, state);
        },
        /**
         * @description 获取控件显示状态
         * @param {view} View 必填,ui对象
         * @return {int} 4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件,-1表示返回错误
         */
        getVisibility: function (View) {
            return instance.getVisibility(View);
        },
        /**
         * @description  设置对齐方式
         * @param View {view} 必填,ui对象
         * @param GravityType {number} 必填,1-9,表示对齐的方向
         */
        setGravity: function (View, GravityType) {
            instance.setGravity(View, GravityType);
        },
        /**
         * @description 设置控件的内边距
         * @param View {view} 必填,ui对象
         * @param left {number} 必填,左边距
         * @param top {number} 必填,上边距
         * @param right {number} 必填,右边距
         * @param bottom {number} 必填,下边距
         * @return {*} 无
         */
        setPadding: function (View, left, top, right, bottom) {
            instance.setPadding(View, left, top, right, bottom);
        }
    }//View

    jcUI.prototype.TextView = {
        /**
         * @description  获取所有TextView控件的tag属性 (这个作用主要是用来监听事件)
         * @returns {Array} 返回数组
         */
        get_All_Tag: function () {
            return instance.get_All_Tag('TextView');
        },
        /**
         * @description  获取所有TextView控件对象 (这个作用主要是用来设置颜色大小等其他参数)
         * @returns {Array} 返回数组
         */
        get_All_view: function () {
            return instance.get_All_Tag('TextView', true);
        },
        /**
         * @description  设置背景颜色或图片
         * @param {view} View 必填,ui对象
         * @param {string|Drawable|null} arg 必填,可以是以下几种类型之一：
         *  - 16进制颜色;例如 "#ff0000"
         *  - res目录下图片的名字;例如 "demo.png"
         *  - Drawable对象;例如 jcUI.Drawable.MiaoBian("#ff00ff")
         *  - null;表示取消背景
         * @param touMing {number} 可选,透明度,取值0-255,数值越大越不透明(只对图片生效)
         * @return {*}    无
         */
        setBackground: function (View, arg, touMing) {
            instance.setBackground(View, arg, touMing);
        },
        /**
         * @description 设置控件的宽度和高度
         * @param {view} View 必填,ui对象
         * @param {int} width 可选,需要设置的宽度
         * @param {int} height 可选,需要设置的高度
         * @return {*} 无
         */
        setViewWidthAndHeight: function (View, width, height) {
            instance.setViewWidthAndHeight(View, width, height);
        },
        /**
         * @description  设置控件显示状态
         * @param {view} View 必填,ui对象
         * @param {int} state 必填,需要设置的显示状态;4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件;
         * @return {*} 无
         */
        setVisibility: function (View, state) {
            instance.setVisibility(View, state);
        },
        /**
         * @description 获取控件显示状态
         * @param {view} View 必填,ui对象
         * @return {int} 4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件,-1表示返回错误
         */
        getVisibility: function (View) {
            return instance.getVisibility(View);
        },
        /**
         * @description  设置对齐方式
         * @param View {view} 必填,ui对象
         * @param GravityType {number} 必填,1-9,表示对齐的方向
         */
        setGravity: function (View, GravityType) {
            instance.setGravity(View, GravityType);
        },
        /**
         * @description 获取ui对象的text
         * @return {string|null}    成功返回字符串,失败返回null
         */
        getText: function (View) {
            return instance.getText(View);
        },
        /**
         * @description  设置ui对象的text
         * @return {*} 无
         */
        setText: function (View, text) {
            instance.setText(View, text);
        },
        /**
         * @description 设置字体大小
         * @param {view} View 必填,ui对象
         * @param {int} size 必填,字体大小
         * @return {*}    无
         */
        setTextSize: function (View, size) {
            instance.setTextSize(View, size);
        },
        /**
         * @description  设置字体颜色
         * @param {view} View 必填,ui对象
         * @param {string} color 必填,16进制颜色
         * @return {*}    无
         */
        setTextColor: function (View, color) {
            instance.setTextColor(View, color);
        },
        /**
         * @description  字体加粗
         * @param {view} View 必填,ui对象
         * @return {*}    无
         */
        setTypeface: function (View) {
            instance.setTypeface(View);
        },
        /**
         * @description 设置字体样式
         * @param {view} View 必填,ui对象
         * @param {Object} Font 必填,字体对象
         * @return {*}    无
         */
        setFont: function (View, Font) {
            instance.setFont(View, Font);
        },
        /**
         * @description  是否设置单行输入
         * @param {view}    View 必填,ui对象
         * @param {boolean} isSingleLine 必填,是否设置单行输入
         * @return {*}    无
         */
        setSingleLine: function (View, isSingleLine) {
            instance.setSingleLine(View, isSingleLine);
        },
        /**
         * @description  设置输入最大行数
         * @param {view}    View 必填,ui对象
         * @param {number} lines 必填,最大输入行数
         * @return {*}    无
         */
        setMaxLines: function (View, lines) {
            instance.setMaxLines(View, lines);
        },
        /**
         * @description  设置可以长按复制粘贴
         * @param {view}    View 必填,ui对象
         * @return {*}    无
         */
        setTextIsSelectable: function (View) {
            instance.setTextIsSelectable(View);
        },
        /**
         * @description  设置跑马灯效果
         * @param {view}    View 必填,ui对象
         * @return {*}    无
         */
        setPaoMaDeng: function (View) {
            //跑马灯只能实现一个文本的效果！！  多个文本同时跑马灯目前不可实现！！
            try {
                View.setSingleLine(true);                          // 单行显示
                View.setEllipsize(TextUtils.TruncateAt.MARQUEE);   // 设置跑马灯显示效果
                View.setMarqueeRepeatLimit(-1);                    // 无限循环滚动
                View.setFocusableInTouchMode(true);                // 可以通过触摸获取焦点
                View.requestFocus();                               // textview 强制获得焦点

                // View.setFocusable(true);                           // 可以获取焦点
                // View.setHorizontallyScrolling(true);          // 设置文本水平滚动
                // View.setSelected(true);                             // 设置选中状态
            } catch (e) {
                loge('setPaoMaDeng' + e);
            }
        },
        /**
         * @description 设置控件的内边距
         * @param View {view} 必填,ui对象
         * @param left {number} 必填,左边距
         * @param top {number} 必填,上边距
         * @param right {number} 必填,右边距
         * @param bottom {number} 必填,下边距
         * @return {*} 无
         */
        setPadding: function (View, left, top, right, bottom) {
            instance.setPadding(View, left, top, right, bottom);
        },
        /**
         * @description 动态添加文字框控件
         * @param parentView {view} 必填,被添加的父控件
         * @param viewConfig {object} 可选,控件配置(tag,对齐方式,文字等)
         * @return {*} 无
         * @example
         * 用法一: 在tag标签为root的控件上动态添加一个文字框控件
         * jcUI.TextView.add_TextView(ui.root);
         */
        add_TextView: function (parentView, viewConfig, viewType) {
            if (!parentView) {
                logd('参数错误');
                return;
            }
            viewConfig = viewConfig || {
                width: '',//LinearLayout.LayoutParams.MATCH_PARENT填充满
                height: '',// LinearLayout.LayoutParams.WRAP_CONTENT自适应
                Background: '',//父控件背景颜色,可以选择颜色字符串,res目录下的照片名字,或者自定义绘制
                index: '',//number类型,表示添加到第几个位置
                tag: '',//string类型,控件tag属性,用于后期监听点击时间
                setGravity: '', //number类型,父控件对齐方向,1-9,表示几点钟位置
                setText: '',//string类型,设置文字内容
                textColor: '',//string类型,设置文字颜色
                textSize: '',//number类型,设置文字大小
                Font: ''//jcUI.createFont('字体.ttf')返回值,设置字体
            }
            viewType = viewType || 'TextView';
            try {
                let textView = instance.createView(viewType, parentView, viewConfig);
                if (textView) {
                    if (viewConfig.setText) instance.setText(textView, viewConfig.setText);
                    if (viewConfig.textColor) instance.setTextColor(textView, viewConfig.textColor);
                    if (viewConfig.textSize) instance.setTextSize(textView, viewConfig.textSize);
                    if (viewConfig.Font) instance.setFont(textView, viewConfig.Font);
                }
            } catch (e) {
                loge('add_' + viewType + ': ' + e);
            }
        },
        /**
         * @description 设置文字控制是否可以长按复制
         * @param View {view} 必填,被操作的控件
         * @param isCopy {boolean} 可选,是否可以长按复制(默认false)
         * @return {*} 无
         * @example
         * jcUI.TextView.setCopy(ui.root);
         */
        setCopy: function (View, isCopy = false) {
            try {
                View.setTextIsSelectable(isCopy);
            } catch (e) {
                loge('setCopy: ' + e);
            }
        }
    }//文本框

    jcUI.prototype.EditText = {
        /**
         * @description  获取所有EditText控件的tag属性 (这个作用主要是用来监听事件)
         * @returns {Array} 返回数组
         */
        get_All_Tag: function () {
            return instance.get_All_Tag('EditText');
        },
        /**
         * @description  获取所有EditText控件对象 (这个作用主要是用来设置颜色大小等其他参数)
         * @returns {Array} 返回数组
         */
        get_All_view: function () {
            return instance.get_All_Tag('EditText', true);
        },
        /**
         * @description  设置背景颜色或图片
         * @param {view} View 必填,ui对象
         * @param {string|Drawable|null} arg 必填,可以是以下几种类型之一：
         * - 16进制颜色;例如 "#ff0000"
         * - res目录下图片的名字;例如 "demo.png"
         * - Drawable对象;例如 jcUI.Drawable.MiaoBian("#ff00ff")
         * - null;表示取消背景
         * @param touMing {number} 可选,透明度,取值0-255,数值越大越不透明(只对图片生效)
         * @return {*}    无
         */
        setBackground: function (View, arg, touMing) {
            instance.setBackground(View, arg, touMing);
        },
        /**
         * @description 设置控件的宽度和高度
         * @param {view} View 必填,ui对象
         * @param {int} width 可选,需要设置的宽度
         * @param {int} height 可选,需要设置的高度
         * @return {*} 无
         */
        setViewWidthAndHeight: function (View, width, height) {
            instance.setViewWidthAndHeight(View, width, height);
        },
        /**
         * @description  设置控件显示状态
         * @param {view} View 必填,ui对象
         * @param {int} state 必填,需要设置的显示状态;4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件;
         * @return {*} 无
         */
        setVisibility: function (View, state) {
            instance.setVisibility(View, state);
        },
        /**
         * @description 获取控件显示状态
         * @param {view} View 必填,ui对象
         * @return {int} 4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件,-1表示返回错误
         */
        getVisibility: function (View) {
            return instance.getVisibility(View);
        },
        /**
         * @description  设置对齐方式
         * @param View {view} 必填,ui对象
         * @param GravityType {number} 必填,1-9,表示对齐的方向
         */
        setGravity: function (View, GravityType) {
            instance.setGravity(View, GravityType);
        },
        /**
         * @description 获取ui对象的text
         * @return {string|null}    成功返回字符串,失败返回null
         */
        getText: function (View) {
            return instance.getText(View);
        },
        /**
         * @description  设置ui对象的text
         * @return {*} 无
         */
        setText: function (View, text) {
            instance.setText(View, text);
        },
        /**
         * @description 设置字体大小
         * @param {view} View 必填,ui对象
         * @param {int} size 必填,字体大小
         * @return {*}    无
         */
        setTextSize: function (View, size) {
            instance.setTextSize(View, size);
        },
        /**
         * @description  设置字体颜色
         * @param {view} View 必填,ui对象
         * @param {string} color 必填,16进制颜色
         * @return {*}    无
         */
        setTextColor: function (View, color) {
            instance.setTextColor(View, color);
        },
        /**
         * @description  字体加粗
         * @param {view} View 必填,ui对象
         * @return {*}    无
         */
        setTypeface: function (View) {
            instance.setTypeface(View);
        },
        /**
         * @description 设置字体样式
         * @param {view} View 必填,ui对象
         * @param {Object} Font 必填,字体对象
         * @return {*}    无
         */
        setFont: function (View, Font) {
            instance.setFont(View, Font);
        },
        /**
         * @description  是否设置单行输入
         * @param {view}    View 必填,ui对象
         * @param {boolean} isSingleLine 必填,是否设置单行输入
         * @return {*}    无
         */
        setSingleLine: function (View, isSingleLine) {
            instance.setSingleLine(View, isSingleLine);
        },
        /**
         * @description  设置输入最大输入行数
         * @param {view}    View 必填,ui对象
         * @param {number} lines 必填,最大输入行数
         * @return {*}    无
         */
        setMaxLines: function (View, lines) {
            instance.setMaxLines(View, lines);
        },
        /**
         * @description  设置输入框提示文字
         * @param {view}    View 必填,ui对象
         * @param {string} text 必填,需要提示的文字
         * @return {*}    无
         */
        setHint: function (View, text) {
            instance.setHint(View, text);
        },
        /**
         * @description  设置编辑框提示文字颜色
         * @param {view}    View 必填,ui对象
         * @param {string} color 必填,16进制颜色
         * @return {*}    无
         */
        setHintTextColor: function (View, color) {
            instance.setHintTextColor(View, color);
        },
        /**
         * @description  设置编辑框下划线颜色
         * @param {view}    View 必填,ui对象
         * @param {string} normal 必填,默认颜色,16进制颜色
         * @param {string} focused 必填,获取焦点颜色,16进制颜色
         * @return {*}    无
         */
        setBackgroundTintList: function (View, normal, focused) {
            instance.setBackgroundTintList(View, normal, focused);
        },
        /**
         * @description 设置控件的内边距
         * @param View {view} 必填,ui对象
         * @param left {number} 必填,左边距
         * @param top {number} 必填,上边距
         * @param right {number} 必填,右边距
         * @param bottom {number} 必填,下边距
         * @return {*} 无
         */
        setPadding: function (View, left, top, right, bottom) {
            instance.setPadding(View, left, top, right, bottom);
        },
        /**
         * @description 动态添加输入框控件
         * @param parentView {view} 必填,被添加的父控件
         * @param viewConfig {object} 可选,控件配置(tag,对齐方式,文字等)
         * @return {*} 无
         * @example
         * 用法一: 在tag标签为root的控件上动态添加一个文字框控件
         * jcUI.add_EditText(ui.root);
         */
        add_EditText: function (parentView, viewConfig) {
            if (!parentView) {
                logd('参数错误');
                return;
            }
            viewConfig = viewConfig || {
                width: LinearLayout.LayoutParams.MATCH_PARENT,//LinearLayout.LayoutParams.MATCH_PARENT填充满
                height: '',// LinearLayout.LayoutParams.WRAP_CONTENT自适应
                Background: '',//父控件背景颜色,可以选择颜色字符串,res目录下的照片名字,或者自定义绘制
                index: '',//number类型,表示添加到第几个位置
                tag: '',//string类型,控件tag属性,用于后期监听点击时间
                setGravity: '', //number类型,父控件对齐方向,1-9,表示几点钟位置
                setText: '',//string类型,设置文字内容
                textColor: '',//string类型,设置文字颜色
                textSize: '',//number类型,设置文字大小
                Font: '',//jcUI.createFont('字体.ttf')返回值,设置字体
                Hint: '',//string类型,设置输入框提示文字
                HintTextColor: '',//string类型,设置编辑框提示文字颜色
                SingleLine: false,//boolean类型,是否设置单行输入
                BackgroundTintList: ''//array类型,第一个参数是未选中的颜色,第二个参数是获取焦点的颜色
            }
            try {
                let EditText = instance.createView('EditText', parentView, viewConfig);
                if (EditText) {
                    if (viewConfig.setText) instance.setText(EditText, viewConfig.setText);
                    if (viewConfig.textColor) instance.setTextColor(EditText, viewConfig.textColor);
                    if (viewConfig.textSize) instance.setTextSize(EditText, viewConfig.textSize);
                    if (viewConfig.Font) instance.setFont(EditText, viewConfig.Font);
                    if (viewConfig.Hint) instance.setHint(EditText, viewConfig.Hint);
                    if (viewConfig.HintTextColor) instance.setHintTextColor(EditText, viewConfig.HintTextColor);
                    if (viewConfig.SingleLine) instance.setSingleLine(EditText, true);
                    if (viewConfig.BackgroundTintList) instance.setBackgroundTintList(EditText, viewConfig.BackgroundTintList[0], viewConfig.BackgroundTintList[1]);
                }
            } catch (e) {
                loge('add_EditText: ' + e);
            }
        }
    }//输入框

    jcUI.prototype.Button = {
        /**
         * @description  获取所有Button控件的tag属性 (这个作用主要是用来监听事件)
         * @returns {Array} 返回数组
         */
        get_All_Tag: function () {
            return instance.get_All_Tag('Button');
        },
        /**
         * @description  获取所有Button控件对象 (这个作用主要是用来设置颜色大小等其他参数)
         * @returns {Array} 返回数组
         */
        get_All_view: function () {
            return instance.get_All_Tag('Button', true);
        },
        /**
         * @description  设置背景颜色或图片
         * @param {view} View 必填,ui对象
         * @param {string|Drawable|null} arg 必填,可以是以下几种类型之一：
         * - 16进制颜色;例如 "#ff0000"
         * - res目录下图片的名字;例如 "demo.png"
         * - Drawable对象;例如 jcUI.Drawable.MiaoBian("#ff00ff")
         * - null;表示取消背景
         * @param touMing {number} 可选,透明度,取值0-255,数值越大越不透明(只对图片生效)
         * @return {*}    无
         */
        setBackground: function (View, arg, touMing) {
            instance.setBackground(View, arg, touMing);
        },
        /**
         * @description 设置控件的宽度和高度
         * @param {view} View 必填,ui对象
         * @param {int} width 可选,需要设置的宽度
         * @param {int} height 可选,需要设置的高度
         * @return {*} 无
         */
        setViewWidthAndHeight: function (View, width, height) {
            instance.setViewWidthAndHeight(View, width, height);
        },
        /**
         * @description  设置控件显示状态
         * @param {view} View 必填,ui对象
         * @param {int} state 必填,需要设置的显示状态;4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件;
         * @return {*} 无
         */
        setVisibility: function (View, state) {
            instance.setVisibility(View, state);
        },
        /**
         * @description 获取控件显示状态
         * @param {view} View 必填,ui对象
         * @return {int} 4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件,-1表示返回错误
         */
        getVisibility: function (View) {
            return instance.getVisibility(View);
        },
        /**
         * @description  设置对齐方式
         * @param View {view} 必填,ui对象
         * @param GravityType {number} 必填,1-9,表示对齐的方向
         */
        setGravity: function (View, GravityType) {
            instance.setGravity(View, GravityType);
        },
        /**
         * @description 获取ui对象的text
         * @return {string|null}    成功返回字符串,失败返回null
         */
        getText: function (View) {
            return instance.getText(View);
        },
        /**
         * @description  设置ui对象的text
         * @return {*} 无
         */
        setText: function (View, text) {
            instance.setText(View, text);
        },
        /**
         * @description 设置字体大小
         * @param {view} View 必填,ui对象
         * @param {int} size 必填,字体大小
         * @return {*}    无
         */
        setTextSize: function (View, size) {
            instance.setTextSize(View, size);
        },
        /**
         * @description  设置字体颜色
         * @param {view} View 必填,ui对象
         * @param {string} color 必填,16进制颜色
         * @return {*}    无
         */
        setTextColor: function (View, color) {
            instance.setTextColor(View, color);
        },
        /**
         * @description  字体加粗
         * @param {view} View 必填,ui对象
         * @return {*}    无
         */
        setTypeface: function (View) {
            instance.setTypeface(View);
        },
        /**
         * @description 设置字体样式
         * @param {view} View 必填,ui对象
         * @param {Object} Font 必填,字体对象
         * @return {*}    无
         */
        setFont: function (View, Font) {
            instance.setFont(View, Font);
        },
        /**
         * @description  是否设置单行输入
         * @param {view}    View 必填,ui对象
         * @param {boolean} isSingleLine 必填,是否设置单行输入
         * @return {*}    无
         */
        setSingleLine: function (View, isSingleLine) {
            instance.setSingleLine(View, isSingleLine);
        },
        /**
         * @description  设置输入最大输入行数
         * @param {view}    View 必填,ui对象
         * @param {number} lines 必填,最大输入行数
         * @return {*}    无
         */
        setMaxLines: function (View, lines) {
            instance.setMaxLines(View, lines);
        },
        /**
         * @description 设置控件的内边距
         * @param View {view} 必填,ui对象
         * @param left {number} 必填,左边距
         * @param top {number} 必填,上边距
         * @param right {number} 必填,右边距
         * @param bottom {number} 必填,下边距
         * @return {*} 无
         */
        setPadding: function (View, left, top, right, bottom) {
            instance.setPadding(View, left, top, right, bottom);
        },
        /**
         * @description 动态添加按钮控件
         * @param parentView {view} 必填,被添加的父控件
         * @param viewConfig {object} 可选,控件配置(tag,对齐方式,文字等)
         * @return {*} 无
         * @example
         * 用法一: 在tag标签为root的控件上动态添加一个文字框控件
         * jcUI.add_Button(ui.root);
         */
        add_Button: function (parentView, viewConfig) {
            instance.TextView.add_TextView(parentView, viewConfig, 'Button')
        }
    }//按钮

    jcUI.prototype.CheckBox = {
        /**
         * @description  获取所有CheckBox控件的tag属性 (这个作用主要是用来监听事件)
         * @returns {Array} 返回数组
         */
        get_All_Tag: function () {
            return instance.get_All_Tag('CheckBox');
        },
        /**
         * @description  获取所有CheckBox控件对象 (这个作用主要是用来设置颜色大小等其他参数)
         * @returns {Array} 返回数组
         */
        get_All_view: function () {
            return instance.get_All_Tag('CheckBox', true);
        },
        /**
         * @description  设置背景颜色或图片
         * @param {view} View 必填,ui对象
         * @param {string|Drawable|null} arg 必填,可以是以下几种类型之一：
         * - 16进制颜色;例如 "#ff0000"
         * - res目录下图片的名字;例如 "demo.png"
         * - Drawable对象;例如 jcUI.Drawable.MiaoBian("#ff00ff")
         * - null;表示取消背景
         * @param touMing {number} 可选,透明度,取值0-255,数值越大越不透明(只对图片生效)
         * @return {*}    无
         */
        setBackground: function (View, arg, touMing) {
            instance.setBackground(View, arg, touMing);
        },
        /**
         * @description 设置控件的宽度和高度
         * @param {view} View 必填,ui对象
         * @param {int} width 可选,需要设置的宽度
         * @param {int} height 可选,需要设置的高度
         * @return {*} 无
         */
        setViewWidthAndHeight: function (View, width, height) {
            instance.setViewWidthAndHeight(View, width, height);
        },
        /**
         * @description  设置控件显示状态
         * @param {view} View 必填,ui对象
         * @param {int} state 必填,需要设置的显示状态;4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件;
         * @return {*} 无
         */
        setVisibility: function (View, state) {
            instance.setVisibility(View, state);
        },
        /**
         * @description 获取控件显示状态
         * @param {view} View 必填,ui对象
         * @return {int} 4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件,-1表示返回错误
         */
        getVisibility: function (View) {
            return instance.getVisibility(View);
        },
        /**
         * @description  设置对齐方式
         * @param View {view} 必填,ui对象
         * @param GravityType {number} 必填,1-9,表示对齐的方向
         */
        setGravity: function (View, GravityType) {
            instance.setGravity(View, GravityType);
        },
        /**
         * @description 获取ui对象的text
         * @return {string|null}    成功返回字符串,失败返回null
         */
        getText: function (View) {
            return instance.getText(View);
        },
        /**
         * @description  设置ui对象的text
         * @return {*} 无
         */
        setText: function (View, text) {
            instance.setText(View, text);
        },
        /**
         * @description 设置字体大小
         * @param {view} View 必填,ui对象
         * @param {int} size 必填,字体大小
         * @return {*}    无
         */
        setTextSize: function (View, size) {
            instance.setTextSize(View, size);
        },
        /**
         * @description  设置字体颜色
         * @param {view} View 必填,ui对象
         * @param {string} color 必填,16进制颜色
         * @return {*}    无
         */
        setTextColor: function (View, color) {
            instance.setTextColor(View, color);
        },
        /**
         * @description  字体加粗
         * @param {view} View 必填,ui对象
         * @return {*}    无
         */
        setTypeface: function (View) {
            instance.setTypeface(View);
        },
        /**
         * @description 设置字体样式
         * @param {view} View 必填,ui对象
         * @param {Object} Font 必填,字体对象
         * @return {*}    无
         */
        setFont: function (View, Font) {
            instance.setFont(View, Font);
        },
        /**
         * @description  是否设置单行输入
         * @param {view}    View 必填,ui对象
         * @param {boolean} isSingleLine 必填,是否设置单行输入
         * @return {*}    无
         */
        setSingleLine: function (View, isSingleLine) {
            instance.setSingleLine(View, isSingleLine);
        },
        /**
         * @description  设置输入最大输入行数
         * @param {view}    View 必填,ui对象
         * @param {number} lines 必填,最大输入行数
         * @return {*}    无
         */
        setMaxLines: function (View, lines) {
            instance.setMaxLines(View, lines);
        },
        /**
         * @description  设置图标颜色
         * @param {view} View 必填,ui对象
         * @param {string} color 必填,16进制颜色
         * @return {*}    无
         */
        setButtonTintList: function (View, color) {
            instance.setButtonTintList(View, color);
        },
        /**
         * @description  设置文字位置靠左
         * @param {view} View 必填,ui对象
         * @return {*}    无
         */
        setradioButtonText: function (View) {
            instance.setradioButtonText(View);
        },
        /**
         * @description  设置选中状态
         * @param {view} View 必填,ui对象
         * @param {boolean} isChecked 必填,是否选中
         * @return {*}    无
         */
        setChecked: function (View, isChecked) {
            instance.setChecked(View, isChecked);
        },
        /**
         * @description  获取选中状态
         * @param {view} View 必填,ui对象
         * @return {boolean}    已选中返回true,未选中返回false
         */
        getChecked: function (View) {
            return instance.getChecked(View);
        },
        /**
         * @description  绘制按钮自定义图标,用于替换官方的图标样式
         * @param {view} View 必填,ui对象
         * @param {view} Image 必填,必填,res目录图片名字
         * @return {*}    无
         */
        setButtonIcon: function (View, Image) {
            instance.setButtonIcon(View, Image);
        },
        /**
         * @description 设置控件的内边距
         * @param View {view} 必填,ui对象
         * @param left {number} 必填,左边距
         * @param top {number} 必填,上边距
         * @param right {number} 必填,右边距
         * @param bottom {number} 必填,下边距
         * @return {*} 无
         */
        setPadding: function (View, left, top, right, bottom) {
            instance.setPadding(View, left, top, right, bottom);
        }
    }//多选框

    jcUI.prototype.RadioButton = {
        /**
         * @description  获取所有RadioButton控件的tag属性 (这个作用主要是用来监听事件)
         * @returns {Array} 返回数组
         */
        get_All_Tag: function () {
            return instance.get_All_Tag('RadioButton');
        },
        /**
         * @description  获取所有RadioButton控件对象 (这个作用主要是用来设置颜色大小等其他参数)
         * @returns {Array} 返回数组
         */
        get_All_view: function () {
            return instance.get_All_Tag('RadioButton', true);
        },
        /**
         * @description  设置背景颜色或图片
         * @param {view} View 必填,ui对象
         * @param {string|Drawable|null} arg 必填,可以是以下几种类型之一：
         * - 16进制颜色;例如 "#ff0000"
         * - res目录下图片的名字;例如 "demo.png"
         * - Drawable对象;例如 jcUI.Drawable.MiaoBian("#ff00ff")
         * - null;表示取消背景
         * @param touMing {number} 可选,透明度,取值0-255,数值越大越不透明(只对图片生效)
         * @return {*}    无
         */
        setBackground: function (View, arg, touMing) {
            instance.setBackground(View, arg, touMing);
        },
        /**
         * @description 设置控件的宽度和高度
         * @param {view} View 必填,ui对象
         * @param {int} width 可选,需要设置的宽度
         * @param {int} height 可选,需要设置的高度
         * @return {*} 无
         */
        setViewWidthAndHeight: function (View, width, height) {
            instance.setViewWidthAndHeight(View, width, height);
        },
        /**
         * @description  设置控件显示状态
         * @param {view} View 必填,ui对象
         * @param {int} state 必填,需要设置的显示状态;4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件;
         * @return {*} 无
         */
        setVisibility: function (View, state) {
            instance.setVisibility(View, state);
        },
        /**
         * @description 获取控件显示状态
         * @param {view} View 必填,ui对象
         * @return {int} 4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件,-1表示返回错误
         */
        getVisibility: function (View) {
            return instance.getVisibility(View);
        },
        /**
         * @description  设置对齐方式
         * @param View {view} 必填,ui对象
         * @param GravityType {number} 必填,1-9,表示对齐的方向
         */
        setGravity: function (View, GravityType) {
            instance.setGravity(View, GravityType);
        },
        /**
         * @description 获取ui对象的text
         * @return {string|null}    成功返回字符串,失败返回null
         */
        getText: function (View) {
            return instance.getText(View);
        },
        /**
         * @description  设置ui对象的text
         * @return {*} 无
         */
        setText: function (View, text) {
            instance.setText(View, text);
        },
        /**
         * @description 设置字体大小
         * @param {view} View 必填,ui对象
         * @param {int} size 必填,字体大小
         * @return {*}    无
         */
        setTextSize: function (View, size) {
            instance.setTextSize(View, size);
        },
        /**
         * @description  设置字体颜色
         * @param {view} View 必填,ui对象
         * @param {string} color 必填,16进制颜色
         * @return {*}    无
         */
        setTextColor: function (View, color) {
            instance.setTextColor(View, color);
        },
        /**
         * @description  字体加粗
         * @param {view} View 必填,ui对象
         * @return {*}    无
         */
        setTypeface: function (View) {
            instance.setTypeface(View);
        },
        /**
         * @description 设置字体样式
         * @param {view} View 必填,ui对象
         * @param {Object} Font 必填,字体对象
         * @return {*}    无
         */
        setFont: function (View, Font) {
            instance.setFont(View, Font);
        },
        /**
         * @description  是否设置单行输入
         * @param {view}    View 必填,ui对象
         * @param {boolean} isSingleLine 必填,是否设置单行输入
         * @return {*}    无
         */
        setSingleLine: function (View, isSingleLine) {
            instance.setSingleLine(View, isSingleLine);
        },
        /**
         * @description  设置输入最大输入行数
         * @param {view}    View 必填,ui对象
         * @param {number} lines 必填,最大输入行数
         * @return {*}    无
         */
        setMaxLines: function (View, lines) {
            instance.setMaxLines(View, lines);
        },
        /**
         * @description  设置图标颜色
         * @param {view} View 必填,ui对象
         * @param {string} color 必填,16进制颜色
         * @return {*}    无
         */
        setButtonTintList: function (View, color) {
            instance.setButtonTintList(View, color);
        },
        /**
         * @description  设置文字位置靠左
         * @param {view} View 必填,ui对象
         * @return {*}    无
         */
        setradioButtonText: function (View) {
            instance.setradioButtonText(View);
        },
        /**
         * @description  设置选中状态
         * @param {view} View 必填,ui对象
         * @param {boolean} isChecked 必填,是否选中
         * @return {*}    无
         */
        setChecked: function (View, isChecked) {
            instance.setChecked(View, isChecked);
        },
        /**
         * @description  获取选中状态
         * @param {view} View 必填,ui对象
         * @return {boolean}    已选中返回true,未选中返回false
         */
        getChecked: function (View) {
            return instance.getChecked(View);
        },
        /**
         * @description  绘制按钮自定义图标,用于替换官方的图标样式
         * @param {view} View 必填,ui对象
         * @param {view} Image 必填,必填,res目录图片名字
         * @return {*}    无
         */
        setButtonIcon: function (View, Image) {
            instance.setButtonIcon(View, Image);
        },
        /**
         * @description 设置控件的内边距
         * @param View {view} 必填,ui对象
         * @param left {number} 必填,左边距
         * @param top {number} 必填,上边距
         * @param right {number} 必填,右边距
         * @param bottom {number} 必填,下边距
         * @return {*} 无
         */
        setPadding: function (View, left, top, right, bottom) {
            instance.setPadding(View, left, top, right, bottom);
        }
    }//单选框

    jcUI.prototype.Switch = {
        /**
         * @description  获取所有Switch控件的tag属性 (这个作用主要是用来监听事件)
         * @returns {Array} 返回数组
         */
        get_All_Tag: function () {
            return instance.get_All_Tag('Switch');
        },
        /**
         * @description  获取所有Switch控件对象 (这个作用主要是用来设置颜色大小等其他参数)
         * @returns {Array} 返回数组
         */
        get_All_view: function () {
            return instance.get_All_Tag('Switch', true);
        },
        /**
         * @description  设置背景颜色或图片
         * @param {view} View 必填,ui对象
         * @param {string|Drawable|null} arg 必填,可以是以下几种类型之一：
         * - 16进制颜色;例如 "#ff0000"
         * - res目录下图片的名字;例如 "demo.png"
         * - Drawable对象;例如 jcUI.Drawable.MiaoBian("#ff00ff")
         * - null;表示取消背景
         * @param touMing {number} 可选,透明度,取值0-255,数值越大越不透明(只对图片生效)
         * @return {*}    无
         */
        setBackground: function (View, arg, touMing) {
            instance.setBackground(View, arg, touMing);
        },
        /**
         * @description 设置控件的宽度和高度
         * @param {view} View 必填,ui对象
         * @param {int} width 可选,需要设置的宽度
         * @param {int} height 可选,需要设置的高度
         * @return {*} 无
         */
        setViewWidthAndHeight: function (View, width, height) {
            instance.setViewWidthAndHeight(View, width, height);
        },
        /**
         * @description 设置控件显示状态
         * @param {view} View 必填,ui对象
         * @param {int} state 必填,需要设置的显示状态;4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件;
         * @return {*} 无
         */
        setVisibility: function (View, state) {
            instance.setVisibility(View, state);
        },
        /**
         * @description 获取控件显示状态
         * @param {view} View 必填,ui对象
         * @return {int} 4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件,-1表示返回错误
         */
        getVisibility: function (View) {
            return instance.getVisibility(View);
        },
        /**
         * @description  设置对齐方式
         * @param View {view} 必填,ui对象
         * @param GravityType {number} 必填,1-9,表示对齐的方向
         */
        setGravity: function (View, GravityType) {
            instance.setGravity(View, GravityType);
        },
        /**
         * @description 获取ui对象的text
         * @return {string|null}    成功返回字符串,失败返回null
         */
        getText: function (View) {
            return instance.getText(View);
        },
        /**
         * @description  设置ui对象的text
         * @return {*} 无
         */
        setText: function (View, text) {
            instance.setText(View, text);
        },
        /**
         * @description 设置字体大小
         * @param {view} View 必填,ui对象
         * @param {int} size 必填,字体大小
         * @return {*}    无
         */
        setTextSize: function (View, size) {
            instance.setTextSize(View, size);
        },
        /**
         * @description  设置字体颜色
         * @param {view} View 必填,ui对象
         * @param {string} color 必填,16进制颜色
         * @return {*}    无
         */
        setTextColor: function (View, color) {
            instance.setTextColor(View, color);
        },
        /**
         * @description  字体加粗
         * @param {view} View 必填,ui对象
         * @return {*}    无
         */
        setTypeface: function (View) {
            instance.setTypeface(View);
        },
        /**
         * @description 设置字体样式
         * @param {view} View 必填,ui对象
         * @param {Object} Font 必填,字体对象
         * @return {*}    无
         */
        setFont: function (View, Font) {
            instance.setFont(View, Font);
        },
        /**
         * @description  是否设置单行输入
         * @param {view}    View 必填,ui对象
         * @param {boolean} isSingleLine 必填,是否设置单行输入
         * @return {*}    无
         */
        setSingleLine: function (View, isSingleLine) {
            instance.setSingleLine(View, isSingleLine);
        },
        /**
         * @description  设置输入最大输入行数
         * @param {view}    View 必填,ui对象
         * @param {number} lines 必填,最大输入行数
         * @return {*}    无
         */
        setMaxLines: function (View, lines) {
            instance.setMaxLines(View, lines);
        },
        /**
         * @description  设置开关 轨道(背景) 颜色
         * @param {view}    View 必填,ui对象
         * @param {string} color 必填,16进制颜色
         * @return {*}    无
         */
        setTrackTintColor: function (View, color) {
            return instance.setTrackTintList(View, color);
        },
        /**
         * @description  设置开关 滑块(按钮) 颜色
         * @param {view}    View 必填,ui对象
         * @param {string} color 必填,16进制颜色
         * @return {*}    无
         */
        setThumbColor: function (View, color) {
            return instance.setThumbTintList(View, color);
        },
        /**
         * @description  自定义绘制开关
         * @param {view}    View 必填,ui对象
         * @param {string} color 必填,16进制颜色
         * @param {number} width 选填,宽度,默认50
         * @param {number} width 选填,高度,默认50
         * @param {number} width 选填,圆角度数,默认50
         * @return {*}    无
         */
        setTrackDrawable: function (View, color, width, height, radius) {
            instance.setTrackDrawable(View, color, width, height, radius);
        },
        /**
         * @description  设置文字位置靠左
         * @param {view} View 必填,ui对象
         * @return {*}    无
         */
        setradioButtonText: function (View) {
            instance.setradioButtonText(View);
        },
        /**
         * @description  设置选中状态
         * @param {view} View 必填,ui对象
         * @param {boolean} isChecked 必填,是否选中
         * @return {*}    无
         */
        setChecked: function (View, isChecked) {
            instance.setChecked(View, isChecked);
        },
        /**
         * @description  获取选中状态
         * @param {view} View 必填,ui对象
         * @return {boolean}    已选中返回true,未选中返回false
         */
        getChecked: function (View) {
            return instance.getChecked(View);
        },
        /**
         * @description  绘制按钮自定义图标
         * @param {view} View 必填,ui对象
         * @param {view} Image 必填,必填,res目录图片名字
         * @return {*}    无
         */
        setButtonIcon: function (View, Image) {
            instance.setButtonIcon(View, Image);
        },
        /**
         * @description 设置控件的内边距
         * @param View {view} 必填,ui对象
         * @param left {number} 必填,左边距
         * @param top {number} 必填,上边距
         * @param right {number} 必填,右边距
         * @param bottom {number} 必填,下边距
         * @return {*} 无
         */
        setPadding: function (View, left, top, right, bottom) {
            instance.setPadding(View, left, top, right, bottom);
        }
    }//开关

    jcUI.prototype.Spinner = {
        /**
         * @description  获取所有Spinner控件的tag属性 (这个作用主要是用来监听事件)
         * @returns {Array} 返回数组
         */
        get_All_Tag: function () {
            return instance.get_All_Tag('Spinner');
        },
        /**
         * @description  获取所有Spinner控件对象 (这个作用主要是用来设置颜色大小等其他参数)
         * @returns {Array} 返回数组
         */
        get_All_view: function () {
            return instance.get_All_Tag('Spinner', true);
        },
        /**
         * @description  设置背景颜色或图片
         * @param {view} View 必填,ui对象
         * @param {string|Drawable|null} arg 必填,可以是以下几种类型之一：
         * - 16进制颜色;例如 "#ff0000"
         * - res目录下图片的名字;例如 "demo.png"
         * - Drawable对象;例如 jcUI.Drawable.MiaoBian("#ff00ff")
         * - null;表示取消背景
         * @param touMing {number} 可选,透明度,取值0-255,数值越大越不透明(只对图片生效)
         * @return {*}    无
         */
        setBackground: function (View, arg, touMing) {
            instance.setBackground(View, arg, touMing);
        },
        /**
         * @description  设置下拉框展开背景
         * @param {view} View 必填,ui对象
         * @param {string} arg 必填,res目录图片名字,或者16进制颜色
         * @return {*} 无
         */
        setPopupBackgroundDrawable: function (View, arg) {
            instance.setPopupBackgroundDrawable(View, arg);
        },
        /**
         * @description 设置控件的宽度和高度
         * @param {view} View ui对象
         * @param {int} width 可选,需要设置的宽度
         * @param {int} height 可选,需要设置的高度
         * @return {*} 无
         */
        setViewWidthAndHeight: function (View, width, height) {
            instance.setViewWidthAndHeight(View, width, height);
        },
        /**
         * @description 设置控件显示状态
         * @param {view} View 必填,ui对象
         * @param {int} state 必填,需要设置的显示状态;4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件;
         * @return {*} 无
         */
        setVisibility: function (View, state) {
            instance.setVisibility(View, state);
        },
        /**
         * @description 获取控件显示状态
         * @param {view} View 必填,ui对象
         * @return {int} 4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件,-1表示返回错误
         */
        getVisibility: function (View) {
            return instance.getVisibility(View);
        },
        /**
         * @description  设置对齐方式
         * @param View {view} 必填,ui对象
         * @param GravityType {number} 必填,1-9,表示对齐的方向
         */
        setGravity: function (View, GravityType) {
            instance.setGravity(View, GravityType);
        },
        /**
         * @description 设置下拉框选中编号
         * @param {view} View 必填,ui对象
         * @param {int} Index 必填,选中编号
         * @return {*} 无
         */
        setSelection: function (View, Index) {
            return instance.setSelection(View, Index);
            try {
                View.setSelection(Index);
            } catch (e) {
                loge('setSelection: ' + e);
            }

        },
        /**
         * @description 获取下拉框选中编号
         * @param {view} View 必填,ui对象
         * @return {int} 成功返回选中的编号,失败返回-1;
         */
        getSelectedItemPosition: function (View) {
            return instance.getSelectedItemPosition(View);
        },
        /**
         * @description 设置控件的内边距
         * @param View {view} 必填,ui对象
         * @param left {number} 必填,左边距
         * @param top {number} 必填,上边距
         * @param right {number} 必填,右边距
         * @param bottom {number} 必填,下边距
         * @return {*} 无
         */
        setPadding: function (View, left, top, right, bottom) {
            instance.setPadding(View, left, top, right, bottom);
        },
        /**
         * @description 动态添加下拉框控件
         * @param parentView {view} 必填,被添加的父控件
         * @param arrays {array} 必填,下拉框数据源
         * @param viewXml {string} 必填,下拉框布局文件
         * @param viewConfig {object} 可选,控件配置(tag,对齐方式,文字等)
         * @return {*} 无
         * @example
         * 用法一: 在tag标签为root的控件上动态添加Spinner.xml解析出来的Spinner控件,数据有111和222
         * jcUI.add_Spinner(ui.root,'Spinner.xml',['111', '222']);
         */
        add_Spinner: function (parentView, viewXml, arrays, viewConfig) {
            if (!parentView || !arrays || !viewXml) {
                logd('参数错误');
                return;
            }
            viewConfig = viewConfig || {
                width: '',//LinearLayout.LayoutParams.MATCH_PARENT填充满
                height: '',// LinearLayout.LayoutParams.WRAP_CONTENT自适应
                Background: '',//父控件背景颜色,可以选择颜色字符串,res目录下的照片名字,或者自定义绘制
                PopupBackground: '',//设置下拉框展开背景
                index: '',//number类型,表示添加到第几个位置
                tag: '',//父控件tag属性,用于后期获取被选中的序号
                setGravity: '', //number类型,父控件对齐方向,1-9,表示几点钟位置
                child_Background: '',//子标签背景颜色,可以选择颜色字符串,res目录下的照片名字,或者自定义绘制
                textColor: '',//string类型,设置子标签文字颜色
                textSize: '',//number类型,设置子标签文字大小
                Font: ''//jcUI.createFont('字体.ttf')返回值,设置子标签字体
            }
            try {
                let spinnerView = instance.createView('Spinner', parentView, viewConfig);
                if (spinnerView) {
                    spinnerView.setDropDownVerticalOffset(120); // 设置下拉框 垂直方向偏移 120 像素
                    spinnerView.setAdapter(instance.getSpinnerAdapter(arrays, viewXml, viewConfig));
                    if (viewConfig.PopupBackground) instance.setPopupBackgroundDrawable(spinnerView, viewConfig.PopupBackground);

                }
            } catch (e) {
                loge('add_Spinner: ' + e);
            }
        }
    }//下拉框

    jcUI.prototype.CardView = {
        /**
         * @description  获取所有CardView控件的tag属性 (这个作用主要是用来监听事件)
         * @returns {Array} 返回数组
         */
        get_All_Tag: function () {
            return instance.get_All_Tag('CardView');
        },
        /**
         * @description  获取所有CardView控件对象 (这个作用主要是用来设置颜色大小等其他参数)
         * @returns {Array} 返回数组
         */
        get_All_view: function () {
            return instance.get_All_Tag('CardView', true);
        },
        /**
         * @description  设置背景颜色或图片
         * @param {view} View 必填,ui对象
         * @param {string|Drawable|null} arg 必填,可以是以下几种类型之一：
         * - 16进制颜色;例如 "#ff0000"
         * - res目录下图片的名字;例如 "demo.png"
         * - Drawable对象;例如 jcUI.Drawable.MiaoBian("#ff00ff")
         * - null;表示取消背景
         * @param touMing {number} 可选,透明度,取值0-255,数值越大越不透明(只对图片生效)
         * @return {*}    无
         */
        setBackground: function (View, arg, touMing) {
            instance.setBackground(View, arg, touMing);
        },
        /**
         * @description 设置控件的宽度和高度
         * @param {view} View 必填,ui对象
         * @param {int} width 可选,需要设置的宽度
         * @param {int} height 可选,需要设置的高度
         * @return {*} 无
         */
        setViewWidthAndHeight: function (View, width, height) {
            instance.setViewWidthAndHeight(View, width, height);
        },
        /**
         * @description  设置控件显示状态
         * @param {view} View 必填,ui对象
         * @param {int} state 必填,需要设置的显示状态;4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件;
         * @return {*} 无
         */
        setVisibility: function (View, state) {
            instance.setVisibility(View, state);
        },
        /**
         * @description 获取控件显示状态
         * @param {view} View 必填,ui对象
         * @return {int} 4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件,-1表示返回错误
         */
        getVisibility: function (View) {
            return instance.getVisibility(View);
        },
        /**
         * @description 设置CardView圆角度数
         * @param {view} View ui对象
         * @param {int} num 需要设置的度数
         * @return {*} 无
         */
        setRadius: function (View, num) {
            instance.getVisibility(View, num);
        },
        /**
         * @description 设置CardView z轴的阴影大小
         * @param {view} View 必填,ui对象
         * @param {int} num 必填,需要设置的度数
         * @return {*} 无
         */
        setCardElevation: function (View, num) {
            instance.setCardElevation(View, num);
        },
        /**
         * @description 设置控件的内边距
         * @param View {view} 必填,ui对象
         * @param left {number} 必填,左边距
         * @param top {number} 必填,上边距
         * @param right {number} 必填,右边距
         * @param bottom {number} 必填,下边距
         * @return {*} 无
         */
        setPadding: function (View, left, top, right, bottom) {
            instance.setPadding(View, left, top, right, bottom);
        }
    }//卡片

//////////////-------------------布局类-------------------//////////////

    jcUI.prototype.LinearLayout = {
        /**
         * @description  获取所有LinearLayout控件的tag属性 (这个作用主要是用来监听事件)
         * @returns {Array} 返回数组
         */
        get_All_Tag: function () {
            return instance.get_All_Tag('LinearLayout');
        },
        /**
         * @description  获取所有LinearLayout控件对象 (这个作用主要是用来设置颜色大小等其他参数)
         * @returns {Array} 返回数组
         */
        get_All_view: function () {
            return instance.get_All_Tag('LinearLayout', true);
        },
        /**
         * @description  设置背景颜色或图片
         * @param {view} View 必填,ui对象
         * @param {string|Drawable|null} arg 必填,可以是以下几种类型之一：
         * - 16进制颜色;例如 "#ff0000"
         * - res目录下图片的名字;例如 "demo.png"
         * - Drawable对象;例如 jcUI.Drawable.MiaoBian("#ff00ff")
         * - null;表示取消背景
         * @param touMing {number} 可选,透明度,取值0-255,数值越大越不透明(只对图片生效)
         * @return {*}    无
         */
        setBackground: function (View, arg, touMing) {
            instance.setBackground(View, arg, touMing);
        },
        /**
         * @description 设置控件的宽度和高度
         * @param {view} View 必填,ui对象
         * @param {int} width 可选,需要设置的宽度
         * @param {int} height 可选,需要设置的高度
         * @return {*} 无
         */
        setViewWidthAndHeight: function (View, width, height) {
            instance.setViewWidthAndHeight(View, width, height);
        },
        /**
         * @description  设置控件显示状态
         * @param {view} View 必填,ui对象
         * @param {int} state 必填,需要设置的显示状态;4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件;
         * @return {*} 无
         */
        setVisibility: function (View, state) {
            instance.setVisibility(View, state);
        },
        /**
         * @description 获取控件显示状态
         * @param {view} View 必填,ui对象
         * @return {int} 4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件,-1表示返回错误
         */
        getVisibility: function (View) {
            return instance.getVisibility(View);
        },
        /**
         * @description 移除所有子控件
         * @param View 必填,ui对象
         * @return {*} 无
         */
        removeAllViews: function (View) {
            instance.removeAllViews(View);
        },
        /**
         * @description 设置控件的内边距
         * @param View {view} 必填,ui对象
         * @param left {number} 必填,左边距
         * @param top {number} 必填,上边距
         * @param right {number} 必填,右边距
         * @param bottom {number} 必填,下边距
         * @return {*} 无
         */
        setPadding: function (View, left, top, right, bottom) {
            instance.setPadding(View, left, top, right, bottom);
        }

    }//线性布局

    jcUI.prototype.ScrollView = {
        /**
         * @description  获取所有ScrollView控件的tag属性 (这个作用主要是用来监听事件)
         * @returns {Array} 返回数组
         */
        get_All_Tag: function () {
            return instance.get_All_Tag('ScrollView');
        },
        /**
         * @description  获取所有ScrollView控件对象 (这个作用主要是用来设置颜色大小等其他参数)
         * @returns {Array} 返回数组
         */
        get_All_view: function () {
            return instance.get_All_Tag('ScrollView', true);
        },
        /**
         * @description  设置背景颜色或图片
         * @param {view} View 必填,ui对象
         * @param {string|Drawable|null} arg 必填,可以是以下几种类型之一：
         * - 16进制颜色;例如 "#ff0000"
         * - res目录下图片的名字;例如 "demo.png"
         * - Drawable对象;例如 jcUI.Drawable.MiaoBian("#ff00ff")
         * - null;表示取消背景
         * @param touMing {number} 可选,透明度,取值0-255,数值越大越不透明(只对图片生效)
         * @return {*}    无
         */
        setBackground: function (View, arg, touMing) {
            instance.setBackground(View, arg, touMing);
        },
        /**
         * @description 设置控件的宽度和高度
         * @param {view} View 必填,ui对象
         * @param {int} width 可选,需要设置的宽度
         * @param {int} height 可选,需要设置的高度
         * @return {*} 无
         */
        setViewWidthAndHeight: function (View, width, height) {
            instance.setViewWidthAndHeight(View, width, height);
        },
        /**
         * @description  设置控件显示状态
         * @param {view} View 必填,ui对象
         * @param {int} state 必填,需要设置的显示状态;4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件;
         * @return {*} 无
         */
        setVisibility: function (View, state) {
            instance.setVisibility(View, state);
        },
        /**
         * @description 获取控件显示状态
         * @param {view} View 必填,ui对象
         * @return {int} 4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件,-1表示返回错误
         */
        getVisibility: function (View) {
            return instance.getVisibility(View);
        },
        /**
         * @description 设置控件的内边距
         * @param View {view} 必填,ui对象
         * @param left {number} 必填,左边距
         * @param top {number} 必填,上边距
         * @param right {number} 必填,右边距
         * @param bottom {number} 必填,下边距
         * @return {*} 无
         */
        setPadding: function (View, left, top, right, bottom) {
            instance.setPadding(View, left, top, right, bottom);
        }

    }//滚动框布局

    jcUI.prototype.RadioGroup = {
        /**
         * @description  获取所有RadioGroup控件的tag属性 (这个作用主要是用来监听事件)
         * @returns {Array} 返回数组
         */
        get_All_Tag: function () {
            return instance.get_All_Tag('RadioGroup');
        },
        /**
         * @description  获取所有RadioGroup控件对象 (这个作用主要是用来设置颜色大小等其他参数)
         * @returns {Array} 返回数组
         */
        get_All_view: function () {
            return instance.get_All_Tag('RadioGroup', true);
        },
        /**
         * @description  设置背景颜色或图片
         * @param {view} View 必填,ui对象
         * @param {string|Drawable|null} arg 必填,可以是以下几种类型之一：
         * - 16进制颜色;例如 "#ff0000"
         * - res目录下图片的名字;例如 "demo.png"
         * - Drawable对象;例如 jcUI.Drawable.MiaoBian("#ff00ff")
         * - null;表示取消背景
         * @param touMing {number} 可选,透明度,取值0-255,数值越大越不透明(只对图片生效)
         * @return {*}    无
         */
        setBackground: function (View, arg, touMing) {
            instance.setBackground(View, arg, touMing);
        },
        /**
         * @description 设置控件的宽度和高度
         * @param {view} View 必填,ui对象
         * @param {int} width 可选,需要设置的宽度
         * @param {int} height 可选,需要设置的高度
         * @return {*} 无
         */
        setViewWidthAndHeight: function (View, width, height) {
            instance.setViewWidthAndHeight(View, width, height);
        },
        /**
         * @description  设置控件显示状态
         * @param {view} View 必填,ui对象
         * @param {int} state 必填,需要设置的显示状态;4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件;
         * @return {*} 无
         */
        setVisibility: function (View, state) {
            instance.setVisibility(View, state);
        },
        /**
         * @description 获取控件显示状态
         * @param {view} View 必填,ui对象
         * @return {int} 4表示隐藏并占一个位置; 8表示隐藏控件不占位置; 0表示显示控件,-1表示返回错误
         */
        getVisibility: function (View) {
            return instance.getVisibility(View);
        },
        /**
         * @description 设置控件的内边距
         * @param View {view} 必填,ui对象
         * @param left {number} 必填,左边距
         * @param top {number} 必填,上边距
         * @param right {number} 必填,右边距
         * @param bottom {number} 必填,下边距
         * @return {*} 无
         */
        setPadding: function (View, left, top, right, bottom) {
            instance.setPadding(View, left, top, right, bottom);
        }
    }//单选布局类

    jcUI.prototype.Drawable = {
        /**
         * @description 绘制描边效果
         * @param {string} StrokeColor 必填,描边颜色,16进制颜色
         * @param {string} StrokePixel 可选,描边像素,默认2像素
         * @param {number} Radius 可选,圆角度数
         * @returns {GradientDrawable}
         */
        MiaoBian: function (StrokeColor, StrokePixel, Radius) {
            try {
                let color = instance.parseColor(StrokeColor);
                if (!color) {
                    return;
                }
                StrokePixel = StrokePixel || 2;
                let gradientDrawable = new GradientDrawable();//创建GradientDrawable对象
                gradientDrawable.setShape(GradientDrawable.RECTANGLE);//绘制矩形
                gradientDrawable.setStroke(StrokePixel, color);//设置描边 2是描边的像素,color是16进制颜色
                if (Radius) {
                    gradientDrawable.setCornerRadius(Radius);// 设置圆角度数
                }
                // gradientDrawable.setSize(100, 200);//设置绘制的宽度和高度
                return gradientDrawable;
            } catch (e) {
                loge('MiaoBian: ' + e);
            }
        },
        /**
         * @description 绘制渐变效果
         * @param colors {Array} 必填,16进制颜色数组
         * @param Orientation {number} 可选,渐变方向(数字组合:如28表示从2点钟方向到8点钟方向),默认从上到下
         * @param Radius {number} 可选,设置圆角度数
         * @returns {GradientDrawable} GradientDrawable对象
         */
        JianBian: function (colors, Orientation, Radius) {
            try {
                if (!Array.isArray(colors)) {
                    logw('参数类型错误,需要数组');
                    return;
                }
                let colorArray = [];
                for (let i = 0; i < colors.length; i++) {
                    let color = instance.parseColor(colors[i]);
                    if (!color) {
                        return;
                    }
                    colorArray.push(color);
                }
                let gradientDrawable = new GradientDrawable();//创建GradientDrawable对象
                // GradientDrawable.RECTANGLE 绘制矩形  GradientDrawable.OVAL 绘制椭圆形
                // GradientDrawable.LINE 绘制一条线  GradientDrawable.RING 绘制环形
                gradientDrawable.setShape(GradientDrawable.RECTANGLE);//绘制矩形
                // GradientDrawable.LINEAR_GRADIENT 线性渐变
                //颜色沿着一条直线平滑过渡。
                // 渐变可以是从左到右、从上到下或任意方向。
                // 适用于需要均匀、直线过渡的设计。

                // GradientDrawable.RADIAL_GRADIENT 径向渐变
                // 颜色从一个中心点向外辐射，形成同心圆状的过渡效果。
                // 中心通常是最亮或最深的颜色，向外逐渐变淡或改变。
                // 常用于创造深度或突出某个中心元素。

                // GradientDrawable.SWEEP_GRADIENT 扫描渐变
                // 颜色在一个区域内以波浪或条纹的方式变化，通常是水平或垂直的条纹。
                // 每个条纹的颜色可以不同，形成一种独特的视觉效果。
                // 适用于创建动态感或视觉节奏。
                gradientDrawable.setGradientType(GradientDrawable.LINEAR_GRADIENT);//设置渐变类型
                switch (Orientation) {
                    case 28:
                        Orientation = GradientDrawable.Orientation.TOP_BOTTOM;//从上到下
                        break;
                    case 82:
                        Orientation = GradientDrawable.Orientation.BOTTOM_TOP;//从下到上
                        break;
                    case 46:
                        Orientation = GradientDrawable.Orientation.LEFT_RIGHT;//从左到右
                        break;
                    case 64:
                        Orientation = GradientDrawable.Orientation.RIGHT_LEFT;//从右到左
                        break;
                    case 19:
                        Orientation = GradientDrawable.Orientation.TL_BR;//从左上到右下
                        break;
                    case 91:
                        Orientation = GradientDrawable.Orientation.BR_TL;//从右下到左上
                        break;
                    case 73:
                        Orientation = GradientDrawable.Orientation.BL_TR;//从左下到右上
                        break;
                    case 37:
                        Orientation = GradientDrawable.Orientation.TR_BL;//从右上到左下
                        break;
                    default:
                        Orientation = GradientDrawable.Orientation.TOP_BOTTOM;//默认从上到下
                }
                gradientDrawable.setOrientation(Orientation);//设置渐变方向
                gradientDrawable.setColors(colorArray);//设置渐变颜色
                // gradientDrawable.setGradientRadius(480);//渐变的半径值
                if (Radius) {
                    gradientDrawable.setCornerRadius(Radius);//设置圆角度数
                }
                // gradientDrawable.setSize(100, 500);//设置宽高
                gradientDrawable.setAlpha(60)//   设置透明度，取值范围为 0（完全透明）到 255（完全不透明）。
                return gradientDrawable;
            } catch (e) {
                loge('JianBian: ' + e);
            }
        }
    }
//////////////-------------------内部处理函数-------------------//////////////

//          公共属性
    jcUI.prototype.setBackground = function (View, arg, touMing) {
        try {
            if (typeof arg === 'string') {
                if (arg.includes('.')) {
                    let img = ui.resResAsDrawable(arg);
                    if (img) {
                        if (touMing) {
                            img.setAlpha(touMing);
                        }
                        View.setBackground(img);
                    } else {
                        logw('找不到图片: ' + arg);
                    }
                } else {
                    let Color = this.parseColor(arg);
                    if (Color) {
                        View.setBackgroundColor(Color);
                    }
                }
            } else if (arg instanceof android.graphics.drawable.GradientDrawable || arg instanceof android.graphics.drawable.BitmapDrawable) {
                if (touMing) {
                    arg.setAlpha(touMing);
                }
                View.setBackground(arg);
            } else if (arg === null) {
                View.setBackground(null);
            } else {
                logw('参数错误: ' + arg);
            }
        } catch (e) {
            loge('setBackground: ' + e);
        }
    }//设置背景 颜色/图片
    jcUI.prototype.setViewWidthAndHeight = function (View, width, height) {
        try {
            if (width) {
                View.getLayoutParams().width = width;//单位像素，设置宽度为80像素
            }
            if (height) {
                View.getLayoutParams().height = height;//单位像素，设置高度为100像素
            }
        } catch (e) {
            loge('setViewWidthAndHeight: ' + e);
        }
    }//设置控件的宽度和高度
    jcUI.prototype.setVisibility = function (View, state) {
        // 4 隐藏并占一个位置   8 隐藏控件不占位置   0 显示控件
        try {
            if (state === 8) {
                state = View.GONE;// 隐藏控件不占位置
            } else if (state === 0) {
                state = View.VISIBLE; //显示控件
            } else if (state === 4) {
                state = View.INVISIBLE;// 隐藏控件占一个位置
            } else {
                logw('state 参数错误');
                return;
            }
            View.setVisibility(state);
        } catch (e) {
            loge('setVisibility: ' + e);
        }
    }//设置控件显示状态
    jcUI.prototype.getVisibility = function (View) {
        try {
            return View.getVisibility();
            // 4 隐藏并占一个位置
            // 8 隐藏控件不占位置
            // 0 显示控件
        } catch (e) {
            loge('getVisibility: ' + e);
        }
        return -1;
    }//获取控件显示状态
    /**
     * @description 获取控件的宽度和高度
     * @param view {view} 必填,ui对象
     * @returns {{width: *, height: *}|null} 成功返回对象,失败返回null
     */
    jcUI.prototype.getViewWidthAndHeight = function (view) {
        try {
            let intw = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED);
            let inth = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED);
            view.measure(intw, inth);
            let intwidth = view.getMeasuredWidth();// 测量宽度
            let intheight = view.getMeasuredHeight();//测量高度
            return {
                width: intwidth,
                height: intheight
            }
        } catch (e) {
            loge('getViewWidthAndHeight: ' + e);
        }
        return null;
    }
    /**
     * @description  设置对齐方式
     * @param View {view} 必填,ui对象
     * @param GravityType {number} 必填,1-9,表示对齐的方向
     */
    jcUI.prototype.setGravity = function (View, GravityType) {
        try {
            switch (GravityType) {
                case 1:
                    View.setGravity(Gravity.LEFT | Gravity.TOP);//1点钟方向
                    break;
                case 2:
                    View.setGravity(Gravity.CENTER_HORIZONTAL)//2点钟方向
                    break;
                case 3:
                    View.setGravity(Gravity.RIGHT | Gravity.TOP);//3点钟方向
                    break;
                case 4:
                    View.setGravity(Gravity.CENTER_VERTICAL);//4点钟方向
                    break;
                case 5:
                    View.setGravity(Gravity.CENTER);//5点钟方向
                    break;
                case 6:
                    View.setGravity(Gravity.CENTER_VERTICAL | Gravity.RIGHT);//6点钟方向
                    break;
                case 7:
                    View.setGravity(Gravity.LEFT | Gravity.BOTTOM);//7点钟方向
                    break;
                case 8:
                    View.setGravity(Gravity.CENTER_HORIZONTAL | Gravity.BOTTOM);//8点钟方向
                    break;
                case 9:
                    View.setGravity(Gravity.BOTTOM | Gravity.RIGHT);//9点钟方向
                    break;
                default:
                    logw('参数错误,当前传入参数: ' + GravityType + ' 参数类型: ' + typeof (GravityType));
            }
        } catch (e) {
            loge('setGravity: ' + e);
        }
    }//设置对齐方式
    jcUI.prototype.createView = function (viewType, parentView, viewConfig) {
        let view = null;
        try {
            switch (viewType) {
                case "LinearLayout":
                    view = new LinearLayout(context);//线性布局
                    break;
                case "ScrollView":
                    view = new ScrollView(context);//滚动布局
                    break;
                case "RadioGroup":
                    view = new RadioGroup(context);//单选布局
                    break;
                case "FrameLayout":
                    view = new FrameLayout(context);//帧布局
                    break;
                case "HorizontalScrollView":
                    view = new HorizontalScrollView(context);//横向滚动布局
                    break;
                case "CardView":
                    view = new CardView(context);//卡片布局
                    break;
                case  "View":
                    view = new View(context);
                    break;
                case  "TextView":
                    view = new TextView(context);
                    break;
                case  "EditText":
                    view = new EditText(context);
                    break;
                case "Button":
                    view = new Button(context);
                    break;
                case  "CheckBox":
                    view = new CheckBox(context);
                    break;
                case  "RadioButton":
                    view = new RadioButton(context);
                    break;
                case  "Switch":
                    view = new Switch(context);
                    break;
                case  "ImageView":
                    view = new ImageView(context);
                    break;
                case "Spinner":
                    view = new Spinner(context);
                    break;
                default:
                    logw('参数错误,当前传入参数: ' + viewType);
                    return null;
            }
            viewConfig.width = viewConfig.width || LinearLayout.LayoutParams.WRAP_CONTENT;
            viewConfig.height = viewConfig.height || LinearLayout.LayoutParams.WRAP_CONTENT;
            view.setLayoutParams(new LinearLayout.LayoutParams(viewConfig.width, viewConfig.height)); //宽高
            if (viewConfig.Background) instance.setBackground(view, viewConfig.Background); //背景
            if (viewConfig.setGravity) instance.setGravity(view, viewConfig.setGravity); //对齐方式
            if (viewConfig.tag) view.setTag(viewConfig.tag);//设置tag属性
            typeof viewConfig.index === 'number' ? parentView.addView(view, viewConfig.index) : parentView.addView(view);// 将控件添加到父控件里的第几个位置
        } catch (e) {
            loge('creadView: ' + e);
        }
        return view;
    }//创建控件对象
    jcUI.prototype.setPadding = function (View, left, top, right, bottom) {
        try {
            View.setPadding(this.dpToPx(left), this.dpToPx(top), this.dpToPx(right), this.dpToPx(bottom));
        } catch (e) {
            loge('setPadding: ' + e);
        }
    }
    jcUI.prototype.dpToPx = function (dp) {
        try {
            const scale = context.getResources().getDisplayMetrics().density;
            return dp * scale + 0.5;
        } catch (e) {
            loge('dpToPx: ' + e);
        }
    }
    jcUI.prototype.getRandColor = function () {
        return '#' + (java.util.UUID.randomUUID() + "").replace(/-/g, '').substring(0, 6);
    }//获取随机颜色
    jcUI.prototype.parseColor = function (color) {
        try {
            return Color.parseColor(color);
        } catch (e) {
            logw('颜色参数错误,当前传入: ' + color);
        }
        return false;
    }//解析颜色
//  其他
    /**
     * @description 如果noTag属性为true,不能转json,因为view的值是UI对象会崩溃
     */
    jcUI.prototype.get_All_Tag = function (ViewType, noTag) {
        let ViewArray = [];
        try {
            let allView = ui.getRootView();
            if (allView) {
                for (let i = 0; i < allView.length; i++) {
                    this.get_View(allView[i], ViewType, ViewArray, noTag);
                }
            }
        } catch (e) {
            loge('get_All_View: ' + e);
        }
        return ViewArray;
    }//获取ui控件的tag属性(目前支持 Switch|Spinner|CheckBox|RadioButton|Button|TextView|EditText|LinearLayout|ScrollView|RadioGroup|CardView)
    jcUI.prototype.get_View = function (root, ViewType, arr, noTag) {
        try {
            let viewType = this.get_ViewType(root);
            // logd(viewType);
            if (ViewType) {
                if (viewType === ViewType) {
                    if (noTag) {
                        arr.push(root);
                    } else {
                        let tag = root.getTag() + '';
                        if (tag !== 'null') {
                            arr.push(tag);
                        }
                    }
                }
            } else {
                if (noTag) {
                    logd(root);
                    arr.push({
                        type: viewType,
                        view: root,
                    });
                } else {
                    let tag = root.getTag() + '';
                    if (tag !== 'null') {
                        arr.push({
                            type: viewType,
                            tag: tag,
                        });
                    }
                }
            }
            if (root instanceof android.view.ViewGroup && viewType !== 'Spinner') {
                let viewGroup = android.view.ViewGroup(root);
                for (let i = 0; i < viewGroup.getChildCount(); i++) {
                    let childView = viewGroup.getChildAt(i);
                    this.get_View(childView, ViewType, arr, noTag);
                }
            }
        } catch (e) {
            loge('get_All_View: ' + e);
        }
    }//递归遍历ui对象
    jcUI.prototype.get_ViewType = function (View, isPkg) {
        try {
            //前面是带包名的,后面不带
            return isPkg ? View.getClass().getName() + '' : View.getClass().getSimpleName() + '';
        } catch (e) {
            loge('get_ViewType: ' + e);
        }
        return '';
    }//获取ui对象的类型
    jcUI.prototype.getDrawable = function (obj) {
        try {
            let gradientDrawable = new GradientDrawable();//创建GradientDrawable对象
            /*
                绘制形状
                GradientDrawable.RECTANGLE 矩形
                GradientDrawable.OVAL 椭圆
                GradientDrawable.LINE 线条
                GradientDrawable.RING 环形
             */
            gradientDrawable.setShape(GradientDrawable.RECTANGLE);
            gradientDrawable.setStroke(2, this.parseColor('#ee00aa'));//设置描边 2是描边的像素,color是16进制颜色
            gradientDrawable.setCornerRadius(10);// 设置圆角度数,10是度数
            gradientDrawable.setColor(this.parseColor('#ee00aa'));// 背景填充色,这个和底下的setColor二选一

            let colorArray = [];
            let colors = [];
            for (let i = 0; i < colorArray.length; i++) {
                colors.push(this.parseColor(colorArray[i]));
            }//     添加颜色组,用于设置渐变的
            gradientDrawable.setColors(colors);// 填充色组
            /*
                              渐变类型
                              GradientDrawable.LINEAR_GRADIENT 线性渐变
                              GradientDrawable.RADIAL_GRADIENT 径向渐变
                              GradientDrawable.SWEEP_GRADIENT 扫描渐变
                        */
            gradientDrawable.setGradientType(obj.GradientType);
            gradientDrawable.setOrientation(GradientDrawable.Orientation.TL_BR);//   渐变方向
            gradientDrawable.setAlpha(255)//   设置透明度，取值范围为 0（完全透明）到 255（完全不透明）。
            gradientDrawable.setSize(50, 60);//设置绘制的宽度和高度

            return gradientDrawable;
        } catch (e) {
            loge('getDrawable: ' + e);
        }

    }// 重绘背景
    //带text属性的方法
    jcUI.prototype.getText = function (View) {
        try {
            return View.getText() + '';
        } catch (e) {
            loge('getText: ' + e);
        }
        return '';
    }//获取ui对象的text
    jcUI.prototype.setText = function (View, text) {
        try {
            if (typeof text !== 'string') {
                logw('传参类型不对');
                return;
            }
            View.setText(text);
        } catch (e) {
            loge('setText: ' + e);
        }
    }//设置ui对象的text
    jcUI.prototype.setTextSize = function (View, size) {
        try {
            return View.setTextSize(size);
        } catch (e) {
            loge('setTextSize: ' + e);
        }
    }//设置字体大小
    jcUI.prototype.setTextColor = function (View, color) {
        try {
            let Color = this.parseColor(color);
            if (Color) {
                View.setTextColor(Color);
            }
        } catch (e) {
            loge('setTextColor: ' + e);
        }
    }//设置字体颜色
    jcUI.prototype.setTypeface = function (View) {

        // 字体 类型
        // Typeface.DEFAULT    常规字体类型
        // Typeface.DEFAULT_BOLD   黑体字体类型
        // Typeface.MONOSPACE  等宽字体类型
        // Typeface.SANS_SERIF sans serif字体类型
        // Typeface.SERIF serif字体类型
        //  字体类型+样式
        // setTypeface(Typeface.DEFAULT, Typeface.BOLD);   常规字体类型--粗体
        // Typeface.DEFAULT_BOLD, Typeface.BOLD_ITALIC 黑体字体类型--粗斜体
        // Typeface.MONOSPACE, Typeface.ITALIC 等宽字体类型--斜体
        // Typeface.SANS_SERIF, Typeface.NORMAL    sans serif字体类型--常规
        try {
            View.setTypeface(Typeface.defaultFromStyle(Typeface.BOLD));//加粗
        } catch (e) {
            loge('setTypeface: ' + e);
        }
    }//设置字体样式
    jcUI.prototype.createFont = function (faceName) {
        let Font = null;
        try {
            let facePath = '/sdcard/' + faceName;
            if (!file.exists(facePath)) {
                saveResToFile(faceName, facePath);
                Font = this.createFont(faceName, facePath);
            } else {
                Font = Typeface.createFromFile(facePath);
            }
        } catch (e) {
            loge('createFont: ' + e);
        }
        return Font;
    }//加载指定字体
    jcUI.prototype.setFont = function (View, Font) {
        try {
            if (Font) {
                View.setTypeface(Font);// 带文字的组件均可设置字体
            } else {
                logw('请先调用 createFont 函数创建字体');
            }
        } catch (e) {
            loge('setFont: ' + e);
        }
    }//设置字体样式
    jcUI.prototype.setSingleLine = function (View, isSingleLine) {
        try {
            View.setSingleLine(isSingleLine);
        } catch (e) {
            loge('setSingleLine: ' + e);
        }
    }//是否设置单行输入
    jcUI.prototype.setMaxLines = function (View, lines) {
        try {
            View.setMaxLines(lines);
        } catch (e) {
            loge('setMaxLines: ' + e);
        }
    }//设置输入最大行数
    jcUI.prototype.setTextIsSelectable = function (View) {
        View.setTextIsSelectable(true);
    }//设置可以长按复制粘贴
//    编辑框
    jcUI.prototype.setHint = function (View, text) {
        try {
            View.setHint(text);
        } catch (e) {
            loge('setHint: ' + e);
        }

    }//设置输入框提示
    jcUI.prototype.setHintTextColor = function (View, color) {
        try {
            let Color = this.parseColor(color);
            if (Color) {
                View.setHintTextColor(Color);
            }

        } catch (e) {
            loge('setHintTextColor: ' + e);
        }

    }//设置编辑框提示文字颜色
    jcUI.prototype.setBackgroundTintList = function (View, normal, focused) {
        try {
            let img1 = this.parseColor(normal);
            if (!img1) {
                return;
            }
            let img2 = this.parseColor(focused);
            if (!img2) {
                return;
            }
            let colors = [img2, img1];
            let states = new Array();
            states[0] = [android.R.attr.state_focused];
            states[1] = [android.R.attr.state_enabled];
            let colorOBJ = new ColorStateList(states, colors);
            View.setBackgroundTintList(colorOBJ);
        } catch (e) {
            loge('setBackgroundTintList: ' + e);
        }
    }//设置编辑框下划线颜色


//单选框/多选框
    jcUI.prototype.setButtonTintList = function (View, color) {
        //  对Switch开关无效
        try {
            let Color = this.parseColor(color);
            if (Color) {
                View.setButtonTintList(ColorStateList.valueOf(Color));
            }

        } catch (e) {
            loge('setButtonTintList: ' + e);
        }
    }//设置单选/多选框图标颜色
    jcUI.prototype.setradioButtonText = function (View) {
        try {
            View.setLayoutDirection(1);// 1为靠右 0 为靠左
            View.setTextDirection(0);
        } catch (e) {
            loge('setButtonTintList: ' + e);
        }
    }//设置单选框/多选框/开关 文字位置靠左
    jcUI.prototype.setChecked = function (View, isChecked) {
        try {
            View.setChecked(isChecked);
        } catch (e) {
            loge('setChecked: ' + e);
        }
    }//设置 开关 单选 复选 开关 的选中状态
    jcUI.prototype.getChecked = function (View) {
        try {
            return View.isChecked();
        } catch (e) {
            loge('getChecked: ' + e);
        }
        return false;
    }//获取 单选 复选 开关 的选中状态
    jcUI.prototype.setButtonIcon = function (View, Image) {
        try {
            let background = ui.resResAsDrawable(Image);
            if (!background) {
                logw('找不到图片: ' + Image);
                return;
            }
            View.setButtonDrawable(background);
        } catch (e) {
            loge('setButtonIcon: ' + e);
        }
    }//绘制单选框/多选框 图标,替换掉官方的

    // 开关
    jcUI.prototype.setThumbTintList = function (View, color) {
        try {
            let Color = this.parseColor(color);
            if (Color) {
                View.setThumbTintList(ColorStateList.valueOf(Color));
            }

        } catch (e) {
            loge('setThumbTintList: ' + e);
        }
    }//设置Switch滑块(按钮)颜色
    jcUI.prototype.setTrackTintList = function (View, color) {
        try {
            let Color = this.parseColor(color);
            if (Color) {
                View.setTrackTintList(ColorStateList.valueOf(Color));
            }

        } catch (e) {
            loge('setTrackTintList: ' + e);
        }
    }//设置Switch轨道(背景)颜色
    jcUI.prototype.setThumbDrawable = function (View, color, width, height) {
        try {
            let Color = this.parseColor(color);
            if (!Color) {
                return;
            }
            width = width || 50;
            height = height || 50;
            let gradientDrawable = new GradientDrawable();
            gradientDrawable.setShape(GradientDrawable.OVAL);//绘制椭圆形
            gradientDrawable.setColor(Color);//绘制的颜色
            gradientDrawable.setSize(width, height);//绘制的宽度和高度
            View.setThumbDrawable(gradientDrawable);
        } catch (e) {
            loge('setThumbDrawable: ' + e);
        }
    }//自定义绘制  Switch 按钮
    jcUI.prototype.setTrackDrawable = function (View, color, width, height, radius) {
        try {
            let Color = this.parseColor(color);
            if (!Color) return;
            width = width || 50;
            height = height || 50;
            radius = radius || 50;
            let gradientDrawable = new GradientDrawable();
            gradientDrawable.setShape(GradientDrawable.RECTANGLE);//绘制矩形
            gradientDrawable.setColor(Color);//绘制的颜色
            gradientDrawable.setCornerRadius(radius);// 圆角度数
            gradientDrawable.setSize(width, height);//绘制的宽度和高度
            View.setTrackDrawable(gradientDrawable);
        } catch (e) {
            loge('setTrackDrawable: ' + e);
        }
    }//自定义绘制  Switch 背景

//下拉框
    jcUI.prototype.setSelection = function (View, Index) {
        try {
            View.setSelection(Index);
        } catch (e) {
            loge('setSelection: ' + e);
        }

    }//设置下拉框选中编号
    jcUI.prototype.getSelectedItemPosition = function (View) {
        try {
            return View.getSelectedItemPosition()
        } catch (e) {
            loge('getSelectedItemPosition: ' + e);
        }
        return -1;
    }//获取下拉框选中编号
    jcUI.prototype.setPopupBackgroundDrawable = function (View, arg) {
        try {
            if (arg.includes('.')) {
                let img = ui.resResAsDrawable(arg);
                if (!img) {
                    logw('找不到res目录的' + arg + ' 图片');
                    return;
                }
                View.setPopupBackgroundDrawable(img);
            } else {
                let Color = this.parseColor(arg);
                if (Color) {
                    View.setPopupBackgroundDrawable(new ColorDrawable(Color));
                }

            }
        } catch (e) {
            loge('setPopupBackgroundDrawable: ' + e);
        }
    }//设置下拉框展开时候的背景

// CardView 卡片
    jcUI.prototype.setRadius = function (View, num) {
        try {
            let radius = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, num, context.getResources().getDisplayMetrics());
            View.setRadius(radius);
        } catch (e) {
            loge('setRadius: ' + e);
        }
    }//设置CardView圆角度数
    jcUI.prototype.setCardElevation = function (View, num) {
        try {
            let elevation = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, num, context.getResources().getDisplayMetrics());
            View.setCardElevation(elevation);
        } catch (e) {
            loge('setCardElevation: ' + e);
        }
    }//设置CardView z轴的阴影大小
//         其他


    // LinearLayout ScrollView RadioGroup 这种带子控件的布局
    jcUI.prototype.removeAllViews = function (View) {
        try {
            View.removeAllViews();
        } catch (e) {
            loge('removeAllViews: ' + e);
        }
    }

    //内部处理函数
    jcUI.prototype.getSpinnerAdapter = function (dataList, SpinnerXml, viewConfig) {
        try {
            let adapter = JavaAdapter(android.widget.SpinnerAdapter, {
                getCount: function () {
                    return dataList.length;
                },
                getItem: function (position) {
                    return [dataList[position]];
                },
                getItemId: function (position) {
                    return position;
                },
                getViewTypeCount: function () {
                    return 1;
                },
                getItemViewType: function (pos) {
                    return 0;
                },
                getDropDownView: function (position, convertView, parent) {
                    // 这个方法是设置用户点击 Spinner 展开下拉列表后看到的视图
                    convertView = convertView ? convertView : ui.parseView(SpinnerXml);
                    let item = dataList[position];
                    let tv = convertView.findViewWithTag("tv");// 获取自定义布局中tag对应的view对象
                    if (tv) {
                        if (viewConfig.child_Background) instance.setBackground(tv, viewConfig.child_Background);
                        if (viewConfig.textColor) instance.setTextColor(tv, viewConfig.textColor);
                        if (viewConfig.textSize) instance.setTextSize(tv, viewConfig.textSize);
                        if (viewConfig.Font) instance.setFont(tv, viewConfig.Font);
                        tv.setText(item);
                    } else {
                        logw('找不到 Spinner子控件');
                    }
                    return convertView;
                },
                getView: function (position, convertView, parent) {
                    //这个方法是显示默认选中项的,是用户在未点击 Spinner 展开下拉列表时看到的内容
                    convertView = convertView ? convertView : ui.parseView(SpinnerXml);
                    let item = dataList[position]; // 获取数据源一
                    let tv = convertView.findViewWithTag("tv");// 获取自定义布局中tag对应的view对象
                    if (tv) {
                        if (viewConfig.child_Background) instance.setBackground(tv, viewConfig.child_Background);
                        if (viewConfig.textColor) instance.setTextColor(tv, viewConfig.textColor);
                        if (viewConfig.textSize) instance.setTextSize(tv, viewConfig.textSize);
                        if (viewConfig.Font) instance.setFont(tv, viewConfig.Font);
                        tv.setText(item);
                    } else {
                        logw('找不到 Spinner子控件');
                    }
                    return convertView;
                }
            });
            return adapter;
        } catch (e) {
            loge('getSpinnerAdapter: ' + e);
        }
    }   //处理下拉框控件

    return instance;
}();







