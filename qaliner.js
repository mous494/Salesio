let DEBUG_FLAG;
DEBUG_FLAG = true;
//QA一つのクラスの定義。一応定義してみたけどあんまり使わないかも。

let qa_Network;
let initial_idea = '';

let node_cat = {
    initial_idea: 1,
    initial_answer: 2,
    when: 3,
    where: 4,
    who: 5,
    how: 6,
    what: 7,
    why: 8,
    then_what: 9,
    not: 10,
    element: 11

};

let node_label = {
    [node_cat.initial_idea]: "initial idea",
    [node_cat.initial_answer]: "initial answer",
    [node_cat.when]: "When?",
    [node_cat.where]: "Where?",
    [node_cat.who]: "Who?",
    [node_cat.how]: "How?",
    [node_cat.what]: "What?",
    [node_cat.why]: "Why?",
    [node_cat.then_what]: "Then what?",
    [node_cat.not]:"if not?"
};

//モーダルダイアログに渡す用の変数（このやり方しか思い付かなかった。悔しい）
let edge_link_params = {
    from: undefined,
    to: undefined
};


//最初のデータバインド
let QA_data = {
    nodes: new vis.DataSet([]),
    edges: new vis.DataSet([])
};


//ログデータ用クラス

class log_data{
    //コンストラクタ
    constructor(initial_idea) {

        this.initial_idea = initial_idea;
        this.log=[];
    }

    add_log(nodes, edges,comment) {
        this.log.push({nodes:nodes,edges:edges,comment:comment,time:log_data.getCurrentTime()});
    }

    export_log(){
        return({
            initial_idea:initial_idea,
            log:this.log
        })

    }


    static padZero(num) {
        let result;
        if (num < 10) {
            result = "0" + num;
        } else {
            result = "" + num;
        }
        return result;
    }

    static getCurrentTime() {
        let now = new Date();
        return `${now.getFullYear()}/${log_data.padZero(now.getMonth() + 1)}/${log_data.padZero(now.getDate())} ${log_data.padZero(now.getHours())}:${log_data.padZero(now.getMinutes())}:${log_data.padZero(now.getSeconds())}`;
    }



}


function node_position_calc(x, y) {
    let r = 200;//ノード間の距離になるやつ
    let th = Math.random() * (2*Math.PI);//これで360までの乱数がでる？

  //  console.log(x);

    x=x+r * Math.cos(th);
    y=y+r * Math.sin(th);

    return {
        x,
        y
    };
}


let log;


