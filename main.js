/// <reference path="dist/vis.min.js" />
/// <reference path="http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js" />
/// <reference path="https://unpkg.com/frappe-charts@1.1.0" />
/// <reference path="toastr.js" />


//デバッグ処理用のフラグ
let DEBUG_FLAG = true;
let LOG = [];

//グローバルの変数宣言セクション

// //感情曲線のデータ。後で適当な所にうつす
// const curve_data_array = [
//     {
//         //ひたすらハッピー
//         labels: ["起", "承", "転", "結"],
//         datasets: [{values: [1, 2, 3, 4]}],
//         yMarkers: [
//             {
//                 label: "Zero-line",
//                 value: 0,
//                 options: {labelPos: 'left'} // default: 'right'
//             }]
//     },
//     {
//         //ひたすらアンハッピー
//         labels: ["起", "承", "転", "結"],
//         datasets: [{values: [-1, -2, -3, -4]}],
//         yMarkers: [
//             {
//                 label: "Zero-line",
//                 value: 0,
//                 options: {labelPos: 'left'} // default: 'right'
//             }]
//     },
//     {
//         //ハッピーアンハッピー
//         labels: ["起", "承", "転", "結"],
//         datasets: [{values: [2, 1, -1, -2]}],
//         yMarkers: [
//             {
//                 label: "Zero-line",
//                 value: 0,
//                 options: {labelPos: 'left'} // default: 'right'
//             }]
//     },
//     {
//         //アンハッピー→ハッピー
//         labels: ["起", "承", "転", "結"],
//         datasets: [{values: [-2, -1, 1, 2]}],
//         yMarkers: [
//             {
//                 label: "Zero-line",
//                 value: 0,
//                 options: {labelPos: 'left'} // default: 'right'
//             }]
//     },
//     {
//         //アンハッピー→ハッピー→アンハッピー
//         labels: ["起", "承", "転", "結"],
//         datasets: [{values: [-2, 2, 2, -2]}],
//         yMarkers: [
//             {
//                 label: "Zero-line",
//                 value: 0,
//                 options: {labelPos: 'left'} // default: 'right'
//             }]
//     },
//     {
//         //ハッピー→アンハッピー→ハッピー
//         labels: ["起", "承", "転", "結"],
//         datasets: [{values: [2, -1, -1, 2]}],
//         yMarkers: [
//             {
//                 label: "Zero-line",
//                 value: 0,
//                 options: {labelPos: 'left'} // default: 'right'
//             }]
//     },
//     {
//         //ジグザグ1
//         labels: ["起", "承", "転", "結"],
//         datasets: [{values: [-1, 1, -1, 1]}],
//         yMarkers: [
//             {
//                 label: "Zero-line",
//                 value: 0,
//                 options: {labelPos: 'left'} // default: 'right'
//             }]
//     },
//     {
//         //ジグザク2
//         labels: ["起", "承", "転", "結"],
//         datasets: [{values: [1, -1, 1, -1]}],
//         yMarkers: [
//             {
//                 label: "Zero-line",
//                 value: 0,
//                 options: {labelPos: 'left'} // default: 'right'
//             }]
//     }
//
// ];

//ここ感情曲線のデータ
const data_of_chart = [[1, 2, 3, 4], [4, 3, 2, 1], [1, 4, 4, 1], [4, 1, 1, 4], [4, 1, 4, 1], [1, 4, 1, 4]];
//[-1, 1, -1, 1], [1, -1, 1, -1]

