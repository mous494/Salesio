/// <reference path="dist/vis.min.js" />
/// <reference path="http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js" />
/// <reference path="toastr.js" />


//デバッグ処理用のフラグ
let DEBUG_FLAG = true;
let LOG = [];


//ページが読み込まれたとき用処理
$(document).ready(function () {
    $original = $('.inner-op:first').clone();
    $op_parent_ogirinal = $('.op_parent:first').clone();
    //設定追加ボタンのコールバックjquery
    $('input[name=op_add]').click(op_add_form);
    $('input[name=op_parent_add]').click(op_parent_form_add);
    $('input[name=option_parent_del]').click(function () {
        $(this).parent().parent().remove();
    });
    $('#plot_to_story').click(plot_to_story);
    $('#story_to_plot').click(story_to_plot);
    $('#plot_eq_story').click(plot_eq_story);
    $('#focus_story').click(story_focus);
    $('#focus_plot').click(plot_focus);
    $('#hi_light_del').click(plot_focus_del);
    $('#plot_reset').click(plot_reset);
    $('#copy').click(node_copy);
    $('#paste').click(paste_node);
    $('#load_log').click(log_read);
    $('#log_print').click(log_view);
    $('#log_previous').click(log_previous);
    $('#log_next').click(log_next);
    $('#log_jump').click(log_jump);


    $('#tutorial').click(function () {

        var intro = new introJs();
        intro.onbeforechange(function (targetElement) {
            if (targetElement.id == 'plot_node_op') {
                $("a[href='#t_1']").click();

            }
            if (targetElement.id == 'story_node_op') {
                $("a[href='#t_15']").click();

            }
            if (targetElement.id == 'file_op') {
                $("a[href='#t_3']").click();

            }
            if (targetElement.id == 't_4') {
                $("a[href='#t_4']").click();

            }
        });

        intro.start();
    });
    //$("a[href='#t_3']").click();

    // $('#plot_check').click(plot_check);

    $('.story_operation').find('#story_update').click(story_node_update);
    $('#log_dl_button').click(log_save);



    //TODO:ここに物語曲線のインターフェイスの実装




    //TODO:ここからレーダーチャート関連の実験

    // let emotion_canvas = document.getElementsByClassName('emotion_externalization_canvas')[0];
    // context_draw(emotion_canvas);

    emotion_module_setting($($('.emotion_externalization_module')[0]));
    emotion_module_setting($($('.emotion_externalization_module')[1]));
    emotion_module_setting($($('.emotion_externalization_module')[2]));
    emotion_module_setting($($('.emotion_externalization_module')[3]));


    toastr.info('Welcome', 'ようこそ');
});


//プロットの初期ノードの設定
//groupオプションでノードの種類を書いた方が良い
var nodes = new vis.DataSet([
    {id: 0, label: 'プロット', group: 'root', level: 1, title: 'プロット木の頂点', shape: 'box'},
    {id: 2, label: '承', group: 'structure', level: 2, title: '転に向けての準備', shape: 'box'},
    {id: 1, label: '起', group: 'structure', level: 2, title: '物語の始まり', shape: 'box'},
    {id: 3, label: '転', group: 'structure', level: 2, title: '物語の大きな転換点', shape: 'box'},
    {id: 4, label: '結', group: 'structure', level: 2, title: '物語の結末', shape: 'box'},
]);

//この形の指定は必ずfrom親to子の形である(というオプションを組んでる)上から順番左から作られる
//プロットの初期エッジの設定
var edges = new vis.DataSet([
    {id: 1, from: 0, to: 1},
    {id: 2, from: 0, to: 2},
    {id: 3, from: 0, to: 3},
    {id: 4, from: 0, to: 4},
]);

var old_selected = undefined;//たぶんつかってない


//プロットネットワークを配置する要素の設定
var container = document.getElementById('mynetwork');

// データセットの作成
var data = {
    nodes: nodes,
    edges: edges
};
//ネットワークののオプション設定
var default_options = {
    interaction: {
        navigationButtons: true
    },
    layout: {
        //improvedLayout: false,
        hierarchical: {
            enabled: true,
            // blockShifting: true,
            // edgeMinimization: true,
            // parentCentralization: true,
            direction: 'UD',
            sortMethod: 'directed'//or directed
        },
    },
    physics: {
        enabled: true,
        maxVelocity: 20,
        hierarchicalRepulsion: {nodeDistance: 300}
    },
    nodes: {
        shape: 'box',
    },
    edges: {
        arrows: 'middle'
    },
    clickToUse: true,


};


// ネットワーク図初期化・表示
var plot_network = new vis.Network(container, data, default_options);
set_interaction();

//TODO:タイムライン関係
//ここからタイムライン関連の処理


//テスト用データ作成
var date = [new Date(), new Date(), new Date(), new Date(), new Date(), new Date()];

for (var i = 0; i < 6; i++) {
    date[i].setDate('0-1-0');
    date[i].setFullYear(i);

}

var timeline_items = new vis.DataSet();

// [
//     {id: 1, content: 'item 1', start:date[0],title:'なにか'},
//     {id: 2, content: 'item 2', start: date[1]},
//     {id: 3, content: 'item 3', start: date[2]},
//     {id: 4, content: 'item 4', start: date[3]},
//     {id: 5, content: 'item 5', start: date[4]},
//     {id: 6, content: 'item 6', start: date[5]}
// ]