$(document).ready(function () {
    //ページ読み込みの際の処理
    let qa_line = document.getElementById('QAline_network');


//ようこそ画面のボタンの設定など
    //新規作成画面
    $('#new-create').click(function () {
            $('#initial-menu')[0].style.display = 'none';
            $('#initial-idea-input')[0].style.display = 'block';
        }
    );

    //初期アイデアの決定と初期アンサーとそれのマップ表示
    $("#initial-decided").click(function () {
        initial_idea = $("#initial-idea").val();
        $('#initial-idea-input')[0].style.display = 'none';
        $('#modal-background')[0].style.display = 'none';
        $('#initial-idea-display')[0].innerHTML = 'To tell that ' + initial_idea;

       QA_data.nodes.add([

            {
                group: node_cat.initial_answer,
                label: 'Know that '+initial_idea
            }
        ]);
       log = new log_data(initial_idea);
       log.add_log(QA_data.nodes.get(),QA_data.edges.get(),'新規作成されました');

    });

    //読み込むときの動作の話
    $('#load-file').click(function () {
        $('#initial-menu')[0].style.display = 'none';
        $('#qa-load-file-dialog')[0].style.display = 'block';

    });
    $('#qa-load-button').click(function () {

        let qa_file = $('#qa-load-file')[0].files[0];
        let qa_reader = new FileReader();

        qa_reader.readAsText(qa_file);

        qa_reader.onload = function () {
            let qa_load_data = JSON.parse(qa_reader.result);

            initial_idea = qa_load_data.initial;

            QA_data.nodes = new vis.DataSet(qa_load_data.nodes);
            QA_data.edges = new vis.DataSet(qa_load_data.edges);


            qa_Network.destroy();
            qa_Network = new vis.Network(qa_line, QA_data, QA_network_setting);

            $('#initial-idea-display')[0].innerHTML = 'To tell that ' + initial_idea ;
            $('#qa-load-file-dialog')[0].style.display = 'none';
            $('#modal-background')[0].style.display = 'none';


        }

    });



    //保存ボタンの動作
    $('#qa-store-data-create-button').click(function () {
        qa_Network.storePositions();
        let qa_store_data = {
            initial: initial_idea,
            nodes: QA_data.nodes.get(),
            edges: QA_data.edges.get()
        };
        let json_text = JSON.stringify(qa_store_data, undefined, 4);
        let blob = new Blob([json_text], {"type": "text/plain"});
        window.URL = window.URL || window.webkitURL;
        $('#qa-download').attr("href", window.URL.createObjectURL(blob));
    });

		$('#log-data-create-button').click(function (){
			const json_text = JSON.stringify(log.export_log());
			const blob =new Blob([json_text],{"type":"text/plain"});
			window.URL = window.URL || window.webkitURL;
			$('#log-download').attr("href",window.URL.createObjectURL(blob));
		});
		

    $('#suggest_qa').click(function () {
        suggest_question();
    });

    //アイデアノードの数を調べる
    $('#idea_node_count').click(function () {
        let count_data = QA_data.nodes.get();
        let count_ary = new Array(11);
        let idea_count = 0

        for(let i=0;i<count_ary.length;i++){
         count_ary[i]=0;
        }
        for(let i=0;i<count_data.length;i++){
            // if(count_data[i].group===node_cat.element)
            // idea_count++;
            count_ary[count_data[i].group-1]++;

        }

       for(let i=0;i<count_ary.length;i++){
            console.log(node_label[i+1]+'の数は'+count_ary[i]);
       }

        //
        //
        // console.log('アイデアノード数は'+idea_count);

    });



    //中身の話
    qa_Network = new vis.Network(qa_line, QA_data, QA_network_setting);
    //ダブルクリックで拡張用のコンテキストメニューを出すようにする
    //qa_Network.on('doubleClick', node_expand_menu);
    expand_menu_bind();


    //下のネットワークの操作
    // let collection_network = new vis.Network(collection_line, collection_data, Collection_network_setting);

    window.onmousemove = handleMouseMove;


});

// main的なところ
// let collection_data = {
//     nodes: new vis.DataSet([]),
//     edges: new vis.DataSet([])
// };

let QA_network_setting = {
    manipulation: {
        enabled: true,
        addNode: function (data, callback) {

            qa_Network.storePositions();

            // filling in the popup DOM elements
            let selected_nodeids = qa_Network.getSelectedNodes();
            if (selected_nodeids.length === 0) {
                toastr.info('Please select a source node.(元となるノードを選んで下さい)');
                return;
            }
            let selected_nodes = QA_data.nodes.get(selected_nodeids);
            if (selected_nodes[0].group !== node_cat.element) {
                if (selected_nodes[0].group !== node_cat.initial_answer) {
                    toastr.info("The selected node cannot be added.(そのノードには直接追加できません)");
                    return;
                }
            }


            document.getElementById('node-operation').innerHTML = "Add Node";


            editNode(data, callback);
        },
        editNode: function (data, callback) {
            // filling in the popup DOM elements
            document.getElementById('node-operation').innerHTML = "Edit Node";
            //TODO コンテンツノード以外を編集出来ないようにする
            if (data.group!==node_cat.element){

                callback(null);
                return;
            }

            editNode(data, callback);
        },

        addEdge: function (edgeData, callback) {
            qa_edge_add(edgeData, callback);

        },
        deleteNode:function (data, callback) {
            let initial_node = QA_data.nodes.get({
                filter: function (item) {
                    return (item.group === node_cat.initial_answer);
                }
            });

            let initial_flag=-1;
            for(let i=0;i<data.nodes.length;i++){
                if(initial_node[0].id===data.nodes[i]){
                    initial_flag=i;
                    break;
                }
            }
            if(initial_flag!==-1){
                data.nodes.splice(initial_flag,1);
            }

            callback(data);
        },


        deleteEdge:false,
        editEdge:false,



        controlNodeStyle: {
            shape: 'dot',
        }

    },
    interaction: {
        navigationButtons: true,
        keyboard: true
    },

    edges: {
        color: 'darkblue',
        smooth: false,
        arrows: 'to'
    },

    physics: {
        enabled: false
        // barnesHut: {
        //     springConstant: 0.05,
        //     springLength: 10,
        //     gravitationalConstant: -2000,
        //     avoidOverlap: 1
        // }

    }

};


