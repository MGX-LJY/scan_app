// let font = jcUI.createFont('字体.ttf');

function main() {
    // ui.getContext().deleteFile("com.gibb.easyclick.uiconfig.json");
    // ui.removeAllUIConfig()
    if (!hasFloatViewPermission()) {
        ui.requestFloatViewPermissionAsync(10000, function (r) {
            if (!r) {
                toast("请到应用打开悬浮窗权限");
            }
        });
    }
    ui.layout("设置页面", "uiDemo.xml");
    ui.layout("使用说明", "shiYongShuoMing.xml");

    // ProgressCustialog()
    let version = JSON.parse(readIECFileAsString('update.json')).version;
    ui.version.setText('版本号: ' + version);
    ui.resetUIVar();
    initView();
    jcUI.TextView.setText(ui.deviceId, device.getAndroidId());
    jcUI.TextView.setCopy(ui.deviceId, true);
    ui.caozuo.setText(
        '如非必要,请不要更新被操作的APP!!!\n\n如非必要,请不要更新被操作的APP!!!\n\n如非必要,请不要更新被操作的APP!!!\n\n' +
        '更新后有可能APP节点信息有变化导致脚本不识别\n\n' +
        '一、 授权脚本在应用上层显示的权限\n\n' +
        '二、 开启控制开关,此时手机上会多出来一个小图标\n\n' +
        '三、 点击小图标,从上往下依次有5个选项,功能分别是\n' +
        ' 1.启动/停止脚本\n 2.开启/关闭日志窗口\n 3.回到脚本设置页面\n 4.显示/隐藏控制开关\n 5.关闭脚本\n\n' +
        '四、 在微信页面，启动脚本(如果没有授权无障碍,会跳转授权,手动授权一下就行)')

}

