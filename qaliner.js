let DEBUG_FLAG = true;
//QA一つのクラスの定義。一応定義してみたけどあんまり使わないかも。

let qa_Network;
let initial_idea;

$(document).ready(function () {
    //ページ読み込みの際の処理
    let qa_line = document.getElementById('QAline_network');
    let collection_line = document.getElementById('collection_network');

    //ようこそ画面のボタンの設定など
    //新規作成画面
    $('#new-create').click(function () {
            $('#initial-menu')[0].style.display = 'none';
            $('#initial-idea-input')[0].style.display = 'block';
        }
    );

    //初期アイデア入力画面のOKボタン
    $("#initial-decided").click(function () {
        this.initial_idea = $("#initial-idea").val();
        $('#initial-idea-input')[0].style.display = 'none';
        $('#modal-background')[0].style.display = 'none';
        $('#initial-idea-display')[0].innerHTML = this.initial_idea;


    });


    //中身の話
    qa_Network = new vis.Network(qa_line, QA_data, QA_network_setting);
    //ダブルクリックで拡張用のコンテキストメニューを出すようにする
    qa_Network.on('doubleClick', node_expand_menu);
    expand_menu_bind();


    //下のネットワークの操作
    let collection_network = new vis.Network(collection_line, collection_data, Collection_network_setting);

    window.onmousemove = handleMouseMove;


});

// main的なところ
//最初のデータバインド
let QA_data = {
    nodes: new vis.DataSet([]),
    edges: new vis.DataSet([])
};

let collection_data = {
    nodes: new vis.DataSet([]),
    edges: new vis.DataSet([])
};

let QA_network_setting = {
    manipulation: {
        enabled: true,
        addNode: function (data, callback) {
            // filling in the popup DOM elements
            document.getElementById('node-operation').innerHTML = "Add Node";
            editNode(data, callback);
        },
        editNode: function (data, callback) {
            // filling in the popup DOM elements
            document.getElementById('node-operation').innerHTML = "Edit Node";
            editNode(data, callback);
        },

        addEdge: function (edgeData, callback) {
            qa_edge_add(edgeData, callback);

        },


        controlNodeStyle: {
            shape: 'dot',
        }

    },
    interaction: {
        navigationButtons: true,
        keyboard: true
    },

    edges: {

        arrows: 'to'
    },
    physics: {

        barnesHut: {
            springConstant: 0.01,
            springLength: 50,
            gravitationalConstant: -2000,
            avoidOverlap: 1
        }

    }

};


//QAネットワークのイベントハンドラの設定


let Collection_network_setting = {
    manipulation: {
        enabled: true,
        controlNodeStyle: {
            shape: 'dot',
        }

    },
    interaction: {
        navigationButtons: true,
        keyboard: true
    },

    edges: {

        arrows: 'to'
    },
    physics: {

        barnesHut: {
            springConstant: 0.01,
            springLength: 3000000000,
            gravitationalConstant: -1000000,
            avoidOverlap: 1
        }


    }
};


//関数定義的な
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

function saveNodeData(data, callback) {
    let edge_remove_flag = false;

    data.name = document.getElementById('node-label').value;
    data.group = document.getElementById('node_type').value;
    data.category = document.getElementById('node-category').value;
    data.label = data.category + '\n' + data.name;


    //接続してるQAのエッジを検出
    let connected_edges = QA_data.edges.get({
        filter: function (item) {
            return ((item.from === data.id || item.to === data.id) && item.type === 'QA');
        }
    });

    // QAカテゴリ・タイプ変えたときにQAエッジが繋がってれば削除
    if (connected_edges.length > 0)

        if (data.category !== QA_data.nodes.get(data.id).category || data.group !== QA_data.nodes.get(data.id).group) {
            edge_remove_flag = true;
        }

    clearNodePopUp(null);
    callback(data);


    //コールバック呼ぶ前にエッジ削除するとどうにもグループの変更が上手くいかないので回避のためにあとから読んでます。
    if (edge_remove_flag) {
        toastr.info('カテゴリ・タイプがマッチしないエッジを削除しました');
        QA_data.edges.remove(connected_edges);
    }
}

function clearNodePopUp(func) {
    document.getElementById('node-saveButton').onclick = null;
    document.getElementById('node-cancelButton').onclick = null;
    document.getElementById('node-popUp').style.display = 'none';
    window.onmousemove = handleMouseMove;
    if (func != null)
        func();

}


function qa_edge_add(data, callback) {

    //ignore when id's are same
    if (data.from == data.to) {
        alert('自分自身にリンクを貼ることはできません');
        return;
    }

    //if already exist same link then ignore link create.
    if (same_link_chack(QA_data.edges, data.from, data.to)) {
        return;
    }


    //approving connect when from's group is question and to's group is answer.
    let from_g = QA_data.nodes.get(data.from).group;
    let from_c = QA_data.nodes.get(data.from).category;
    let to_g = QA_data.nodes.get(data.to).group;
    let to_c = QA_data.nodes.get(data.to).category;
    if (from_g === 'Question' && to_g === 'Answer' && from_c === to_c) {
        data.label = from_c;
        data.type = 'QA';
        callback(data);//実際のエッジ追加のメソッドを呼ぶ
    }


}

//qanetworkのコンテキストメニューだすやつ
function node_expand_menu(params) {
    window.onmousemove = null;
    $('#node-expand-menu')[0].style.display = 'block';


    //裏を作るボタン
    $('#expand-back').one('click', function () {
        let origin_id = qa_Network.getSelectedNodes()[0];
        let original_node = QA_data.nodes.get(origin_id);

        let new_node_id = QA_data.nodes.add({
            "group": "Question",
            "label": "Question\n" + 'NOT ' + original_node.name
        });


        QA_data.edges.add({"from": origin_id, "to": new_node_id[0], label: "裏"});
        $('#node-expand-menu')[0].style.display = 'none';
        window.onmousemove = handleMouseMove;
    });

    //最後に戻す

}

//コンテキストメニューの中身の設定
function expand_menu_bind() {
    $('#expand_cancel').click(function () {
        $('#node-expand-menu')[0].style.display = 'none';
        window.onmousemove = handleMouseMove;
    });
}


//マウスの座標を取得
function handleMouseMove(event) {
    event = event || window.event; // IE対応
    document.getElementById('node-popUp').style.top = event.clientY + 'px';
    document.getElementById('node-popUp').style.left = '' + event.clientX + 'px';
    document.getElementById('node-expand-menu').style.top = event.clientY + 'px';
    document.getElementById('node-expand-menu').style.left = '' + event.clientX + 'px';
}

//同じリンクがあるか判断して返す関数
function same_link_chack(edges, from, to) {
    let same_edge = edges.get({
        filter: function (item) {
            return (item.from == from && item.to == to);
        }
    });
    if (same_edge.length < 1) {
        return false;
    }
    else {
        return true;
    }

}