const emotions = {
    "fear": {
        "th": 2 * Math.PI / 4,
        "r": 2,
        "overt_behavior": "escape",
        "jp_name": "恐れ"
    },
    "trust": {
        "th": Math.PI / 4,
        "r": 2,
        "overt_behavior": "groom",
        "jp_name": "信頼"
    },
    "joy": {
        "th": 0,
        "r": 2,
        "overt_behavior": "Retain or repeat",
        "jp_name": "喜び"
    },
    "anticipation": {
        "th": -Math.PI / 4,
        "r": 2,
        "overt_behavior": "map",
        "jp_name": "期待"
    },
    "anger": {
        "th": -Math.PI / 2,
        "r": 2,
        "overt_behavior": "attack",
        "jp_name": "怒り"
    },
    "disgust": {
        "th": -3 * Math.PI / 4,
        "r": 2,
        "overt_behavior": "vomit",
        "jp_name": "嫌悪"
    },
    "sadness": {
        "th": -Math.PI,
        "r": 2,
        "overt_behavior": "cry",
        "jp_name": "悲しみ"
    },
    "surprise": {
        "th": 3 * Math.PI / 4,
        "r": 2,
        "overt_behavior": "stop",
        "jp_name": "驚き"
    },

    "terror": {
        "th": 2 * Math.PI / 4,
        "r": 1,
        "jp_name": "恐怖"
    },

    "admiration": {
        "th": Math.PI / 4,
        "r": 1,
        "jp_name": "賞賛"
    },
    "ecstasy": {
        "th": 0,
        "r": 1,
        "jp_name": "恍惚"
    },
    "vigilance": {
        "th": -Math.PI / 4,
        "r": 1,
        "jp_name": "警戒"
    },
    "rage": {
        "th": -Math.PI / 2,
        "r": 1,
        "jp_name": "激怒"
    },
    "loathing": {
        "th": -3 * Math.PI / 4,
        "r": 1,
        "jp_name": "強い嫌悪"
    },
    "grief": {
        "th": -Math.PI,
        "r": 1,
        "jp_name": "悲嘆"
    },
    "amazement": {
        "th": 3 * Math.PI / 4,
        "r": 1,
        "jp_name": "驚嘆"
    },

    "apprehension": {
        "th": 2 * Math.PI / 4,
        "r": 3,
        "jp_name": "不安"
    },

    "acceptance": {
        "th": Math.PI / 4,
        "r": 3,
        "jp_name": "容認"
    },
    "serenity": {
        "th": 0,
        "r": 3,
        "jp_name": "平穏"
    },
    "interest": {
        "th": -Math.PI / 4,
        "r": 3,
        "jp_name": "感心"
    },
    "annoyance": {
        "th": -Math.PI / 2,
        "r": 3,
        "jp_name": "苛立ち"
    },
    "boredom": {
        "th": -3 * Math.PI / 4,
        "r": 3,
        "jp_name": "うんざり"
    },
    "pensiveness": {
        "th": -Math.PI,
        "r": 3,
        "jp_name": "哀愁"
    },
    "distraction": {
        "th": 3 * Math.PI / 4,
        "r": 3,
        "jp_name": "放心"
    }

};


const positive_emotions_relations = getCsv("test_rule_count_positive_th5.csv");
const negative_emotions_relations = getCsv("test_rule_count_negative_th5.csv");

console.log(positive_emotions_relations);
console.log(negative_emotions_relations);


const all_emotions = {
    "basics": {
        "joy": {
            "jp_name": "喜び",
            "rank": 8,
            "color": "yellow",
            "angle": 1
        },
        "trust": {
            "jp_name": "信頼",
            "rank": 6,
            "color": "lime",
            "angle": 2
        },
        "fear": {
            "jp_name": "恐れ",
            "rank": 3,
            "color": "green",
            "angle": 3
        },
        "surprise": {
            "jp_name": "驚き",
            "rank": 7,
            "color": "aqua",
            "angle": 4
        },
        "sadness": {
            "jp_name": "悲しみ",
            "rank": 1,
            "color": "blue",
            "angle": 5
        },
        "disgust": {
            "jp_name": "嫌悪",
            "rank": 4,
            "color": "purple",
            "angle": 6
        },
        "anger": {
            "jp_name": "怒り",
            "rank": 2,
            "color": "red",
            "angle": 7
        },
        "anticipation": {
            "jp_name": "期待（予測）",
            "rank": 5,
            "color": "Orange",
            "angle": 8
        }
    },
    "dyads": {
        "optimism": {
            "consist_of": ["anticipation", "joy"],
            "jp_name": "楽観"
        },
        "hope": {
            "consist_of": ["anticipation", "trust"],
            "jp_name": "運命"
        },
        "anxiety": {
            "consist_of": ["anticipation", "fear"],
            "jp_name": "不安"
        },
        "love": {
            "consist_of": ["joy", "trust"],
            "jp_name": "愛"
        },
        "guilt": {
            "consist_of": ["joy", "fear"],
            "jp_name": "罪悪感"
        },
        "delight": {
            "consist_of": ["joy", "surprise"],
            "jp_name": "感動"
        },
        "submission": {
            "consist_of": ["trust", "fear"],
            "jp_name": "服従"
        },
        "curiosity": {
            "consist_of": ["trust", "surprise"],
            "jp_name": "好奇心"
        },
        "sentimentality": {
            "consist_of": ["trust", "sadness"],
            "jp_name": "感傷"
        },
        "awe": {
            "consist_of": ["fear", "surprise"],
            "jp_name": "畏怖"
        },
        "despair": {
            "consist_of": ["fear", "sadness"],
            "jp_name": "絶望"
        },
        "shame": {
            "consist_of": ["fear", "disgust"],
            "jp_name": "恥辱"
        },
        "disapproval": {
            "consist_of": ["surprise", "sadness"],
            "jp_name": "拒絶"
        },
        "unbelief": {
            "consist_of": ["surprise", "disgust"],
            "jp_name": "憤慨"
        },
        "outrage": {
            "consist_of": ["surprise", "anger"],
            "jp_name": "憎悪"
        },
        "remorse": {
            "consist_of": ["sadness", "disgust"],
            "jp_name": "後悔"
        },
        "envy": {
            "consist_of": ["sadness", "anger"],
            "jp_name": "悲憤"
        },
        "pessimism": {
            "consist_of": ["sadness", "anticipation"],
            "jp_name": "悲観"
        },
        "contempt": {
            "consist_of": ["disgust", "anger"],
            "jp_name": "軽蔑"
        },
        "cynicism": {
            "consist_of": ["disgust", "anticipation"],
            "jp_name": "皮肉"
        },
        "morbidness": {
            "consist_of": ["disgust", "joy"],
            "jp_name": "不健全"
        },
        "aggressiveness": {
            "consist_of": ["anger", "anticipation"],
            "jp_name": "攻撃"
        },
        "pride": {
            "consist_of": ["anger", "joy"],
            "jp_name": "自尊心"
        },
        "dominance": {
            "consist_of": ["anger", "trust"],
            "jp_name": "優越"
        }
    }
};


