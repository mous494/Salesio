/// <reference path="dist/vis.min.js" />
/// <reference path="http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js" />
/// <reference path="toastr.js" />


// JavaScript source code
// create an array with nodes


//groupオプションでノードの種類を書いた方が良い
var nodes = new vis.DataSet([
    {
        id: 0, label: 'プロット', group: 'root', level: 1, title: 'プロット木の頂点', shape: 'box'
    },
    {id: 2, label: '承', group: 'structure', level: 2, title: '転に向けての準備', shape: 'box'},
    {id: 1, label: '起', group: 'structure', level: 2, title: '物語の始まり', shape: 'box',},
    {id: 3, label: '転', group: 'structure', level: 2, title: '物語の大きな転換点', shape: 'box'},
    {id: 4, label: '結', group: 'structure', level: 2, title: '物語の結末', shape: 'box'},
]);

// create an array with edges

//この形の指定は必ずfrom親to子の形である(というオプションを組んでる)上から順番左から作られる
var edges = new vis.DataSet([
    {id: 1, from: 0, to: 1},
    {id: 2, from: 0, to: 2},
    {id: 3, from: 0, to: 3},
    {id: 4, from: 0, to: 4},
]);
var old_selected = undefined;

// create a plot_network
//noinspection JSDuplicatedDeclaration
var container = document.getElementById('mynetwork');

// データセットの作成
var data = {
    nodes: nodes,
    edges: edges
};
//vis.jsのオプション設定
var default_options = {
    layout: {
        improvedLayout: false,
        hierarchical: {
            enabled: true,
            blockShifting: true,
            edgeMinimization: true,
            parentCentralization: true,
            direction: 'UD',
            sortMethod: 'directed'//or directed
        },
    },
    // interaction: {
    //     navigationButtons: true
    // },
    physics: {
        enabled: true,
        maxVelocity: 20,
        hierarchicalRepulsion: {nodeDistance: 200}


    },
    nodes: {
        shape: 'box',
    },
    edges: {
        arrows: 'middle'
    }


};


// ネットワーク図初期化・表示
var plot_network = new vis.Network(container, data, default_options);
set_interaction();

//TODO:タイムライン関係
//ここからタイムライン関連の処理


//テスト用データ作成
var date = [new Date(),new Date(),new Date(),new Date(),new Date(),new Date()];

for (var i=0;i<6;i++){
    date[i].setDate('0-1-0');
    date[i].setFullYear(i);

}

var timeline_items = new vis.DataSet([
    {id: 1, content: 'item 1', start:date[0],title:'なにか'},
    {id: 2, content: 'item 2', start: date[1]},
    {id: 3, content: 'item 3', start: date[2]},
    {id: 4, content: 'item 4', start: date[3]},
    {id: 5, content: 'item 5', start: date[4]},
    {id: 6, content: 'item 6', start: date[5]}
]);

//タイムラインの設定で使う日付の設定
var def_date=new Date();
def_date.setDate('-200');
def_date.setFullYear(i);
//
var timeline_options={

    zoomMin: 315360000000,
    zoomMax: 31536000000000000,
    showCurrentTime:false,
    clickToUse:true,
    editable:true,
    //min:def_date,
    //start:def_date,
    snap:null
};

var story_container = document.getElementById('mytimeline');
var plot_timeline = new vis.Timeline(story_container,timeline_items,timeline_options);
set_timeline_interaction();


