# dataprocess_list.py
# 构建候选词库
# Created by 张朝阳 on 2022/5/20

import csv
import json
import sys

from tqdm import tqdm

csv.field_size_limit(sys.maxsize)
f_daopai = open("./output/demo_daopai.csv", "r") #直接从倒排表中取词
f_output = open("./output/list.json", "w")

reader_daopai = csv.reader(f_daopai)
next(reader_daopai)

data = {}
data["list"] = []
print("loading list...")
for row in tqdm(reader_daopai):
    data["list"].append(row[0])
    data["list"].append(row[1])

print("writing data...")
json.dump(data, f_output, ensure_ascii=False)

f_daopai.close()
f_output.close()