class grobal_emotion {
    constructor() {
        this.reader_curve = 0;
        this.emotions = [];
        this.num_of_character = 1;
    }
}


let chara_emotion_clone;
let emotion_data = new grobal_emotion();

let $original;
let $op_parent_ogirinal;


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


    //TODO:ここから感情外化インターフェースの実験

    // let emotion_canvas = document.getElementsByClassName('emotion_externalization_canvas')[0];
    // context_draw(emotion_canvas);

    //感情語を回してコンボボックスに入れていく
    let keys = Object.keys(all_emotions);
    //感情を回す
    for (let i = 0; i < keys.length; i++) {
        let emo_key = keys[i];

        let emotion_names = Object.keys(all_emotions[emo_key]);
        for (let j = 0; j < emotion_names.length; j++) {
            let name = all_emotions[emo_key][emotion_names[j]].jp_name;
            $('.emotion_selector').append(`<option value="${emotion_names[j]}">${name}</option>`)

        }
    }
    //初期の感情を書いておく
    let canvas = $('.emotion_externalization_canvas');

    for(let a=0;a<canvas.length;a++){
        draw_wheel('none',$(canvas[a]));
    }


//コンボボックス、チェックボックス、コメントを変更したとき、及び診断ボタンのイベントリスナ
    $('.emotion_selector').on('change', emotion_change_event);
    chara_emotion_clone = $('.character_emotion').clone();
    $('.emotion_enable_check').on('change',set_checkbox_change);
    $('.character_emotion_contents').on('change',set_comment_change);
    $('.character_name').on('change',set_charaname_change);
    set_chara_add_button();
    $('#emotion_feedback_gen').on('click',generate_emotion_feedback);

    // set_emotion_save_button();


    //TODO:ここに感情曲線のインターフェイスの実装


    let ctx = document.getElementById('chart_demo').getContext('2d');
    let chartdemo = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ["起", "承", "転", "結"],
            datasets: [
                {
                    label: "感情曲線",
                    borderColor: 'rgb(255, 0, 0)',
                    data: data_of_chart[0],
                },
            ]
        },
        options: {
            responsive: false,
            scales: {
                yAxes: [{
                    display: false,//軸の数字を消しました
                    ticks: {
                        max: 5,
                        min: 0,
                        stepSize: 1
                    }
                }]
            }
        }
    });

    //物語を読者がどう捉えているか→グラフ
    $('#curve_select').change(function () {
        let num = $('#curve_select').find('> option:selected').val();
        chartdemo.data.datasets[0].data = data_of_chart[num - 1];
        emotion_data.reader_curve = num - 1;

        chartdemo.update();
        // generate_emotion_feedback();
        log_add('感情曲線を変更');
    });

    //診断フェーズがバグらないようにするやつ
    save_character_emotion();

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
    let stored_emotional_data = JSON.parse(JSON.stringify(emotion_data))
    var store_data = {
        nodes: n_data,
        edges: e_data,
        timeline: timeline_data,
        comment: comment,
        emotion:stored_emotional_data
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
    let change_count=0;
    for (var a in LOG) {
        text += a + '\t' + LOG[a].comment + '\n';
        if (LOG[a].comment.match(/更新/)) {
            change_count++;
        }
    }
    text += '最終的なプロット全ノード数:' + LOG[LOG.length - 1].nodes.length + '\n全ストーリーノード数:' + LOG[LOG.length - 1].timeline.length + '\nノード更新回数:' + change_count;
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

    let emo_list = Object.assign(all_emotions.basics,all_emotions.dyads);

    let curve = ['上昇型','下降型','上昇下降','下降上昇','下降上昇下降','上昇下降上昇']
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
    let emotion = LOG[step].emotion;
    let emotion_json=JSON.stringify(emotion);
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
    $('#log_emotion').val(emotion_json);


    if(true){
        let visible_string ='感情曲線：';

        visible_string += curve[emotion.reader_curve]+'\n'+'キャラ数：'+emotion.num_of_character+'\n';
        for(let i=0;i<emotion.emotions.length;i++){
            visible_string += '名前：'+emotion.emotions[i].name+'\n';
            visible_string += 'チェックボックス：'+emotion.emotions[i].enables[0]+emotion.emotions[i].enables[1]+emotion.emotions[i].enables[2]+'\n';
            visible_string += '起感情：'+emo_list[emotion.emotions[i].emotion[0]].jp_name+':'+emotion.emotions[i].comments[0]+'\n';
            visible_string += '承感情：'+emo_list[emotion.emotions[i].emotion[1]].jp_name+':'+emotion.emotions[i].comments[1]+'\n';
            visible_string += '転感情：'+emo_list[emotion.emotions[i].emotion[2]].jp_name+':'+emotion.emotions[i].comments[2]+'\n';
            visible_string += '結感情：'+emo_list[emotion.emotions[i].emotion[3]].jp_name+':'+emotion.emotions[i].comments[3]+'\n';
        }
        $('#log_emotion').val(visible_string);
    }

    var text = '/' + (LOG.length - 1);
    $('#step').val(step + '');
    $('#current_operation').text(LOG[step].comment);

    $('#log_step').text(text);

//    謎機能の追加
    plot_network.storePositions();

    let node_list=[];
    node_list.push(data.nodes.get('0'));
    let scenario_text="";

    while(node_list.length>0) {
        let current_node = node_list.pop();

        for(let i=0;i<current_node.level;i++)
            scenario_text+='#'

        scenario_text += ' '+current_node.label + '\n';
        scenario_text += current_node.title + '\n';

        let to_ids =[];

        let edge_datas = data.edges.get({
            filter: function (item) {
                return (item.from == current_node.id)

            }
        });

        for(let i=0;i<edge_datas.length;i++){
            to_ids.push(edge_datas[i].to);
        }


        let children_nodes = data.nodes.get(to_ids);

        if (children_nodes!=null) {
            children_nodes.sort(function (a, b) {
                if (a.x > b.x) return -1;
                if (a.x < b.x) return 1;
                return 0;
            });
        }

        for (let i = 0; i < children_nodes.length; i++) {
            node_list.push(children_nodes[i])
        }
    }

    $('#plot_scenario').val(scenario_text);

}