//QAネットワークのイベントハンドラの設定


// let Collection_network_setting = {
//     manipulation: {
//         enabled: true,
//         controlNodeStyle: {
//             shape: 'dot',
//         }
//
//     },
//     interaction: {
//         navigationButtons: true,
//         keyboard: true
//     },
//
//     edges: {
//
//         arrows: 'to'
//     },
//     physics: {
//
//         barnesHut: {
//             springConstant: 0.01,
//             springLength: 3000,
//             gravitationalConstant: -1000,
//             avoidOverlap: 1
//         }
//
//
//     }
// };


//関数定義的な
/**
 * 既存ノードを編集するときのコールバック的な奴
 * @param data
 * @param callback
 */
function editNode(data, callback) {

    window.onmousemove = null;
    delete data.color;
    delete data.font;
    delete data.shadow;

    if (data.name === undefined)
        data.name = '';

    document.getElementById('node-label').value = data.name;
    document.getElementById('node-saveButton').onclick = saveNodeData.bind(this, data, callback);
    document.getElementById('node-cancelButton').onclick = clearNodePopUp.bind(this, callback);
    document.getElementById('node-popUp').style.display = 'block';
}


/**
 * 実際のノードの保存をやってる
 * @param data 追加・変更されるノードのデータ
 * @param callback 実際にノードを追加するコールバック
 */
function saveNodeData(data, callback) {

    data.name = document.getElementById('node-label').value;
    // data.group = document.getElementById('node_type').value;
    // data.category = node_cat[document.getElementById('node-category').value];
    data.group = node_cat.element;

    data.label = data.name;

    //let edge_remove_flag = false;

    let question_cat_flag = undefined;

    //同じカテゴリの質問があるかどうかの判定
    let selected_nodeids = qa_Network.getSelectedNodes();
    let selected_nodes = QA_data.nodes.get(selected_nodeids);



    let node_pos = node_position_calc(selected_nodes[0].x,selected_nodes[0].y);
    data.x = node_pos.x;
    data.y = node_pos.y;

    callback(data);

    let connected_edge = QA_data.edges.get({
        filter: function (item) {
            return (item.from === selected_nodes[0].id);
        }
    });

    for (let i = 0; i < connected_edge.length; i++) {
        let child = QA_data.nodes.get(connected_edge[i].to);
        if (child.group === node_cat[document.getElementById('node-category').value]) {
            question_cat_flag = child.id;
            break;
        }
    }

    if (question_cat_flag === undefined) {
        let pos = node_position_calc(selected_nodes[0].x,selected_nodes[0].y);
        let newnodeid = QA_data.nodes.add({
                label: node_label[node_cat[document.getElementById('node-category').value]],
                group: node_cat[document.getElementById('node-category').value],
            x:pos.x,
            y:pos.y
        }
        );
        QA_data.edges.add([{from: selected_nodeids[0], to: newnodeid[0]}, {from: newnodeid[0], to: data.id}]);

    }
    else {
        QA_data.edges.add({from: question_cat_flag, to: data.id});

    }


    // //接続してるQAのエッジを検出
    // let connected_edges = QA_data.edges.get({
    //     filter: function (item) {
    //         return ((item.from === data.id || item.to === data.id) && item.type === 'QA');
    //     }
    // });
    //
    // // QAカテゴリ・タイプ変えたときにQAエッジが繋がってれば削除
    // if (connected_edges.length > 0)
    //
    //     if (data.category !== QA_data.nodes.get(data.id).category || data.group !== QA_data.nodes.get(data.id).group) {
    //         edge_remove_flag = true;
    //     }


    log.add_log(QA_data.nodes.get(),QA_data.edges.get(),'ノードを追加・変更しました');
    clearNodePopUp(null);


    //コールバック呼ぶ前にエッジ削除するとどうにもグループの変更が上手くいかないので回避のためにあとから読んでます。
    // if (edge_remove_flag) {
    //     toastr.info('カテゴリ・タイプがマッチしないエッジを削除しました');
    //     QA_data.edges.remove(connected_edges);
    // }
}

/**
 * ノード編集のポップアップを消すやつ
 * @param func
 */
function clearNodePopUp(func) {
    document.getElementById('node-saveButton').onclick = null;
    document.getElementById('node-cancelButton').onclick = null;
    document.getElementById('node-popUp').style.display = 'none';
    window.onmousemove = handleMouseMove;
    if (func != null)
        func();

}