//タイムラインの設定で使う日付の設定
var def_date = new Date();
def_date.setDate('-200');
def_date.setFullYear(0, 0, 0);
//
var timeline_options = {

    zoomMin: 315360000000,
    zoomMax: 315360000000000,
    showCurrentTime: false,
    clickToUse: true,
    editable: true,
    //min:def_date,
    //start:def_date,
    snap: null,

    onRemove: function (item, callback) {
        plot_network.storePositions();
        var update_nodes = data.nodes.get({
            /**
             * @return {boolean}
             */
            filter: function (item1) {
                return (item1.story_id == item.id);
            }
        });
        for (var item2 in update_nodes) {
            update_nodes[item2].story_id = undefined;
        }
        data.nodes.update(update_nodes);


        callback(item);
        if (DEBUG_FLAG == true) {
            log_add(item.content + 'ストーリーノードが削除されました')
        }
    },
    onAdd: function (item, callback) {
        callback(item);
        if (DEBUG_FLAG == true) {
            log_add('ストーリーに' + item.content + 'が追加されました');
        }

    },
    onMove: function (item, callback) {
        callback(item);
        if (DEBUG_FLAG == true) {
            log_add('ストーリーノード' + item.content + 'が移動されました');

        }
    }
};

var story_container = document.getElementById('mytimeline');
var story_timeline = new vis.Timeline(story_container, timeline_items, timeline_options);
var time_bar;
set_timeline_interaction();


function set_timeline_interaction() {
    story_timeline.moveTo(def_date);
    time_bar = story_timeline.addCustomTime(def_date);

    story_timeline.on("select", function (params) {
        if (params.items.length < 1) {
            //プロットにフォーカスするボタンの有効化
            $('#focus_plot').prop('disabled', true);
            return;
        }
        else {
            //プロットにフォーカスするボタンの有効化
            $('#focus_plot').prop('disabled', false);
        }
        var select_id = params.items[0];
        var select_data = timeline_items.get(select_id);
        var $story_operation = $('.story_operation');
        var $add_button = $story_operation.find('input[name=op_parent_add]');
        var $add_inner_button = $story_operation.find('input[name=op_add]');

        $story_operation.find('input[name=name]').val(select_data.content);
        $story_operation.find('textarea[name=content]').val(select_data.title);

        //設定の表示

        var context = select_data.context;
        $story_operation.find('.option_block').find('*').remove();
        //設定の数だけフォームを増やして内容反映
        for (var key in context) {
            op_parent_form_add.call($add_button[0]);

            $story_operation.find('input[name=op_parent_name]:last').val(key);
            $story_operation.find('[name=context_group]').val(context[key]['cat']);
            var $add_inner_button = $story_operation.find('input[name=op_add]:last');
            var inner_context = context[key]['property'];

            for (var inner in inner_context) {
                op_add_form.call($add_inner_button[0]);
                $story_operation.find('input[name=op_name]:last').val(inner);
                $story_operation.find('input[name=op_content]:last').val(inner_context[inner]);
            }
        }
    });
}

// //タイムライン関連の処理終わり

function set_interaction() {//操作関連のリスナー登録
    //ドラッグ時に物理演算を無効にして入れ替えやすくする
    plot_network.on("dragStart", function d_start(params) {
        plot_network.setOptions({
            physics: {enabled: false},
        });

        var selected_node = data.nodes.get(params.nodes[0]);
        if (selected_node.group == 'structure') {
            plot_network.setOptions({
                nodes: {fixed: {x: true}}
            });
        }
    });

    plot_network.on("dragEnd", function d_end(params) {
        plot_network.setOptions({
            physics: {enabled: true},
            nodes: {fixed: {x: false}}
        });
        if (DEBUG_FLAG == true && params.nodes.length != 0)
            log_add(data.nodes.get(params.nodes[0]).label + 'がドラッグされました');
    });


    //イベント（インタラクション）の設定とか

    //クリック時のイベントを設定
    old_selected = undefined;
    plot_network.on("selectNode", function (params) {

        //ノードを選択した場合の処理
        if (params.nodes.length != 0) {

            //選択ノードと選択エッジを格納
            var s_nodeid = params.nodes[0];
            var s_node = data.nodes.get(s_nodeid);
            //console.log(s_node);
            //フォームの内容を選択内容に合わせて更新
            document.getElementById('name').value = s_node.label;
            document.getElementById('title').value = s_node.title;
            var $add_button = $('.node_operation').find('#op_parent_add');
            var context = s_node.context;

            //設定のフォーム生成を行って、内容反映
            //フォームを全部消す
            $('.node_operation').find('#option_block').find('*').remove();
            //設定の数だけフォームを増やして内容反映
            for (var key in context) {
                op_parent_form_add.call($add_button[0]);

                $('.node_operation').find('input[name=op_parent_name]:last').val(key);
                $('.node_operation').find('[name=context_group]').val(context[key]['cat']);
                var $add_inner_button = $('.node_operation').find('input[name=op_add]:last');
                var inner_context = context[key]['property'];

                for (var inner in inner_context) {
                    op_add_form.call($add_inner_button[0]);
                    $('.node_operation').find('input[name=op_name]:last').val(inner);
                    $('.node_operation').find('input[name=op_content]:last').val(inner_context[inner]);

                }
            }

            //属性の表示を決める
            var group_option = document.node_operation.group.options;
            for (var i = 0; i < group_option.length; i++) {
                if (group_option[i].value == s_node.group) {
                    group_option[i].selected = true;
                }
            }

            if (s_node.group == 'action') {
                $('#focus_story').prop('disabled', false);
            }

        }
    });

    plot_network.on("deselectNode", function (params) {

        // if (params.nodes.length == 0 && document.node_operation.edge_add.checked == true) {
        //     old_selected = undefined;
        // }
        $('#focus_story').prop('disabled', true);
    });

    plot_network.on("doubleClick", function (params) {
        if (params.nodes.length == 0) {
            return;
        }

        var s_nodeid = params.nodes[0];
        var s_node = data.nodes.get(s_nodeid);
        //ルートをダブルクリックしても追加不可
        if (s_node.group == 'root' || s_node.group == 'action') {
            toastr.warning('そのノードには追加できません', '無効な操作');
            return;
        }

        if (s_node.group == 'structure') {

            s_node.group = 'scene';

        }
        var new_id = data.nodes.add(create_network_node_data('', '', s_node.group, s_node.context, s_node.level + 1));
        data.edges.add({"from": s_nodeid, "to": new_id[0]});
        if (DEBUG_FLAG == true) {
            log_add(s_node.label + 'に新しいノードが追加されました');
        }
    });


}


