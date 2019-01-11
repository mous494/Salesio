#coding:utf_8
import sys
import pandas as pd
import numbers as np
import pickle
import csv

input_file = sys.argv[1]
data = pd.read_csv(input_file)
items=[]

for i in range(len(data.index)):
    items.append(str(data.iat[i,0]).split('-'))
print(items)
with open("turky_result","w") as fw:
    writer = csv.writer(fw, lineterminator='\n')
    writer.writerows(items)


result_table = pd.DataFrame(data=0,index={"喜び",
"愛",
"感動",
"信頼",
"優越",
"好奇心",
"期待（予測）",
"楽観",
"運命",
"自尊心",
"驚き",
"感傷",
"不安",
"不健全",
"皮肉",
"後悔",
"罪悪感",
"服従",
"攻撃",
"軽蔑",
"恐れ",
"怒り",
"畏怖",
"悲観",
"拒絶",
"嫌悪",
"悲しみ",
"憤慨",
"恥辱",
"悲憤",
"憎悪",
"絶望"
},columns={"喜び",
"愛",
"感動",
"信頼",
"優越",
"好奇心",
"期待（予測）",
"楽観",
"運命",
"自尊心",
"驚き",
"感傷",
"不安",
"不健全",
"皮肉",
"後悔",
"罪悪感",
"服従",
"攻撃",
"軽蔑",
"恐れ",
"怒り",
"畏怖",
"悲観",
"拒絶",
"嫌悪",
"悲しみ",
"憤慨",
"恥辱",
"悲憤",
"憎悪",
"絶望"
})

print(result_table)

for item in items:
    print(item)
    result_table[item[0]][item[1]]+=1

result_table.to_csv("diff_table.csv",sep=',')