/**
 * エッジを新しく張るときに呼ばれるコールバック的な
 * @param data
 * @param callback
 */
function qa_edge_add(data, callback) {

    //ここにエッジの話について書く

    //fromとtoを見る（アイデア同士orQとアイデア）
    let from_node = QA_data.nodes.get(data.from);
    let to_node = QA_data.nodes.get(data.to);

    if (!(to_node.group === node_cat.element || to_node.group === node_cat.initial_answer)) {
        toastr.info('ここは無理です');
        return;
    }
    //ignore when id's are same
    if (data.from === data.to) {
        alert('自分自身にリンクを貼ることはできません');
        return;
    }
    //if already exist same link then ignore link create.
    if (same_link_chack(QA_data.edges, data.from, data.to)) {
        return;
    }




    if (from_node.group === node_cat.initial_answer || from_node.group === node_cat.element) {
        //関係を選択するボックスを表示する
        window.onmousemove = null;

        edge_link_params.from = data.from;
        edge_link_params.to = data.to;
        document.getElementById('edge-popup').style.display = 'block';
        $('#modal-background')[0].style.display = 'block';

        $('#edge-saveButton').one('click', function () {
            document.getElementById('edge-popup').style.display = 'none';
            $('#modal-background')[0].style.display = 'none';


            // let from_node = QA_data.nodes.get(edge_link_params.from);
            // let to_node = QA_data.nodes.get(edge_link_params.to);

            let node_cate = node_cat[document.getElementById('edge-category').value];

            let question_edges = QA_data.edges.get({
                filter: function (item) {
                    return (item.from === edge_link_params.from)
                }
            });

            if (question_edges.length !== 0) {
                let question_nodeids = [];
                for (let i = 0; i < question_edges.length; i++) {
                    question_nodeids.push(question_edges[i].to);
                }
                let question_nodes = QA_data.nodes.get(question_nodeids);

                for (let i = 0; i < question_nodes.length; i++) {
                    if (question_nodes[i].group === node_cate) {
                        QA_data.edges.add([{
                            from: edge_link_params.from,
                            to: question_nodes[i].id

                        },
                            {
                                from: question_nodes[i].id,
                                to: edge_link_params.to

                            }]);
                        return;
                    }
                }
            }

            let newnodeid = QA_data.nodes.add({
                    label: node_label[node_cate],
                    group: node_cate
                }
            );
            QA_data.edges.add([
                {
                from: edge_link_params.from,
                to: newnodeid[0]},
                {
                from: newnodeid[0],
                to: edge_link_params.to
            }]);

            log.add_log(QA_data.nodes.get(), QA_data.edges.get(), 'エッジが追加されました');


        });


    }






}

//qanetworkのコンテキストメニューだすやつ
// function node_expand_menu(params) {
//     window.onmousemove = null;
//     $('#node-expand-menu')[0].style.display = 'block';
//
//
//     //裏を作るボタン
//     $('#expand-back').one('click', function () {
//         let origin_id = qa_Network.getSelectedNodes()[0];
//         let original_node = QA_data.nodes.get(origin_id);
//
//         let new_node_id = QA_data.nodes.add({
//             "group": "Question",
//             "label": "Question\n" + 'NOT ' + original_node.name
//         });
//
//
//         QA_data.edges.add({"from": origin_id, "to": new_node_id[0], label: "裏"});
//         $('#node-expand-menu')[0].style.display = 'none';
//         window.onmousemove = handleMouseMove;
//     });
//
//     //最後に戻す
//
// }

//コンテキストメニューの中身の設定
function expand_menu_bind() {
    $('#expand_cancel').click(function () {
        $('#node-expand-menu')[0].style.display = 'none';
        window.onmousemove = handleMouseMove;
    });
}


/**
 * マウスの座標を取得してる
 * @param event
 */
function handleMouseMove(event) {
    event = event || window.event; // IE対応
    document.getElementById('node-popUp').style.top = event.clientY + 'px';
    document.getElementById('node-popUp').style.left = '' + event.clientX + 'px';
    document.getElementById('node-expand-menu').style.top = event.clientY + 'px';
    document.getElementById('node-expand-menu').style.left = '' + event.clientX + 'px';
    document.getElementById('edge-popup').style.top = event.clientY + 'px';
    document.getElementById('edge-popup').style.left = '' + event.clientX + 'px';
}