/*
 ファイル読み込み用関数
 HACK:将来的にサーバー側保存に対応する
 */
function file_read() {
    var file_list = file.files;

    //ファイル読み込み
    var reader = new FileReader();
    reader.readAsText(file_list[0]);

    reader.onload = function () {

        //store_data形式で入ってくるから配列にしてDataset化したら可能だった
        var load_data = JSON.parse(reader.result);
        nodes = new vis.DataSet(load_data.nodes);
        edges = new vis.DataSet(load_data.edges);
        timeline_items = new vis.DataSet(load_data.timeline);
        data = {
            nodes: nodes,
            edges: edges
        };
        plot_network = new vis.Network(container, data, default_options);
        story_timeline.destroy();
        story_timeline = new vis.Timeline(story_container, timeline_items, timeline_options);

        set_interaction();
        set_timeline_interaction();
    }

}


//ファイル書き出し用関数
//hack:こっちも将来的にサーバー側保存に対応する
function st_pos() {
    plot_network.storePositions();
    //プロット書き出し用の整形を行う
    var n_data = data.nodes.get();
    var e_data = data.edges.get();
    var timeline_data = timeline_items.get();
    var store_data = {
        nodes: n_data,
        edges: e_data,
        timeline: timeline_data
    };
    //データを取り出して格納（ノードとエッジに関する全てのデータは保存されている、はず…… 


    var json_text = JSON.stringify(store_data, undefined, 4);
    var blob = new Blob([json_text], {"type": "text/plain"});
    //なんかよく分からんけどjquerry使ったら妙に簡単にできたーedgeだと無理っぽい
    window.URL = window.URL || window.webkitURL;
    $("#download").attr("href", window.URL.createObjectURL(blob));

}


//ノード追加ボタンのコールバック。ノードのダブルクリックで実装しているので未使用
function node_add_click() {

    var add_item_content = get_network_content_data();
    var level = undefined;

    //起承転結は追加できないようにする
    if (add_item_content.group == 'structure') {
        toastr.warning('起承転結ノードは追加・削除できません');
        return;
    }

    //実際のデータの追加
    var node = plot_network.getSelectedNodes();

    //何かノードを選択しているかどうか
    if (node.length == 0) {
        //何も選択してないときは
        //level = data.nodes.max('level').level;

        //data.nodes.add({ "label": label, "group": group, "title": title, "context":context, "level": Number(level), shape: 'box', });
    }
    else {
        level = data.nodes.get(node[0]).level + 1;
        add_item_content.level = Number(level);
        var new_item_id = data.nodes.add(add_item_content);
        data.edges.add({"from": node[0], "to": new_item_id[0]});

    }
}

//ノード更新のコールバック
function node_update_click() {
    var node = plot_network.getSelectedNodes();
    if (node.length == 0) {
    } else {

        var add_content = get_network_content_data();//フォームからコンテンツのデータを取ってくる

        //起承転結直下のアクション、頂点と構造ノードのグループ変更制限
        var orig_group = data.nodes.get(node[0]).group;
        if ((orig_group == 'structure' || orig_group.group == 'root') && (orig_group != add_content.group)) {
            add_content.group = orig_group;
            toastr.warning('頂点または起承転結ノードは属性を変更することはできません');
        }
        else if (data.nodes.get(get_parent(node[0])).group == 'structure' && add_content.group == 'action') {
            add_content.group = orig_group;
            toastr.warning('起承転結の直下にアクションを持つことはできません');
        }
        //中間ノードのアクションへの変換制限
        else if (get_children(node[0]).length != 0 && add_content.group == "action") {
            add_content.group = orig_group;
            toastr.warning('子供があるノードをアクションに変更することはできません');
        }

        //アクションから変更した場合に対応を消す
        if (orig_group == 'action' && add_content.group != 'action') {
            add_content.story_id = undefined;

        }


        add_content.id = node[0];//idにはもとの値を設定
        plot_network.storePositions();
        data.nodes.update(add_content);
        //ここではレベルは弄らない

        //とりあえず再度ネットワークを描画することで対応することにする。単純にやるとlevelを変化させても見た目に変化しない
        plot_network.storePositions();
        toastr.info('ノードを更新しました');
        log_add(add_content.label + 'ノードを更新しました');

    }

}