//
// function emotion_module_setting(emotion_module) {
//     let sliders = emotion_module.find('.slider');
//     let test_data = [0, 0, 0, 0];
//     sliders.slider({
//         min: -3,
//         max: 3,
//         change: function (event, ui) {
//
//             for (let i = 0; i < 4; i++) {
//                 test_data[i] = $(sliders[i]).slider('value') / 3;
//             }
//
//
//             let ctx = emotion_module.find('.emotion_externalization_canvas')[0].getContext('2d');
//             ctx.clearRect(0, 0, 300, 300);
//
//
//             const emotional_center = 150;
//             const emotional_fullscale = 150;//基準点の場所
//             const axis_length = 150;//軸線の長さ
//             const emotional_max = 120;//感情点の長さ
//
//             ctx.lineWidth = 1.0;
//             ctx.strokeStyle = 'rgb(0,0,0)';
//             ctx.fillStyle = 'rgb(0,0,0)';
//
//
//
//
//             for (let i = 0; i < 4; i++) {
//                 if (test_data[i] !== 0) {
//
//                     let emotional_zero_point_X = emotional_center + polar2rectangular(Math.sign(test_data[i]) * emotional_fullscale, Math.PI / 2 + Math.PI * -i / 4)[0];
//                     let emotional_zero_point_Y = emotional_center - polar2rectangular(Math.sign(test_data[i]) * emotional_fullscale, Math.PI / 2 + Math.PI * -i / 4)[1];
//                     //感情基準点の描画
//                     ctx.beginPath();
//                     ctx.circle(emotional_zero_point_X, emotional_zero_point_Y, 5);
//                     ctx.stroke();
//
//
//                     let emotional_point_from_zero_X;
//                     let emotional_point_from_zero_Y;
//
//                     if (Math.sign(test_data[i]) > 0) {
//                         emotional_point_from_zero_X = polar2rectangular(Math.abs(test_data[i]) * emotional_max, -Math.PI / 2 + Math.PI * -i / 4)[0];
//                         emotional_point_from_zero_Y = polar2rectangular(Math.abs(test_data[i]) * emotional_max, -Math.PI / 2 + Math.PI * -i / 4)[1];
//                     }
//                     else if (Math.sign(test_data[i] < 0)) {
//                         emotional_point_from_zero_X = polar2rectangular(Math.abs(test_data[i]) * emotional_max, Math.PI / 2 - Math.PI * i / 4)[0];
//                         emotional_point_from_zero_Y = polar2rectangular(Math.abs(test_data[i]) * emotional_max, Math.PI / 2 - Math.PI * i / 4)[1];
//                     }
//
//                     let point_x = emotional_zero_point_X + emotional_point_from_zero_X;
//                     let point_y = emotional_zero_point_Y - emotional_point_from_zero_Y;
//
//                     ctx.beginPath();
//                     ctx.circle(point_x, point_y, 5);
//                     ctx.stroke()
//                 }
//             }
//
//             //判定用のデータ作成
//             let dup_data = new Array(8);
//             for (let i = 0; i < 4; i++) {
//                 dup_data[i] = test_data[i];
//                 dup_data[i + 4] = test_data[i];
//             }
//
//
//             //filltest
//             let start_number = -1;
//             let canditate_state_number;
//             for (let i = 0; i < 4; i++) {
//                 let change_sign = 0;
//                 for (let j = i; j < i + 3; j++) {
//                     if (Math.sign(dup_data[j]) !== Math.sign(dup_data[j + 1])) {
//                         change_sign++;
//                         canditate_state_number = j + 1;
//                     }
//                 }
//                 if (change_sign === 0) {
//                     start_number = 0;
//                     break;
//                 }
//                 else if (change_sign === 1) {
//                     start_number = canditate_state_number;
//                     break;
//                 }
//                 //例外パターン(no1 no4axis関連）
//                 if ((Math.sign(dup_data[0]) === Math.sign(dup_data[3])) && ((Math.sign(dup_data[0]) !== Math.sign(dup_data[1]))) || (Math.sign(dup_data[0]) !== Math.sign(dup_data[2]))) {
//                     start_number = -1;
//                     break;
//                 }
//
//             }
//
//             //表示用変数
//             let emotion_words = '表現可能な感情：';
//
//             //感情が線表示可能な時
//             if (start_number !== -1) {
//
//                 ctx.beginPath();
//                 for (let i = start_number; i < start_number + 4; i++) {
//
//                     let emotional_zero_point_X = emotional_center + polar2rectangular(Math.sign(dup_data[i]) * emotional_fullscale, Math.PI / 2 + Math.PI * -(i % 4) / 4)[0];
//                     let emotional_zero_point_Y = emotional_center - polar2rectangular(Math.sign(dup_data[i]) * emotional_fullscale, Math.PI / 2 + Math.PI * -(i % 4) / 4)[1];
//
//                     let emotional_point_from_zero_X;
//                     let emotional_point_from_zero_Y;
//
//                     if (Math.sign(dup_data[i]) > 0) {
//                         emotional_point_from_zero_X = polar2rectangular(Math.abs(dup_data[i]) * emotional_max, -Math.PI / 2 + Math.PI * -(i % 4) / 4)[0];
//                         emotional_point_from_zero_Y = polar2rectangular(Math.abs(dup_data[i]) * emotional_max, -Math.PI / 2 + Math.PI * -(i % 4) / 4)[1];
//                     }
//                     else if (Math.sign(dup_data[i] < 0)) {
//                         emotional_point_from_zero_X = polar2rectangular(Math.abs(dup_data[i]) * emotional_max, Math.PI / 2 - Math.PI * (i % 4) / 4)[0];
//                         emotional_point_from_zero_Y = polar2rectangular(Math.abs(dup_data[i]) * emotional_max, Math.PI / 2 - Math.PI * (i % 4) / 4)[1];
//                     }
//
//                     let point_x = emotional_zero_point_X + emotional_point_from_zero_X;
//                     let point_y = emotional_zero_point_Y - emotional_point_from_zero_Y;
//
//
//                     if (i === start_number)
//                         ctx.moveTo(point_x, point_y);
//                     else
//                         ctx.lineTo(point_x, point_y);
//
//                 }
//
//                 ctx.lineWidth = 3.0;
//                 ctx.strokeStyle = 'rgba(192, 80, 77, 0.7)';
//                 ctx.stroke();
//
//
//                 //外化可能な感情の抽出
//                 const keys = Object.keys(emotions);
//
//                 //感情を回す
//                 for (let i = 0; i < keys.length; i++) {
//                     let emotion_name = keys[i];
//                     let r = emotions[keys[i]].r * emotional_max / 3;
//                     let th = emotions[keys[i]].th;
//
//                     const coodinate = polar2rectangular(r, th);
//                     let sum_emotion = 0;
//                     for (let j = 0; j < 4; j++) {
//                         if (Math.abs(test_data[j]) === (4 - emotions[keys[i]].r) / 3) {
//                             //値の絶対値で偏角が違う
//                             if (test_data[j] >= 0) {
//                                 // 大きさが一致している
//                                 if (emotions[keys[i]].th === j * Math.PI / 4) {
//                                     //plusの時、偏角が一致している
//                                     emotion_words += emotion_name + '（' + emotions[keys[i]].jp_name + '）';
//                                     console.log(emotion_name);
//                                 }
//                             }
//                             else {
//                                 //マイナス側
//                                 if (emotions[keys[i]].th === j * Math.PI / 4 - Math.PI) {
//                                     //plusの時、偏角が一致している
//                                     emotion_words += emotion_name + '（' + emotions[keys[i]].jp_name + '）';
//                                     console.log(emotion_name);
//
//                                 }
//                             }
//                         }
//                         sum_emotion += test_data[j];
//
//                     }
//                     if (sum_emotion >= 4)
//                         emotion_words = "実現可能な感情：conflict（葛藤）"
//
//                 }
//             }
//             else {
//                 emotion_words = '実現が難しい感情状態です';
//
//             }
//
//             //感情ワードの表示
//             let emotion_text_area = $(ui.handle).parents('.slider_wrapper').find('.emotion_word');
//             emotion_text_area.empty();
//             emotion_text_area.append(emotion_words);
//         }
//     });
//
//
//     let canvas = emotion_module.find('.emotion_externalization_canvas')[0];
//
//     canvas.addEventListener('click', function (e) {
//         const rect = e.target.getBoundingClientRect();
//         const x = e.clientX - rect.left;
//         const y = e.clientY - rect.top;
//
//         const max_emo = 110;
//
//         const keys = Object.keys(emotions);
//         for (let i = 0; i < keys.length; i++) {
//             let emotion_name = keys[i];
//             let r = emotions[keys[i]].r * max_emo / 3;
//             let th = emotions[keys[i]].th;
//
//             const coodinate = polar2rectangular(r, th);
//
//             // console.log(x);
//             // console.log(y);
//             // console.log(coodinate);
//
//             if ((Math.pow((x - (coodinate[0] + 150)), 2) + Math.pow((y - (-coodinate[1] + 150)), 2)) < 250) {
//                 console.log(emotion_name);
//             }
//         }
//
//
//     }, false);
//
//
// }