function set_timeline_interaction() {
    plot_timeline.on("select", function (params) {
        var select_id=params.items[0];
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
    plot_network.on("dragEnd", function d_end(params) {

        plot_network.setOptions({
            physics: {enabled: true}

        });
        //console.log('physics on');
    });


    plot_network.on("dragStart", function d_start(params) {
        plot_network.setOptions({
            physics: {enabled: false},
        });
        //console.log('physics off');
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


            var group_option = document.node_operation.group.options;
            for (var i = 0; i < group_option.length; i++) {
                if (group_option[i].value == s_node.group) {
                    group_option[i].selected = true;
                }
            }

            //エッジ作成モードのコーディング
            // var checked = document.node_operation.edge_add.checked;
            // if (checked == true) {
            //     if (old_selected == undefined) {
            //         old_selected = s_nodeid;
            //     }
            //     else {
            //
            //         //実際にエッジが作成出来る場合
            //         data.edges.add({ "from": old_selected, "to": s_nodeid });
            //         old_selected = undefined;
            //     }
            // }
        }

    });

    plot_network.on("deselectNode", function (params) {

        // if (params.nodes.length == 0 && document.node_operation.edge_add.checked == true) {
        //     old_selected = undefined;
        // }
    });

    plot_network.on("doubleClick",function (params) {
        if(params.nodes.length ==0) {
            return;
        }

        var s_nodeid = params.nodes[0];
        var s_node = data.nodes.get(s_nodeid);
        //ルートをダブルクリックしても追加不可
        if(s_node.group == 'root'||s_node.group=='action'){
            toastr.warning('そのノードには追加できません', '無効な操作');
            return;
        }

        if(s_node.group =='structure') {

            s_node.group ='scene';

        }
        var new_id =data.nodes.add(create_network_node_data('','',s_node.group,s_node.context,s_node.level+1));
        data.edges.add({"from": s_nodeid, "to": new_id[0]});
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
        plot_timeline.destroy();
        plot_timeline = new vis.Timeline(story_container,timeline_items,timeline_options);

        set_interaction();
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
        timeline:timeline_data
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

        var orig_group = data.nodes.get(node[0]).group;
        if ((orig_group == 'structure' || orig_group.group == 'root') && (orig_group != add_content.group)) {
            add_content.group = orig_group;
            toastr.warning('頂点または起承転結ノードは属性を変更することはできません');
        }

        add_content.id = node[0];//idにはもとの値を設定

        data.nodes.update(add_content);
        //ここではレベルは弄らない

        //とりあえず再度ネットワークを描画することで対応することにする。単純にやるとlevelを変化させても見た目に変化しない
        plot_network.storePositions();
        //plot_network.setData(data);
        toastr.info('ノードを更新しました');
        //plot_network = new vis.Network(container, data, default_options);
        //set_interaction();

    }

}
//todo:いろいろ考える
//レベル操作関係はここに
function level_up_click() {

    var node = plot_network.getSelectedNodes();
    if (node.length == 1) {
        origin_level = Number(data.nodes.get(node[0]).level);
        if (origin_level > 3) {
            var level = origin_level - 1;

            data.nodes.update({
                "id": node[0],
                "level": Number(level)

            });

            //とりあえず再度ネットワークを描画することで対応することにする。単純にやるとlevelを変化させても見た目に変化しない
            plot_network.storePositions();
            plot_network.setData(data);
            plot_network.fit();
            plot_network.selectNodes(node);

        }
        else
            alert("レベル変更できない属性かレベル範囲外です");
    }


}

function level_down_click() {
    var node = plot_network.getSelectedNodes();
    if (node.length == 1) {
        origin_level = Number(data.nodes.get(node[0]).level);
        if (origin_level > 2) {
            var level = origin_level + 1;

            data.nodes.update({
                "id": node[0],
                "level": Number(level)
            });

            //とりあえず再度ネットワークを描画することで対応することにする。単純にやるとlevelを変化させても見た目に変化しない
            plot_network.storePositions();
            plot_network.setData(data);
            plot_network.fit();
            plot_network.selectNodes(node);

        }
        else
            alert("レベル変更できない属性かレベル範囲外です");
    }
}

//ノード・エッジ削除
function del_click() {

    if(plot_network.getSelectedNodes().length==0){
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


    data.nodes.remove(plot_network.getSelectedNodes());
    data.edges.remove(plot_network.getSelectedEdges());
}

function plot_check() {
    var check_message = "";

}

//ページが読み込まれたときに設定用のフォームは取得しておこう
$(document).ready(function () {
    $original = $('.inner-op:first').clone();
    $op_parent_ogirinal = $('.op_parent:first').clone();
    //設定追加ボタンのコールバックjquery
    $('input[name=op_add]').click(op_add_form);
    $('input[name=op_parent_add]').click(op_parent_form_add);
    $('input[name=option_parent_del]').click(function () {
        $(this).parent().parent().remove();
    });
    $('.story_operation').find('#story_update').click(story_node_update);

    toastr.info('Welcome', 'ようこそ');


});


function story_node_update() {
    var $story_operation = $('.story_operation');

    var node_name =  $story_operation.find('input[name=name]').val();
    var title=  $story_operation.find('textarea[name=content]').val();
    var context=get_context('story');
    var select_item_id = plot_timeline.getSelection()[0];
    if(select_item_id.length!=0){
        var add_item ={
            "id":select_item_id,
            "content":node_name,
            "title":title,
            "context":context
        };

        timeline_items.update(add_item);
    }
}


//フォームから設定を取得してjsonを返す
function get_context(cat) {
    var context = {};
    var parent_name;
    var $tab;
    if (cat=='plot') {
        $tab = $('.node_operation');
    }
    else if (cat=='story') {
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
            var op_content = $(elem).find('input[name=op_content]').val();
            inner_struct[op_name] = op_content;
        });

        var outer_struct = {};
        outer_struct['cat']=parent_category;
        outer_struct['property'] = inner_struct;

        context[parent_name]=outer_struct;

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
    var node_data = {"label": label, "group": group, "title": title, "context": context ,"level":level,shape: 'box'};
    return node_data;

}







//todo:孤立ノードの検索（木ができているかどうか



//todo:ログ取得・読み込み用の関数を書きましょうか。
//ログ関連
function log_add(){
    //ノードとエッジの内容
    //タイムラインの内容



}