// //todo:いろいろ考える
// //レベル操作関係はここに
// function level_up_click() {
//
//     var node = plot_network.getSelectedNodes();
//     if (node.length == 1) {
//         origin_level = Number(data.nodes.get(node[0]).level);
//         if (origin_level > 3) {
//             var level = origin_level - 1;
//
//             data.nodes.update({
//                 "id": node[0],
//                 "level": Number(level)
//
//             });
//
//             //とりあえず再度ネットワークを描画することで対応することにする。単純にやるとlevelを変化させても見た目に変化しない
//             plot_network.storePositions();
//             plot_network.setData(data);
//             plot_network.fit();
//             plot_network.selectNodes(node);
//
//         }
//         else
//             alert("レベル変更できない属性かレベル範囲外です");
//     }
//
//
// }
//
// function level_down_click() {
//     var node = plot_network.getSelectedNodes();
//     if (node.length == 1) {
//         origin_level = Number(data.nodes.get(node[0]).level);
//         if (origin_level > 2) {
//             var level = origin_level + 1;
//
//             data.nodes.update({
//                 "id": node[0],
//                 "level": Number(level)
//             });
//
//             //とりあえず再度ネットワークを描画することで対応することにする。単純にやるとlevelを変化させても見た目に変化しない
//             plot_network.storePositions();
//             plot_network.setData(data);
//             plot_network.fit();
//             plot_network.selectNodes(node);
//
//         }
//         else
//             alert("レベル変更できない属性かレベル範囲外です");
//     }
// }

//ノード・エッジ削除
function del_click() {

    if (plot_network.getSelectedNodes().length == 0) {
        return;
    }
    var selected_node = data.nodes.get(plot_network.getSelectedNodes()[0]);
    if (selected_node.group == "structure" || selected_node.group == "root") {
        toastr.warning("その要素は削除することはできません");
        return;
    }
    var selected_edge = data.edges.get(plot_network.getSelectedEdges()[0]);

    if (selected_edge.id < 5) {
        toastr.warning("その要素は削除することはできません");
        return;

    }
    if (DEBUG_FLAG == true) {
        log_add(data.nodes.get(plot_network.getSelectedNodes()[0]).label + 'プロットノードを削除しました');
    }


    data.nodes.remove(plot_network.getSelectedNodes());
    data.edges.remove(plot_network.getSelectedEdges());


}

function plot_check() {

    //アクション・ストーリー間のチェック
    var check_action = data.nodes.get({
        filter: function (item) {
            return (item.story_id == undefined && item.group == 'action');
        }
    });

    if (check_action.length > 0) {
        toastr.info('ストーリーとの対応が見つからないアクションがありました！！')
    }

    var check_scene = data.nodes.get({
        filter: function (item) {
            return (item.group == 'scene');
        }
    });
    if (check_scene.length < 1)
        return;
    for (var item in check_scene) {
        if (check_scene.hasOwnProperty(item)) {
            var children = get_children(check_scene[item].id);
            if (children.length < 1) {
                toastr.info('子供を持たないシーンがあります');
                break;
            }
        }


    }


}


function story_node_update() {
    var $story_operation = $('.story_operation');

    var node_name = $story_operation.find('input[name=name]').val();
    var title = $story_operation.find('textarea[name=content]').val();
    var context = get_context('story');
    var select_item_id = story_timeline.getSelection()[0];
    if (select_item_id.length != 0) {
        var add_item = {
            "id": select_item_id,
            "content": node_name,
            "title": title,
            "context": context
        };

        timeline_items.update(add_item);
        if (DEBUG_FLAG == true) {
            log_add('ストーリーノード' + add_item.content + 'が変更されました');

        }
    }
}


//フォームから設定を取得してjsonを返す
function get_context(cat) {
    var context = {};
    var parent_name;
    var $tab;
    if (cat == 'plot') {
        $tab = $('.node_operation');
    }
    else if (cat == 'story') {
        $tab = $('.story_operation');
    }
    else {
        return context;
    }

    $tab.find('p[class=op_parent]').each(function (index, element) {
        parent_name = $(element).find('input[name=op_parent_name]').val();
        var parent_category = $(element).find('[name=context_group]').val();
        var inner_struct = {};
        $(element).closest('div').find('p[class=inner-op]').each(function (index, elem) {
            var op_name = $(elem).find('input[name=op_name]').val();
            inner_struct[op_name] = $(elem).find('input[name=op_content]').val();
        });

        var outer_struct = {};
        outer_struct['cat'] = parent_category;
        outer_struct['property'] = inner_struct;

        context[parent_name] = outer_struct;

    });

    return context;
}


