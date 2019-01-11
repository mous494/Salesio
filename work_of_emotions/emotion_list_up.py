#coding=utf-8
import json
import random

f = open('emotions.json','r')
fw = open('emotion_list.txt','w')
jsonData=json.load(f)
outputtext=[]

for key in jsonData:
    #print(key+':')
    for subkey in jsonData[key]:
       
       outputtext.append(jsonData[key][subkey]['jp_name'])
#random.shuffle(outputtext)
for item in outputtext:
       fw.write(item+'\n')
print(outputtext)
f.close()
fw.close()