function initView() {
    let isRandColor = false;
    let colorConfig;
    if (isRandColor) {
        colorConfig = {
            TextColor: jcUI.getRandColor(),
            SwitchColor: jcUI.getRandColor(),
            RadioButtonColor: jcUI.getRandColor(),
            CheckBoxColor: jcUI.getRandColor(),
            ButtonColor: jcUI.getRandColor(),
            SpinnerColor: jcUI.getRandColor(),
            EditTextColor: jcUI.getRandColor(),
        }
    } else {
        colorConfig = {
            TextColor: '#3D9EFF',
            SwitchColor: '#FF9124',
            RadioButtonColor: '#4D9900',
            CheckBoxColor: '#FF3D9E',
            ButtonColor: '#000000',
            SpinnerColor: '#82ae46',
            EditTextColor: '#FF3D3D',
        }
    }
    jcUI.EC.hideSideView();//隐藏左上角的设置
    jcUI.EC.hideStarButton();//隐藏开始按钮
    jcUI.EC.setBackground('bj4.png');//设置全局背景图
    // jcUI.EC.setStatusBarColor('#000000');//设置顶部状态栏颜色

    // let viewArr = jcUI.View.get_All_view();
    // if (viewArr.length > 0) {
    //     for (let i = 0; i < viewArr.length; i++) {
    //         jcUI.View.setBackground(viewArr[i], jcUI.Drawable.MiaoBian('#ff0000'))
    //     }
    // }

    let textViewArr = jcUI.TextView.get_All_view();
    for (let i = 0; i < textViewArr.length; i++) {
        jcUI.TextView.setTextColor(textViewArr[i], colorConfig.TextColor);//设置字体颜色
        // jcUI.TextView.setTextSize(textViewArr[i], 15);//设置字体大小
        // jcUI.TextView.setTypeface(textViewArr[i]);//设置字体加粗
        // jcUI.TextView.setTextIsSelectable(textViewArr[i]);//设置选中文本可复制
        // jcUI.TextView.setFont(textViewArr[i], font);//设置自定义字体样式
        // jcUI.TextView.setGravity(textViewArr[i], 5);//设置对齐方式
        // jcUI.TextView.setBackground(textViewArr[i], '#ff0000', 50)
        // Listen_Click(textViewArr[i]);//监听点击事件
    }

    let switchArr = jcUI.Switch.get_All_view();
    for (let i = 0; i < switchArr.length; i++) {
        // jcUI.Switch.setFont(switchArr[i], font);//设置自定义字体样式
        // jcUI.Switch.setTextSize(switchArr[i], 12);//设置字体大小
        // jcUI.Switch.setTypeface(switchArr[i]);//设置字体加粗
        jcUI.Switch.setTextColor(switchArr[i], colorConfig.SwitchColor);//设置字体颜色
        // jcUI.Switch.setTrackDrawable(switchArr[i], colorConfig.SwitchColor, 500, 50);
        // jcUI.Switch.setBackground(switchArr[i], '#ff0000', 20);//设置背景颜色
        // jcUI.Switch.setradioButtonText(switchArr[i]);//设置按钮靠左
        // jcUI.Switch.setChecked(switchArr[i], false);//设置默认不选中
        // jcUI.Switch.setTrackTintColor(switchArr[i], colorConfig.SwitchColor);//设置轨道颜色
        // jcUI.Switch.setThumbColor(switchArr[i], colorConfig.SwitchColor);//设置按钮颜色
        // jcUI.Switch.setButtonIcon(switchArr[i], 'icon.png');//设置按钮颜色
        Listen_Change(switchArr[i]);//监听事件
    }

    let RadioButtonArr = jcUI.RadioButton.get_All_view();
    for (let i = 0; i < RadioButtonArr.length; i++) {
        jcUI.RadioButton.setButtonTintList(RadioButtonArr[i], colorConfig.RadioButtonColor);//设置按钮背景颜色
        jcUI.RadioButton.setTextColor(RadioButtonArr[i], colorConfig.RadioButtonColor);//设置文字颜色
        // jcUI.RadioButton.setTextSize(RadioButtonArr[i], 12);//设置字体大小
        // jcUI.RadioButton.setTypeface(RadioButtonArr[i]);//设置字体加粗
        // jcUI.RadioButton.setFont(RadioButtonArr[i], font);//设置自定义字体样式
        Listen_Change(RadioButtonArr[i]);//监听
    }

    let checkBoxArr = jcUI.CheckBox.get_All_view();
    for (let i = 0; i < checkBoxArr.length; i++) {
        jcUI.CheckBox.setTextColor(checkBoxArr[i], colorConfig.CheckBoxColor);//设置文字颜色
        jcUI.CheckBox.setButtonTintList(checkBoxArr[i], colorConfig.CheckBoxColor);//设置按钮背景颜色
        // jcUI.CheckBox.setTextSize(checkBoxArr[i], 12);//设置字体大小
        // jcUI.CheckBox.setTypeface(checkBoxArr[i]);//设置字体加粗
        // jcUI.CheckBox.setFont(checkBoxArr[i], font);//设置自定义字体样式
        Listen_Change(checkBoxArr[i]);//监听
    }

    let ButtonArr = jcUI.Button.get_All_view();
    for (let i = 0; i < ButtonArr.length; i++) {
        // jcUI.Button.setBackground(ButtonArr[i], colorConfig.ButtonColor);
        jcUI.CheckBox.setTextColor(ButtonArr[i], colorConfig.ButtonColor);//设置文字颜色
        // jcUI.CheckBox.setTextSize(ButtonArr[i], 12);//设置字体大小
        // jcUI.CheckBox.setTypeface(ButtonArr[i]);//设置字体加粗
        // jcUI.CheckBox.setFont(ButtonArr[i], font);//设置自定义字体样式
        Listen_Click(ButtonArr[i]);//监听
    }

    let SpinnerArr = jcUI.Spinner.get_All_view();
    for (let i = 0; i < SpinnerArr.length; i++) {
        // jcUI.Spinner.setPopupBackgroundDrawable(SpinnerArr[i], '#70ffffff');//设置展开时候背景颜色
        // jcUI.Spinner.setBackground(SpinnerArr[i], colorConfig.SpinnerColor);//设置背景颜色
        Listen_spinner(SpinnerArr[i]);
    }

    let EditTextArr = jcUI.EditText.get_All_view();
    for (let i = 0; i < EditTextArr.length; i++) {
        // Listen_Click(EditTextArr[i]);//监听
        // jcUI.EditText.setBackground(EditTextArr[i], colorConfig.EditTextColor);//设置背景颜色
        // jcUI.EditText.setBackground(EditTextArr[i], jcUI.Drawable.MiaoBian('#ff0000'));//设置背景颜色
        // jcUI.EditText.setTypeface(EditTextArr[i]);//设置字体加粗
        // jcUI.EditText.setTextSize(EditTextArr[i], 12);//设置字体大小
        // EditTextArr[i].setTextCursorDrawable(null);
        jcUI.EditText.setTextColor(EditTextArr[i], colorConfig.EditTextColor);//设置字体颜色
        // jcUI.EditText.setHintTextColor(EditTextArr[i], '#758a99');//设置提示文字颜色
        // jcUI.EditText.setBackgroundTintList(EditTextArr[i], '#0c8918', '#ed5736');//设置下划线颜色
        // jcUI.EditText.setFont(EditTextArr[i], font);//设置自定义字体样式
        jcUI.EditText.setSingleLine(EditTextArr[i], true);//设置单行输入
        jcUI.EditText.setGravity(EditTextArr[i], 4);//设置对齐方式
    }


}