//属性設定フォームの追加（ボタンから呼ばれた場合）
function op_add_form() {
    $(this).closest('div[class=form-block]').append($original.clone());
    //一応動的生成された項目の削除に対応？
    $('input[name=op_del]').off('click');
    $('input[name=op_del]').on('click', function () {
        $(this).parent().remove();
    });
}


function op_parent_form_add() {


    $(this).prev().append('<div class="form-block" id="form-block"></div>');
    $(this).prev().children('.form-block:last').append($op_parent_ogirinal.clone());


    $('input[name=op_add]').off();
    $('input[name=op_add]').click(op_add_form);
    $('input[name=option_parent_del]').off();
    $('input[name=option_parent_del]').click(function () {
        $(this).parent().parent().remove();
    });

}

//ネットワークノードの内容をフォームから取ってくる関数。
function get_network_content_data() {

    var label = $('.node_operation').children('#name').val();
    var title = $('.node_operation').children('#title').val();
    var context = get_context('plot');
    var group = document.node_operation.group.value;

    var node_data = {"label": label, "group": group, "title": title, "context": context, shape: 'box'};
    return node_data;
}

//与えられたデータからネットワークノードのオブジェクトを生成する関数
function create_network_node_data(title, label, group, context, level) {
    var node_data = {"label": label, "group": group, "title": title, "context": context, "level": level, shape: 'box'};
    return node_data;

}


//TODO:上下間のノードの移動
/**
 * ストーリーノードをプロットへ
 */
function story_to_plot() {
    plot_network.storePositions();
    var selected_plot_node_id = plot_network.getSelectedNodes()[0];
    var selected_plot_node = data.nodes.get(selected_plot_node_id);
    var selected_story_node_id = story_timeline.getSelection()[0];
    var selected_story_node = timeline_items.get(selected_story_node_id);

    //プロット側のノードがシーン以外は却下
    if (selected_plot_node.group != 'scene') {
        toastr.warning('シーン以外の要素にアクションを配置できません');
        return;
    }
    //プロット側に合わせてデータを整形
    var add_data = create_network_node_data(selected_story_node.title, selected_story_node.content, 'action', selected_story_node.context
        , selected_plot_node.level + 1);

    add_data.story_id = selected_story_node_id;

    //データを追加・エッジの設定も忘れずに
    var add_data_id = data.nodes.add(add_data);
    data.edges.add({'from': selected_plot_node_id, 'to': add_data_id[0]});

    if (DEBUG_FLAG == true) {
        log_add('プロットの' + selected_plot_node.label + 'ノードにストーリーから' + add_data.label + 'が追加されました');

    }


}

/**
 * プロットのアクションノードをストーリーへ
 */
function plot_to_story() {

    plot_network.storePositions();
    var select_id = plot_network.getSelectedNodes()[0]
    var select_node = data.nodes.get(select_id);

    if (select_node.group != 'action') {
        toastr.warning("アクション要素しかタイムラインには追加できません");
        return;
    }
    var date = story_timeline.getCustomTime(time_bar);
    //date.setDate('0-1-0');
//    date.setFullYear(0,0,0);
    var add_data = {
        "content": select_node.label,
        "title": select_node.title,
        "context": select_node.context,
        "start": date
    };


    select_node.story_id = timeline_items.add(add_data)[0];
    data.nodes.update(select_node);
    if (DEBUG_FLAG == true) {
        log_add('ストーリーにプロットから' + add_data.content + 'が追加されました');

    }

}

/**
 * ストーリーとプロットノードを関連づけ
 */
function plot_eq_story() {
    plot_network.storePositions();
    var selected_plot_node_id = plot_network.getSelectedNodes()[0];
    var selected_plot_node = data.nodes.get(selected_plot_node_id);
    var selected_story_node_id = story_timeline.getSelection()[0];
    var selected_story_node = timeline_items.get(selected_story_node_id);

    //プロット側のノードがシーン以外は却下
    if (selected_plot_node.group != 'action') {
        toastr.warning('アクション以外の要素にストーリーとの対応を関連付けできません');
        return;
    }
    else if (selected_story_node_id == undefined) {
        toastr.warning('ストーリーが選択されていません');
        return;

    }

    selected_plot_node.story_id = selected_story_node_id;
    data.nodes.update(selected_plot_node);
    if (DEBUG_FLAG == true) {
        log_add('プロットの' + selected_plot_node.label + 'ノードと、ストーリーの' + selected_story_node.content + 'ノードが関連付けられました');

    }

}

/**
 * 対応するストーリーノードに着目する操作
 */
function story_focus() {
    var s_node_id = plot_network.getSelectedNodes();
    var s_node = data.nodes.get(s_node_id)[0];
    if (s_node_id.length < 1) {
        return;
    }

    if (s_node.story_id != undefined && s_node.group == 'action') {

        story_timeline.focus(s_node.story_id);
        story_timeline.setSelection(s_node.story_id);

        if (DEBUG_FLAG == true) {
            log_add(s_node.label + 'が対応するストーリーにフォーカス成功')
        }
    }
    else {
        toastr.info('このノードには対応が割り当てられてないか、アクションノードではありません')
        if (DEBUG_FLAG == true) {
            log_add(s_node.label + 'が対応するストーリーにフォーカス失敗')
        }
        return;
    }
}