/**
 * 極座標を直交座標に変換
 * @param r
 * @param th
 * @returns {number[]}
 */
function polar2rectangular(r, th) {
    let coodinate = [0.0, 0.0];
    coodinate[0] = r * Math.cos(th);
    coodinate[1] = r * Math.sin(th);

    return coodinate;
}

/**
 * 直交座標を極座標に変換
 * @param x
 * @param y
 * @returns {number[]}
 */
function rectangular2polar(x, y) {
    let polar = [0.0, 0.0];

    polar[0] = Math.sqrt(x * x + y * y);
    polar[1] = y / x;

    return polar;
}


function emotion_change_event() {
    let consist_of;
    let val = $(this).val();
    let $emotion_words_area = $(this).siblings('.emotion_word');
    let $emotion_canvas = $(this).parent().siblings('.emotion_canvases').children('.emotion_externalization_canvas');
    let emotion_text = '';
    let mathed = false;

    draw_wheel(val, $emotion_canvas);

    //基本感情の時
    let keys = Object.keys(all_emotions.basics);
    for (let i = 0; i < keys.length; i++) {
        if (val === keys[i]) {
            emotion_text += all_emotions.basics[keys[i]].jp_name + "だけ";
            mathed = true;
            break;
        }
    }
    //複合感情の時
    if (!mathed) {
        keys = Object.keys(all_emotions.dyads);
        for (let i = 0; i < keys.length; i++) {
            if (val === keys[i]) {
                consist_of = all_emotions.dyads[val].consist_of;

                for (let i = 0; i < consist_of.length; i++) {
                    emotion_text += all_emotions.basics[consist_of[i]].jp_name + '　';

                }
                break;
            }
        }
    }
    emotion_text += "の感情で表現出来ますよ";
    $emotion_words_area.empty();
    $emotion_words_area.append(emotion_text);

    save_character_emotion();
    // generate_emotion_feedback();

    //ここからログ関係の処理
    let chara_name = $(this).parents('.character_emotion').find('.character_name').val();
    log_add(chara_name+'の感情を変更しました');

}