function Listen_Change(Switch) {
    ui.setEvent(Switch, "checkedChange", function (view, isChecked) {
        let tag = Switch.getTag() + ""
        // let text = Switch.getText() + ""//也可以通过控件的text来判断
        logd('当前被选中的控件tag:' + tag + '  参数值: ' + isChecked);
        switch (tag) {
            case 'logFW':
                if (isChecked) {
                    let m = {
                        "x": 100,
                        "y": 200,
                        "w": 600,
                        "h": 600,
                        "gravity": "center",
                        "textSize": 12,
                        // "backgroundColor": "#50000000",
                        // backgroundAlpha: 50,
                        // backgroundImg: '',
                        "title": "日志窗口",
                        "showTitle": true,
                        showCloseBtn: true
                    }
                    showLogWindow();
                    // setLogViewSizeEx(m);//这个是设置整个日志窗口的
                    // sleep(50);
                    // setLogViewSizeEx(m); //这个是设置窗口内部文字的,这里的m和日志窗口的m不是一回事
                    // setFixedViewText("TEST\n都是对的")   ////这个是设置窗口内部文字的,跟上面的对应
                } else {
                    closeLogWindow();
                }
                break;
            case 'kongZhi':
                if (isChecked) {
                    let m = {
                        "x": 100,
                        "y": 200,
                        "backgroundColor": "#80000000"
                    }
                    ui.showCtrlWindow();
                    // setCtrlViewSizeEx(m);
                } else {
                    closeCtrlWindow();
                }
                break;
            case 'wuzhangai':
                if (isChecked) {
                    utils.openIntentAction(android.provider.Settings.ACTION_ACCESSIBILITY_SETTINGS);
                }
                break;
            case 'isWuZhangAi':
                if (isChecked) ui.setRunningMode(2);
                break
            case 'isDaiLi':
            case '单选框3':
                if (isChecked) ui.setRunningMode(1);
                break;
            case '多选框1':
            case '多选框2':
            case '多选框3':
                // if (isChecked) {
                //     jcUI.CheckBox.setTextColor(view, '#ec6d71');
                //     jcUI.CheckBox.setButtonTintList(view, '#ec6d71')
                // } else {
                //     jcUI.CheckBox.setButtonTintList(view, '#B5B5B5');
                //     jcUI.CheckBox.setTextColor(view, '#B5B5B5')
                // }
                break;
        }
    });
}//监听选中事件
function Listen_Click(Button) {
    ui.setEvent(Button, "click", function () {
        let tag = Button.getTag() + "";
        // let text = Button.getText() + ""//也可以通过按钮的text来判断
        logd('当前被点击的按钮tag:' + tag);
        switch (tag) {
            case 'addFile':
                break;
            case 'saveAllBtn':
                ui.saveAllConfig();
                toast('保存成功');
                break;
            case 'exitBtn':
                closeLogWindow();
                closeCtrlWindow();
                try {
                    android.os.Process.killProcess(android.os.Process.myPid());
                } catch (e) {
                    java.lang.System.exit(0);
                }
                break;
        }

    });
}//监听点击时间