function plot_focus() {
    //選んでないときの処理
    if (story_timeline.getSelection().length > 0) {
        var story_node_id = story_timeline.getSelection()[0];

        var hit_plot_node_id = data.nodes.getIds({
            filter: function (item) {
                return (item.story_id == story_node_id);
            }
        });

        plot_focus_del();

        var hit_plot_ary = data.nodes.get(hit_plot_node_id);
        for (var item in hit_plot_ary) {
            hit_plot_ary[item].color = 'red';
        }
        plot_network.storePositions();
        data.nodes.update(hit_plot_ary);
        plot_network.selectNodes(hit_plot_node_id);
        plot_network.fit();

        if (DEBUG_FLAG == true) {
            log_add(timeline_items.get(story_node_id).content + 'のストーリーが示すプロットにフォーカス');

        }
    }
}

function plot_focus_del() {
    plot_network.storePositions();
    var select_nodes = data.nodes.get({
        filter: function (item) {
            return (item.color = 'red');
        }
    });
    for (var item in select_nodes) {
        select_nodes[item].color = undefined;

    }

    data.nodes.update(select_nodes);

    if (DEBUG_FLAG == true) {
        log_add('ハイライト解除');
    }


}


var copied_node;

/**
 * プロットのノードをコピーする関数
 */
function node_copy() {
    copied_node = data.nodes.get(plot_network.getSelectedNodes()[0]);

    //一応コピー不可も考える？
    toastr.info('ノードをコピーしました');

    log_add(copied_node.label + 'ノードをクリップボードにコピー');
}

/**
 * プロットのノードをペーストする関数
 */
function paste_node() {
    //必要データと追加データーの前処理
    let parent_id = plot_network.getSelectedNodes()[0];
    let parent_node = data.nodes.get(parent_id);
    delete copied_node.id;

    //ここで条件確認
    if ((parent_node.group == 'structure' && copied_node.group == 'scene') || (parent_node.group == 'scene' && copied_node.group == 'scene') || (parent_node.group == 'scene' && copied_node.group == 'action')) {
        //レベルを整形
        copied_node.level = parent_node.level + 1;
        let added_id = data.nodes.add(copied_node)[0];
        data.edges.add({'from': parent_id, 'to': added_id});

        toastr.info('ノードをペーストしました');
        log_add(copied_node.label + 'ノードを' + parent_node.label + 'に貼り付け');
    }
    else {
        toastr.warning('そのノードはその位置には貼り付けることができません');

    }

}


//この辺りから下はGUIから直接呼ばれない内部的なメソッド
/**
 * エッジを辿って親のIDを返す関数です
 * @param id {number}親を検索したい子供のID
 * @returns {*}         親のID
 */
function get_parent(id) {

    var got_edge = data.edges.get({
        filter: function (item) {
            return (item.to == id);
        }
    });
    return (got_edge[0].from);
}

/**
 * エッジをたどって子供をとってくる関数
 * @param id {number}親のID
 * @returns {*}子供のリスト、配列
 */
function get_children(id) {

    var got_edge = data.edges.get({
        filter: function (item) {
            return (item.from == id);
        }
    });
    return (got_edge);
}

/**
 * 見えなくなったときにプロットをもとに戻す用
 */
function plot_reset() {
    plot_network.fit();
}


/**
 * ログに追加する関数
 * @param comment
 */
function log_add(comment) {
    var n_data = data.nodes.get();
    var e_data = data.edges.get();
    var timeline_data = timeline_items.get();
    var store_data = {
        nodes: n_data,
        edges: e_data,
        timeline: timeline_data,
        comment: comment,

    };
    LOG.push(store_data);
}

/**
 * ログを保存するための関数
 */
function log_save() {



    //データを取り出して格納（ノードとエッジに関する全てのデータは保存されている、はず……


    var json_text = JSON.stringify(LOG, undefined, 4);
    var blob = new Blob([json_text], {"type": "text/plain"});
    window.URL = window.URL || window.webkitURL;
    $("#log_download").attr("href", window.URL.createObjectURL(blob));


}

//ログファイル読み込み
function log_read() {
    var file_list = log_file.files;

    var reader = new FileReader();
    reader.readAsText(file_list[0]);

    reader.onload = function () {
        var load_data = JSON.parse(reader.result);
        LOG = load_data;
        var step = '0/' + LOG.length;
        $('#log_step').text(step);

        toastr.info('ログを読み込みました');
    }
}

function log_view() {
    var text = '';
    for (var a in LOG) {
        text += a + '\t' + LOG[a].comment + '\n';
    }
    text += '最終的なプロット全ノード数:' + LOG[LOG.length - 1].nodes.length + '\n全ストーリーノード数:' + LOG[LOG.length - 1].timeline.length;
    $('#log_view').val(text);

}

function log_previous() {
    g_step--;
    log_move(g_step);
}

function log_next() {
    g_step++;
    log_move(g_step);
}

function log_jump() {
    g_step = $('#step').val();
    log_move(g_step);

}

var g_step = 0;