/**
 * キャラクタ追加ボタンの挙動をとるリスナ
 */
function set_chara_add_button() {
    $('#add_character').click(function () {
        let target_comp = chara_emotion_clone.clone().appendTo($('.character_emotion_section'));

        let canvas = target_comp.find('.emotion_externalization_canvas');

        for(let a=0;a<canvas.length;a++){
            draw_wheel('none',$(canvas[a]));
        }

        $('.emotion_selector').off('change');
        $('.emotion_selector').on('change',emotion_change_event);
        $('.emotion_enable_check').off('change');
        $('.emotion_enable_check').on('change',set_checkbox_change);
        $('.delete_chara').off('click');
        $('.delete_chara').on('click',set_chara_remove_button);
        $('.character_emotion_contents').off('change');
        $('.character_emotion_contents').on('change',set_comment_change);
        $('.character_name').off('change');
        $('.character_name').on('change',set_charaname_change);

        emotion_data.num_of_character++;
        log_add('キャラクター追加');
    });
}

function set_chara_remove_button() {
    let a = $(this).parents('.character_emotion');
    let name = $(this).siblings('.character_name').val();
    a.remove();

    emotion_data.num_of_character--;
    log_add(name+'を削除しました');

}

function set_checkbox_change() {
    save_character_emotion();
    // generate_emotion_feedback();

    //ここからログ関連の処理
    let chara_name = $(this).parents('.character_emotion').find('.character_name').val();
    log_add(chara_name+'の注目チェックボックスを変更しました');
}

