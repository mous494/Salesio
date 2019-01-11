import csv
import sys
import os
import pandas as pd
import numpy as np
import sklearn.cluster as sk

inputfile=sys.argv[1]
df = pd.read_csv(inputfile,index_col=0)
rule =""
all_set =[]
rule_set=[[0 for i in range(32)] for j in range(32)]
rule_set_binaly=[[0 for i in range(32)] for j in range(32)]


# print(df.columns[0])#カラムタイトル
# print(df.index[0])#インデックスタイトル
# print(df.iat[0,0])#特定場所へのアクセス


for i in range(len(df.index)):
    individual_rule=[]
    for j in range(len(df.columns)):
        for k in range(len(df.columns)):
            if (df.iat[i,j]<df.iat[i,k]):
                rule_set[j][k]+=1
                individual_rule.append(df.columns[j]+"<"+df.columns[k])
                #rule+=df.columns[j]+"<"+df.columns[k]+"\n"
    all_set.append(individual_rule.copy())

and_set=all_set[0].copy()

for i in range(1,len(all_set)):
    and_set = set(and_set)&set(all_set[i])

print(rule_set)

# print(len(df.index))
# print(rule_set)

and_set=[]
emotion_priority=[0 for i in range(32)]
eneble_rule_list=[]
# 多い側のルールをなんとかしてトラッキングして加算
for i in range(len(rule_set)):
    for j in range(len(rule_set[i])):
        if(rule_set[i][j]==10 and i!=j ):#ルール出力のスレッショルドを決めてる
            rule_set_binaly[i][j]=1
            emotion_priority[i] += 1 #左辺をカウントする
            temp_rule=[]
            temp_rule.append([i,j])# 今のルールを追加

            while len(temp_rule)!=0:
                current_rule=temp_rule.pop()
                for rule in eneble_rule_list:
                    if(rule[1]==current_rule[0]):
                        emotion_priority[rule[0]]+=1
                        temp_rule.append(rule)
            eneble_rule_list.append([i,j])# 今のルールを追加
            and_set.append(df.columns[i]+"<"+df.columns[j])
#少ない側も同様にやってみる
# print(eneble_rule_list)
# eneble_rule_list=[]
# for i in range(len(rule_set)):
#     for j in range(len(rule_set[i])):
#         if(rule_set[i][j]==0 and i!=j ):#ルール出力のスレッショルドを決めてる
#             emotion_priority[i] -= 1 #右辺をカウントする
#             temp_rule=[]
#             temp_rule.append([i,j])# 今のルールを追加

#             while len(temp_rule)!=0:
#                 # print(eneble_rule_list)
#                 # print(i,j)
#                 current_rule=temp_rule.pop()
#                 for rule in eneble_rule_list:
#                     if(rule[1]==current_rule[0]):
#                         #print(rule,current_rule)
#                         emotion_priority[rule[0]]-=1
#                         temp_rule.append(rule)
#             eneble_rule_list.append([i,j])# 今のルールを追加
#             and_set.append(df.columns[i]+"<"+df.columns[j])

    # print(and_set)
print(emotion_priority)
print(and_set)

# 集計結果の出力
with open("rule_set.txt",'w') as fw:
    output_list = map(str,rule_set_binaly)
    fw.write("\n".join(output_list))

#ルールの出力
# with open("rule.txt",'w') as fw:
#     output_list = map(str,emotion_priority)
#     fw.write("\n".join(output_list))

    

temp = [0 for i in range(32)]

data = np.array([emotion_priority,temp],np.int32)

data = data.T

result = sk.KMeans(n_clusters=4).fit_predict(data)
print(result)