function log_move(step) {
    if (step < 0) {
        toastr.info('これ以前はないです');
        g_step = 0;
        step = 0;
    }
    else if (step >= LOG.length) {
        toastr.info('これ以上はないです');
        g_step = LOG.length - 1;
        step = LOG.length - 1;
    }


    var nodes = new vis.DataSet(LOG[step].nodes);
    var edges = new vis.DataSet(LOG[step].edges);
    var timeline_items = new vis.DataSet(LOG[step].timeline);
    data = {
        nodes: nodes,
        edges: edges
    };
    plot_network = new vis.Network(container, data, default_options);
    set_interaction();
    story_timeline.destroy();
    story_timeline = new vis.Timeline(story_container, timeline_items, timeline_options);
    //set_timeline_interaction();
    var text = '/' + (LOG.length - 1);
    $('#step').val(step + '');
    $('#current_operation').text(LOG[step].comment);

    $('#log_step').text(text);
}


function emotion_module_setting(emotion_module) {
    let sliders = emotion_module.find('.slider');
    let test_data = [0, 0, 0, 0];
    sliders.slider({
        min:-3,
        max:3,
        change: function () {

            for (let i = 0; i < 4; i++) {
                test_data[i] = $(sliders[i]).slider('value')/3;
            }


            let ctx = emotion_module.find('.emotion_externalization_canvas')[0].getContext('2d');
            ctx.clearRect(0, 0, 300, 300);


            const emotional_center = 150;
            const emotional_fullscale = 150;
            const axis_length = 150;
            const emotional_offset = 20;

            ctx.lineWidth = 1.0;
            ctx.strokeStyle = 'rgb(0,0,0)';
            ctx.fillStyle = 'rgb(0,0,0)';


            // 軸の描画
            for(let i=0;i<4;i++){
                ctx.beginPath();
                ctx.moveTo(emotional_center+polar2rectangular(axis_length,Math.PI*i/4)[0],emotional_center - polar2rectangular(axis_length,Math.PI*i/4)[1]);
                ctx.lineTo(emotional_center+polar2rectangular(axis_length,Math.PI*(4+i)/4)[0],emotional_center-polar2rectangular(axis_length,Math.PI*(4+i)/4)[1] );
                ctx.stroke();
            }


            // ctx.globalAlpha = 0.7;

            // ctx.strokeStyle = 'rgb(192,80,77)';
            //  ctx.fillStyle = 'rgb(192,80,77)';

            //感情点の描画
            for(let i = 0;i<4;i++){
                ctx.beginPath();
                   ctx.circle(emotional_center+polar2rectangular(test_data[i]*emotional_fullscale,Math.PI/2+Math.PI*-i/4)[0],emotional_center-polar2rectangular(test_data[i]*emotional_fullscale,Math.PI/2+Math.PI*-i/4)[1],5);
                ctx.stroke();
            }

            //感情基準点の描画
            for(let i = 0;i<4;i++){
                ctx.beginPath();
                ctx.circle(emotional_center+polar2rectangular(Math.sign(test_data[i])*emotional_fullscale,Math.PI/2+Math.PI*-i/4)[0],emotional_center-polar2rectangular(Math.sign(test_data[i])*emotional_fullscale,Math.PI/2+Math.PI*-i/4)[1],5);
                ctx.stroke();
            }

            let dup_data=new Array(8);
            for (let i = 0; i < 4; i++) {
                dup_data[i] = test_data[i];
                dup_data[i+4] = test_data[i];
            }



            //filltest
            let start_number = -1;
            let canditate_state_number;
            for (let i = 0; i < 4; i++) {
                let change_sign = 0;
                for(let j = i;j < i+3; j++){
                    if(Math.sign(dup_data[j])!==Math.sign(dup_data[j+1])){
                        change_sign++;
                        canditate_state_number=j+1;
                    }
                }
                if(change_sign===0){
                    start_number=0;
                    break;
                }
                else if(change_sign===1){
                    start_number=canditate_state_number;
                    break;
                }
                //例外パターン(no1 no4axis関連）
                if((Math.sign(dup_data[0])===Math.sign(dup_data[3]))&&((Math.sign(dup_data[0])!==Math.sign(dup_data[1])))||(Math.sign(dup_data[0])!==Math.sign(dup_data[2]))){
                    start_number=-1;
                    break;
                }

            }

            if(start_number!==-1) {

                ctx.beginPath();
                for (let i = start_number; i < start_number + 4; i++) {

                    const current_x = emotional_center + polar2rectangular(dup_data[i] * emotional_fullscale, Math.PI / 2 + Math.PI * -(i % 4) / 4)[0];
                    const current_y = emotional_center - polar2rectangular(dup_data[i] * emotional_fullscale, Math.PI / 2 + Math.PI * -(i % 4) / 4)[1];


                    if (i === start_number)
                        ctx.moveTo(current_x, current_y);
                    else
                        ctx.lineTo(current_x, current_y);

                }

                ctx.lineWidth = 3.0;
                ctx.strokeStyle = 'rgba(192, 80, 77, 0.7)';
                ctx.stroke();


            }




        }


    });


    // let button = emotion_module.find('.slider_decide');
    // button.click(function () {
    //
    //     let ctx = emotion_module.find('.emotion_externalization_canvas')[0].getContext('2d');
    //     ctx.clearRect(0, 0, 300, 300);
    //
    //
    //
    //
    //
    //
    // });
    let canvas = emotion_module.find('.emotion_externalization_canvas')[0];

    canvas.addEventListener('click',function (e) {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX-rect.left;
        const y= e.clientY-rect.top;

        const max_emo = 110;

        const keys = Object.keys(emotions);
        for(let i=0; i<keys.length;i++) {
            let emotion_name = keys[i];
            let r = emotions[keys[i]].r*max_emo/3;
            let th = emotions[keys[i]].th;

            const coodinate = polar2rectangular(r, th);

            // console.log(x);
            // console.log(y);
            // console.log(coodinate);

            if((Math.pow((x-(coodinate[0]+150)),2)+Math.pow((y-(-coodinate[1]+150)),2))<250){
                console.log(emotion_name);
            }
        }


    },false);


}