function set_comment_change() {
    save_character_emotion();

    let chara_name = $(this).parents('.character_emotion').find('.character_name').val();
    log_add(chara_name+'のコメントを変更しました');
}

function set_charaname_change() {
    save_character_emotion();

    let chara_name = $(this).val();
    log_add(chara_name+'へキャラ名を変更しました');
}


// /**
//  * 感情保存ボタンの挙動（後で然るべきUIでファイル保存に実装する必要あり）
//  */
// function set_emotion_save_button() {
//     // language=JQuery-CSS
//     $("#emotion_save").click(function () {
//         let module = $('.emotion_externalization_module');
//         for (let i = 0; i < module.length; i++) {
//             let sliders;
//             sliders = $(module[i]).find('.slider');
//             for (let j = 0; j < sliders.length; j++) {
//                 console.log($(sliders[j]).slider('value'));
//             }
//         }
//     });
// }


function generate_emotion_feedback() {
    let emotional_curve = data_of_chart[emotion_data.reader_curve];
    let emotional_up_down = [];//感情曲線の増減を持ってる変数
    let have_problem=false;

    $('#emotion_result').empty();

    for (let i = 0; i < 3; i++) {
        if (emotional_curve[i] === emotional_curve[i + 1])
            emotional_up_down[i] = "nan";
        else if (emotional_curve[i] > emotional_curve[i + 1])
            emotional_up_down[i] = "down";
        else if (emotional_curve[i] < emotional_curve[i + 1])
            emotional_up_down[i] = "up";
    }


    for (let i = 0; i < emotion_data.num_of_character; i++) {
        for (let j = 0; j < 3; j++) {
            if (!emotion_data.emotions[i].enables[j])
                continue;

            let before = emotion_data.emotions[i].emotion[j];
            let after = emotion_data.emotions[i].emotion[j + 1];
            let grad = 'nan';
            let before_jp;
            let after_jp;
            let before_group = "negative";
            let after_group = "negative";


            let matched_basic = false;
            //before側の日本語名を取ってくる
            matched_basic = all_emotions.basics.hasOwnProperty(before);
            if (matched_basic)
                before_jp = all_emotions.basics[before].jp_name;
            else
                before_jp = all_emotions.dyads[before].jp_name;


            //after側の日本語名を取ってくる
            matched_basic = all_emotions.basics.hasOwnProperty(after);
            if (matched_basic)
                after_jp = all_emotions.basics[after].jp_name;
            else
                after_jp = all_emotions.dyads[after].jp_name;

            for (let i in positive_emotions_relations) {
                if (positive_emotions_relations[i][0] === before_jp)
                    before_group = "positive";
                if (positive_emotions_relations[i][0] === after_jp)
                    after_group = "positive";
            }


            //そもそも見るべき表が違う場合（二分割のグループが違う）
            if (before_group !== after_group) {

                if (before_group == 'positive')
                    grad = 'down';
                else
                    grad = 'up';
            }
            //同一グループ内での判定
            else {
                //ポジティブグループの時
                if (before_group == 'positive') {
                    for (let k = 0; k < positive_emotions_relations.length; k++) {
                        if (positive_emotions_relations[k][0] === before_jp) {
                            for (let l = 0; l < positive_emotions_relations.length; l++) {
                                if (positive_emotions_relations[0][l] === after_jp) {
                                    if (positive_emotions_relations[k][l] === 1) {
                                        grad = 'down';
                                    }
                                }
                            }
                        }
                    }
                    for (let k = 0; k < positive_emotions_relations.length; k++) {
                        if (positive_emotions_relations[0][k] === before_jp) {
                            for (let l = 0; l < positive_emotions_relations.length; l++) {
                                if (positive_emotions_relations[l][0] === after_jp) {
                                    if (positive_emotions_relations[l][k] === 1) {
                                        grad = 'up';
                                    }
                                }
                            }
                        }
                    }
                }
                //ネガティブグループの時
                else {
                    for (let k = 0; k < negative_emotions_relations.length; k++) {
                        if (negative_emotions_relations[k][0] === before_jp) {
                            for (let l = 0; l < negative_emotions_relations.length; l++) {
                                if (negative_emotions_relations[0][l] === after_jp) {
                                    if (negative_emotions_relations[k][l] === 1) {
                                        grad = 'up';
                                    }
                                }
                            }
                        }
                    }
                    for (let k = 0; k < negative_emotions_relations.length; k++) {
                        if (negative_emotions_relations[0][k] === before_jp) {
                            for (let l = 0; l < negative_emotions_relations.length; l++) {
                                if (negative_emotions_relations[l][k] === after_jp) {
                                    if (negative_emotions_relations[l][k] === 1) {
                                        grad = 'down';
                                    }
                                }
                            }
                        }
                    }
                }

            }

            const phase = ['起承における', '承転における', '転結における'];
            // 結果表示
            if (emotional_up_down[j] === 'up' && grad === 'down') {
                $('#emotion_result').append(phase[j] + emotion_data.emotions[i].name + 'の感情が曲線と一致しません<br />');
                have_problem=true;
            }
            //console.log(phase[j]+emotion_data.emotions[i].name+'の感情が曲線と一致しません');
            else if (emotional_up_down[j] === 'down' && grad === 'up') {
                $('#emotion_result').append(phase[j] + emotion_data.emotions[i].name + 'の感情が曲線と一致しません<br />');
                have_problem=true;
            }
            //  console.log(phase[j]+emotion_data.emotions[i].name+'の感情が曲線と一致しません');
            else
                console.log('nan');
        }

    }

    if(have_problem)
        toastr.warning('診断結果をチェックしてみましょう');
    else
        toastr.info('感情曲線と感情に相違は見つかりませんでした');

    log_add('感情診断ボタンをクリック');
}

