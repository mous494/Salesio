#coding:utf_8
import json
import codecs

emotions={
  "basics": {
      "joy": {
          "jp_name": "喜び",
          "rank":1
      },
      "trust": {
          "jp_name": "信頼",
          "rank":1
      },
      "fear": {
          "jp_name": "恐れ",
          "rank":32
      },
      "surprise": {
          "jp_name": "驚き",
          "rank":1
      },
      "sadness": {
          "jp_name": "悲しみ",
          "rank":32
      },
      "disgust": {
          "jp_name": "嫌悪",
          "rank":32
      },
      "anger": {
          "jp_name": "怒り",
          "rank":32
      },
      "anticipation": {
          "jp_name": "期待（予測）",
          "rank":1
      }
  },
  "dyads": {
      "optimism": {
          "consist_of": ["anticipation", "joy"],
          "jp_name": "楽観"
      },
      "hope": {
          "consist_of": ["anticipation", "trust"],
          "jp_name": "運命：希望"
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
}
output=""
for basic in emotions["basics"]:
	output+=emotions["basics"][basic]["jp_name"]+","+str(emotions["basics"][basic]["rank"])+"\n"


for dyad in emotions["dyads"]:
	mean_val=0
	for consist_basic in emotions["dyads"][dyad]["consist_of"]:
		mean_val+=emotions["basics"][consist_basic]["rank"]
	mean_val/=2
	emotions["dyads"][dyad]["rank"]=mean_val
	output+=emotions["dyads"][dyad]["jp_name"]+","+str(mean_val)+"\n"


print(output)

#ここでoutputの数値は大きい方が幸福度が高いことに注意
with codecs.open("hedono_rank.csv","w","s_jis") as f:
	f.write(output)
