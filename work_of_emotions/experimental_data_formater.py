import csv
import sys
import os
import re


argvs=sys.argv
argc = len(argvs)

for i in range(1,argc):
    emotion_list = []
    emotion_rank_number  = []
    output_file_name ='output.csv'

    input_file_name = argvs[i]
    print(input_file_name)
    emotion_rank_number.append(os.path.basename(input_file_name))

    with open('emotion_list.txt','r') as f:
        reader1 = csv.reader(f)
        for row1 in reader1:
            # print (row1[0])
            emotion_list.append(row1[0])

    for emo in emotion_list:
        #print(emo)
        with open(input_file_name,'r') as fe:
            reader2 = csv.reader(fe)
            for row2 in reader2:
                #print(emo+row2[0])
                if(emo==row2[0]):
                    emotion_rank_number.append(row2[1])

    with open(output_file_name,'a') as fw:
        writer = csv.writer(fw)
        writer.writerow(emotion_rank_number)
