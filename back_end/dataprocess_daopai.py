# dataprocess_daopai.py
# 倒排处理
# Created by 张朝阳 on 2022/4/21

import csv

from tqdm import tqdm

f_zhengpai = open("./output/demo_zhengpai.csv", "r")
f_description = open("./output/description.csv", "r")
f_output = open("./output/demo_daopai.csv", "w")

reader_zhengpai = csv.reader(f_zhengpai)
next(reader_zhengpai)
reader_des = csv.reader(f_description)
next(reader_des)
writer = csv.writer(f_output)
header = ["LabelNameEN", "LabelNameCN", "ImageIds"]
writer.writerow(header)

print("loading dictionary...")
dict = {} #将标记与对应的中英文文本写入词典
for row in tqdm(reader_des, total=19994):
    dict[row[1]] = row[2]

print("loading list...")
data = {} #把同一关键词的图片（带着它的scale）合并
for row in tqdm(reader_zhengpai):
    if row[1] not in data:
        data[row[1]] = [(row[0], float(row[3]))]
    else:
        data[row[1]].append((row[0], float(row[3])))

print("sorting list...")
for d in tqdm(data.values()): #根据scale对同一关键词下的图片进行排序
    d.sort(key=lambda k:k[1], reverse=True)

print("writing data...")
for k, v in tqdm(data.items()):
    imageIds = ""
    for i, id in enumerate(v):
        if i > 50:
            break
        imageIds += (id[0] + "/") #图片路径通过‘/’分割后写为一个字符串
    r = [k, dict[k], imageIds]
    writer.writerow(r)

f_zhengpai.close()
f_description.close()
f_output.close()