const emotions = {
    "fear": {
        "th": 0,
        "r": 2
    },
    "trust": {
        "th": Math.PI / 4,
        "r": 2
    },
    "joy": {
        "th": Math.PI / 2,
        "r": 2
    },
    "anticipation": {
        "th": 3 * Math.PI / 4,
        "r": 2
    },
    "anger": {
        "th": Math.PI,
        "r": 2
    },
    "disgust": {
        "th": 5 * Math.PI / 4,
        "r": 2
    },
    "sadness": {
        "th": 3 * Math.PI / 2,
        "r": 2
    },
    "surprise": {
        "th": 7 * Math.PI / 4,
        "r": 2
    },

    "terror": {
        "th": 0,
        "r": 1
    },

    "admiration": {
        "th": Math.PI / 4,
        "r": 1
    },
    "ecstasy": {
        "th": Math.PI / 2,
        "r": 1
    },
    "vigilance": {
        "th": 3 * Math.PI / 4,
        "r": 1
    },
    "rage": {
        "th": Math.PI,
        "r": 1
    },
    "loathing": {
        "th": 5 * Math.PI / 4,
        "r": 1
    },
    "grief": {
        "th": 3 * Math.PI / 2,
        "r": 1
    },
    "amazement": {
        "th": 7 * Math.PI / 4,
        "r": 1
    },


    "apprehension": {
        "th": 0,
        "r": 3
    },

    "acceptance": {
        "th": Math.PI / 4,
        "r": 3
    },
    "serenity": {
        "th": Math.PI / 2,
        "r": 3
    },
    "interest": {
        "th": 3 * Math.PI / 4,
        "r": 3
    },
    "annoyance": {
        "th": Math.PI,
        "r": 3
    },
    "boredom": {
        "th": 5 * Math.PI / 4,
        "r": 3
    },
    "pensiveness": {
        "th": 3 * Math.PI / 2,
        "r": 3
    },
    "distraction": {
        "th": 7 * Math.PI / 4,
        "r": 3
    }

};


function polar2rectangular(r, th) {
    let coodinate = [0.0, 0.0];
    coodinate[0] = r * Math.cos(th);
    coodinate[1] = r * Math.sin(th);

    return coodinate;
}

function rectangular2polar(x,y){
    let polar = [0.0, 0.0];

    polar[0] = Math.sqrt(x * x + y * y);
    polar[1]=y/x;

    return polar;
}


function context_draw(emotion_canvas) {
    $('.slider').slider();
    $('#slider_decide').click(function () {

        let test_data = [0, 0, 0, 0];
        test_data[0] = $('#slider0').slider('value') / 100;
        test_data[1] = $('#slider1').slider('value') / 100;
        test_data[2] = $('#slider2').slider('value') / 100;
        test_data[3] = $('#slider3').slider('value') / 100;

        let ctx = emotion_canvas.getContext('2d');
        ctx.clearRect(0, 0, emotion_canvas.width, emotion_canvas.height);


        let emotional_center = 150;
        let emotional_fullscale = 150;

        //縦軸の描画
        ctx.beginPath();
        ctx.moveTo(150, 50);
        ctx.lineTo(150, 250);
        ctx.stroke();

        //横軸の描画
        ctx.beginPath();
        ctx.moveTo(50, 150);
        ctx.lineTo(250, 150);
        ctx.stroke();

        ctx.globalAlpha = 0.7;

        ctx.strokeStyle = 'rgb(192,80,77)';
        ctx.fillStyle = 'rgb(192,80,77)';

        ctx.beginPath();
        ctx.moveTo(emotional_center, emotional_center - test_data[0] * emotional_fullscale);
        ctx.lineTo(emotional_center + test_data[1] * emotional_fullscale, emotional_center);
        ctx.lineTo(emotional_center, emotional_center + test_data[2] * emotional_fullscale);
        ctx.lineTo(emotional_center - test_data[3] * emotional_fullscale, emotional_center);
        ctx.lineTo(emotional_center, emotional_center - test_data[0] * emotional_fullscale);
        ctx.fill();

    });

}

// function emotion_background_draw(emotion_background) {
//     let ctx = emotion_background.getContext('2d');
//
//     let img = new Image();
//     img.onload = function () {
//         ctx.drawImage(img,0,0,300,300);
//
//     };
//
//     img.src = 'img/emotion/7e52890a.jpg';
//
// }
//
//