function grad_emotion_value(before, after) {
    if (before === after)
        return 'nan';
    else if (before < after)
        return 'up';
    else
        return 'down';
}


function save_character_emotion() {
    let $chara_name = $('.character_name');
    let $chara_emo = $('.emotion_selector');
    let $chara_emo_enables = $('.emotion_enable_check');
    let $comment = $('.character_emotion_contents');
    emotion_data.emotions = [];


    for (let i = 0; i < emotion_data.num_of_character; i++) {
        let emotion = [];
        let enables = [];
        let comments=[];

        for (let j = 0; j < 4; j++) {
            emotion.push($chara_emo[i * 4 + j].value);
            comments.push($comment[i * 4 + j].value)
        }
        for (let j = 0; j < 3; j++) {
            enables.push($chara_emo_enables[i * 3 + j].checked);
        }


        let temp = {
            "ID": i,
            "name": $chara_name[i].value,
            "emotion": emotion,
            "enables": enables,
            "comments":comments
        };
        emotion_data.emotions.push(temp);
    }
    // console.log(emotion_data);
}

function getCsv(url) {
    //CSVファイルを文字列で取得。
    var txt = new XMLHttpRequest();
    txt.open('get', url, false);
    txt.send();

    //改行ごとに配列化
    var arr = txt.responseText.split('\n');

    //1次元配列を2次元配列に変換
    var res = [];
    for (var i = 0; i < arr.length; i++) {
        //空白行が出てきた時点で終了
        if (arr[i] == '') break;

        //","ごとに配列化
        res[i] = arr[i].split(',');

        for (var i2 = 0; i2 < res[i].length; i2++) {
            //数字の場合は「"」を削除
            if (res[i][i2].match(/\-?\d+(.\d+)?(e[\+\-]d+)?/)) {
                res[i][i2] = parseFloat(res[i][i2].replace('"', ''));
            }
        }
    }

    return res;
}

function draw_wheel(emotion, canvas) {
    canvas.removeClass('background-image');
    let consist_of=['',''];
    let mathed = false;
    if(emotion!='none') {
        let keys = Object.keys(all_emotions.basics);
        for (let i = 0; i < keys.length; i++) {
            if (emotion === keys[i]) {
                mathed = true;
                break;
            }
        }
        //複合感情の時
        if (!mathed) {
            keys = Object.keys(all_emotions.dyads);
            for (let i = 0; i < keys.length; i++) {
                if (emotion === keys[i]) {
                    consist_of = all_emotions.dyads[emotion].consist_of;
                    break;
                }
            }
        }
    }

    let ctx = canvas[0].getContext('2d');
    ctx.clearRect(0, 0, 300, 300);

    //該当する感情以外を透明化する処理
    for (let name in all_emotions.basics) {
        if (all_emotions.basics.hasOwnProperty(name)) {
            if (mathed && name === emotion)
                ctx.globalAlpha = 1.0;
            else if (!mathed && (consist_of[0] === name || consist_of[1] === name))
                ctx.globalAlpha = 1.0;
            else
                ctx.globalAlpha = 0.3;
            //サークルを描く
            ctx.fillStyle = all_emotions.basics[name].color;
            ctx.beginPath();
            ctx.arc(150, 150, 150, -Math.PI / 8 + Math.PI * (all_emotions.basics[name].angle - 1) / 4 - Math.PI / 2, Math.PI / 8 + Math.PI * (all_emotions.basics[name].angle - 1) / 4 - Math.PI / 2, false);
            ctx.arc(150, 150, 50, Math.PI / 8 + Math.PI * (all_emotions.basics[name].angle - 1) / 4 - Math.PI / 2, -Math.PI / 8 + Math.PI * (all_emotions.basics[name].angle - 1) / 4 - Math.PI / 2, true);
            ctx.closePath();
            ctx.fill();
            //サークル上のテキストの描画
            let text_position = polar2rectangular(100, Math.PI * (all_emotions.basics[name].angle - 1) / 4 - Math.PI / 2);
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.font = "bold 16px sans-serif";
            ctx.fillText(all_emotions.basics[name].jp_name, text_position[0] + 150, text_position[1] + 150);
        }
    }
}