function Listen_spinner(spinner) {
    ui.setEvent(spinner, "itemSelected", function (position, value) {
        let tag = spinner.getTag() + "";//下拉框不能通过txt来判断
        logd('当前被点击的按钮tag:' + tag + ' 编号:' + position + ' 内容: ' + value);
        switch (tag) {
            //这里可以做判断,并执行对应的方法
        }
        ui.saveAllConfig();
    });
}//监听下拉框事件

function Listen_Input(Edite) {
    Edite.addTextChangedListener(new TextWatcher({
        afterTextChanged: function (edit) {
            logd('当前输入框tag: ' + Edite.getTag() + '  输入框内容:' + edit);
            ui.saveAllConfig();
        }
    }));
}//监听输入框事件


/**
 * @函数用途   intent打开选择文件
 * @return {null}
 **/
function chooseFile() {
    try {
        let intent = intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        ui.getActivity().startActivityForResult(intent, 1);
    } catch (e) {
        logd(e);
    }
}//选择文件

/**
 * @函数用途   通过选中的文件,返回的该文件的真实路径
 * @param data{object} 数据
 * @return {string|null} path 返回路径字符串
 **/
function getFilePath(data) {
    try {
        let id = DocumentsContract.getDocumentId(data);
        id = id.split(":")[1];
        return id;
    } catch (e) {
        loge(e);
    }
    return null;
}


function ProgressCustialog() {
    let builderDialog = new AlertDialog.Builder(ui.getActivity());
    let dialog = builderDialog.create();// 使用 Builder 创建一个对话框实例
    dialog.setCancelable(false);// 设置返回键 不可关闭
    let dialogView = ui.parseView("dialogviewLogin.xml");
    dialog.show();// 显示对话框
    let window = dialog.getWindow();// 获取对话框的窗口
    let lp = window.getAttributes();// 获取窗口的布局参数
    lp.width = WindowManager.LayoutParams.MATCH_PARENT;// 设置窗口的宽度为全屏
    window.getDecorView().setPadding(0, 0, 0, 0);// 设置内边距 为0 解决部分机型不能全屏问题
    window.getDecorView().setClipToOutline(false);//解决部分机型不能全屏问题
    window.setAttributes(lp);// 设置窗口的布局参数
    window.setContentView(dialogView);//加载自定义对话框xml布局
    window.setGravity(Gravity.CENTER);// 设置对话框内容显示在屏幕中心
    window.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);// 修改宽高为充满屏幕
    // window.setBackgroundDrawableResource(android.R.color.transparent);// 设置对话框背景为透明
    //  这里是获取对话框布局的所有要控制的view对象。根据定义的 tag 获取
    let okBtn = dialogView.findViewWithTag("loginBtn");
    let detTV = dialogView.findViewWithTag("card");

    let back = jcUI.Drawable.MiaoBian('#20ff0000', 2);
    jcUI.setBackground(detTV, back)
    // 编辑框 获取焦点监听事件(部分机型可能没有这个监听)
    detTV.setOnFocusChangeListener(new View.OnFocusChangeListener({
        onFocusChange: function (view, b) {
            // 部分不支持监听获取焦点的机型 只需要添加下面的2行代码即可
            // 安卓11以上 添加下面两行代码可打开对话框时弹出输入法键盘.
            // 清除窗口输入法标志位
            window.clearFlags(WindowManager.LayoutParams.FLAG_ALT_FOCUSABLE_IM);
            //重新设置窗口展示输入法
            window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_VISIBLE);
        }
    }))
    //  确定按钮， 获取编辑框内容并保存配置
    okBtn.setOnClickListener(function (v) {
        let str = detTV.getText() + '';// 获取编辑框文本字符串
        if (!str) {
            ui.toast('请先输入激活码');
            return;
        }
        logd(str);
        ui.saveAllConfig();// 保存配置
        logd("点击了");

        toast("输入的信息：" + str);
        ui.run(10, function () {
            toast("登录成功提示")
            dialog.dismiss();// 关闭对话框
        })
    });
}//登录界面

try {
    main();
} catch (e) {
    loge(e);
}
