# dataprocess_zhengpai.py
# 正排处理
# Created by 张朝阳 on 2022/4/21

import csv
import os

from tqdm import tqdm
from PIL import Image

f_bbox = open("./data/oidv6-train-annotations-bbox.csv", "r")
f_description = open("./output/description.csv", "r")
f_output = open("./output/demo_zhengpai.csv", "w")

reader_bbox = csv.reader(f_bbox)
next(reader_bbox)
reader_des = csv.reader(f_description)
next(reader_des)
writer = csv.writer(f_output)
header = ["ImageId", "LabelNameEN", "LabelNameCN", "BoxScale", "IsOccluded", "IsTruncated", "IsGroupOf", "IsDepiction", "IsInside", "Size"]
writer.writerow(header)

print("loading dictionary...")
dict = {} #将标记与对应的中英文文本写入词典
for row in tqdm(reader_des, total=19994):
    dict[row[0]] = [row[1], row[2]]

print("loading image list...")
ImageIdList = os.listdir("/Applications/XAMPP/xamppfiles/htdocs/demo/front-end/build/train_6_demo") #图片库地址
ImageIdSet = set(ImageIdList) #由于下载的图片是一部分，而给的标记信息是全部图片的标记信息，因此要根据图片过滤掉未出现的图片标记信息

print("merging data...")
data = {}
for row in tqdm(reader_bbox):
    if row[0]+".jpg" in ImageIdSet: #如果该条标记信息的图片在图片库中
        scale = str((float(row[5]) - float(row[4])) * (float(row[7]) - float(row[6]))) #根据标记的框选范围计算出主体占图片的比例
        img = Image.open("/Applications/XAMPP/xamppfiles/htdocs/demo/front-end/build/train_6_demo/{}.jpg".format(row[0]))
        size = 0
        if (img.width > img.height):
            size = 1
        elif (img.width < img.height):
            size = 2
        else:
            size = 3 #获取图纸尺寸并给出判断（横向较长为1，竖向较长为2，一般长为3）
        if (row[0] + row[2]) not in data: #由于同种类型的多个标记框有可能指向一张图片，因此先判断该图片是否已被标记过，若没被标记过则新建词项
            data[row[0] + row[2]] = [row[0], dict[row[2]][0], dict[row[2]][1], scale, row[8], row[9], row[10], row[11], row[12], size]
        else : #若已被标记过，则将scale参数叠加，其它参数合并
            data[row[0] + row[2]][3] = str(float(data[row[0] + row[2]][3]) + float(scale))
            if row[8] == '0': data[row[0] + row[2]][4] = '0' #有一个不被遮挡就算不被遮挡
            if row[9] == '0': data[row[0] + row[2]][5] = '0' #有一个不被打断就算不被打断
            data[row[0] + row[2]][6] = '1' #出现多个就算群组
            if row[11] == '1': data[row[0] + row[2]][7] = '1' #有一个是抽象描绘就算抽象描绘
            if row[12] == '1': data[row[0] + row[2]][8] = '1' #有一个是从内向外拍的就算从内向外拍的
        
print("writing data...")
for d in tqdm(data.values()):
    writer.writerow(d)

f_bbox.close()
f_description.close()
f_output.close()