//同じリンクがあるか判断して返す関数
function same_link_chack(edges, from, to) {
    let same_edge = edges.get({
        filter: function (item) {
            return (item.from === from && item.to === to);
        }
    });
    return same_edge.length >= 1;

}


//悔しいけどグローバルオブジェクト使う
let all_nodes;
let all_edges;

/**
 * ストーリーとなる可能性のある部分を推薦する機能
 */
function suggest_question() {
    qa_Network.storePositions();
    all_nodes = QA_data.nodes.get();
    all_edges = QA_data.edges.get();


    //when where who notのノードのIDを取ってくる
    let remove_nodes = QA_data.nodes.getIds({
        filter: function (item) {
            return (item.group === node_cat.when || item.group === node_cat.where || item.group === node_cat.who || item.group===node_cat.not);
        }
    });

    //上で取得したノードに繋がっているエッジのIDを取ってくる
    let remode_edges = QA_data.edges.getIds({
        filter: function (item) {
            for (let i = 0; i < remove_nodes.length; i++) {
                if (item.from === remove_nodes[i].id || item.to === remove_nodes[i].id)
                    return true;
            }
            return false;
        }

    });

    //取ってきたノードとリンクを消す。
    QA_data.nodes.remove(remove_nodes);
    QA_data.edges.remove(remode_edges);

    //then whatに置き換え可能な物を探す
    let replace_nodes = QA_data.nodes.get({
        filter: function (item) {
            return (item.group === node_cat.how || item.group === node_cat.why)
        }
    });

    let replace_edges = QA_data.edges.get({
        filter: function (item) {
            for (let i = 0; i < replace_nodes.length; i++) {
                if (item.to === replace_nodes[i].id || item.from === replace_nodes[i].id) {
                    return true;
                }
            }
            return false;
        }
    });


    //ノードの中身を変える（現在はラベルだけ）
    for (let i = 0; i < replace_nodes.length; i++) {
        replace_nodes[i].label = node_label[node_cat.then_what] + '\n(' + node_label[replace_nodes[i].group] + ')';
    }

    //エッジの向きを変える
    for (let i = 0; i < replace_edges.length; i++) {
        let a;
        a = replace_edges[i].from;
        replace_edges[i].from = replace_edges[i].to;
        replace_edges[i].to = a;
    }

    QA_data.nodes.update(replace_nodes);
    QA_data.edges.update(replace_edges);


    //探索して、孤立島を消す。
    //アルゴリズム的には縦型探索とかで良いんじゃないでしょうか


    let find_stack = [];
    find_stack.push(QA_data.nodes.getIds({
        filter: function (item) {
            return (item.group === node_cat.initial_answer)
        }
    })[0]);

    let already_list = [];


    while (find_stack.length !== 0) {
        let current_node = find_stack.pop();
        already_list.push(current_node);

        let push_item = QA_data.edges.get({
            fields: ['from'],
            filter: function (item) {
                return (item.to === current_node)
            }
        });
        if (push_item !== null) {
            for (let i = 0; i < push_item.length; i++) {
                let already_flag = false;
                for (let j = 0; j < already_list.length; j++) {
                    if (already_list[j] === push_item[i].from)
                        already_flag = true;
                }
                if (already_flag === false)
                    find_stack.push(push_item[i].from);
            }
        }
    }

    let remove_list = QA_data.nodes.getIds({
        filter: function (item) {
            for (let i = 0; i < already_list.length; i++) {
                if (already_list[i] === item.id)
                    return false;
            }
            return true;
        }
    });

    QA_data.nodes.remove(remove_list);

    $('#suggest_qa').innerHTML='元の表示に戻す';
    $('#suggest_qa').off('click').click(suggest_question_reverse);
    log.add_log(QA_data.nodes.get(),QA_data.edges.get(),'ストーリー推薦をしました');
}

/**
 * 推薦を元に戻す機能
 */
function suggest_question_reverse() {

    QA_data.nodes.update(all_nodes);
    QA_data.edges.update(all_edges);


    $('#suggest_qa').innerHTML='ストーリー推薦';
    $('#suggest_qa').off('click').click(suggest_question);
    log.add_log(QA_data.nodes.get(),QA_data.edges.get(),'ストーリー推薦を解除しました');
}


function alone_node_delete(node_data, edge_data) {
    node_data.getIds({
        filter: function (item) {

        }
    })


}
