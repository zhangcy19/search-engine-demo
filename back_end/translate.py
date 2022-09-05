# translate.py
# 在提供的英文描述后面增加中文翻译
# Created by 张朝阳 on 2022/4/21

import csv

from time import sleep
from tqdm import tqdm
from googletrans import Translator

sum = 19993 #总词条数 
completed = 0 #已完成翻译数
while completed < sum: #快速跳过已完成词条
    try:    
        with open("./data/oidv6-class-descriptions.csv", "r") as f_description:
            with open("description.csv", "a+") as f_output:
                reader_des = csv.reader(f_description)
                header = next(reader_des)
                writer = csv.writer(f_output)

                print("translating...")
                translator = Translator()
                for i, row in tqdm(enumerate(reader_des), total=sum):
                    if i > completed:
                        if len(row) <= 1:
                            continue
                        row.append(translator.translate(row[1], dest='zh-CN', src='en').text)
                        row[1] = row[1].lower()
                        writer.writerow(row)
                        completed += 1
                        sleep(0.5) #主动睡眠，降低被服务器打断概率
    except KeyboardInterrupt: #手动终止
        print("completed = %d, exit" %completed)
        break     
    except: #其余错误捕获后自动重新运行程序（这个很重要，googletrans准确率相对较高，但比较慢（约0.5s一个词）并且不是很稳定）
        print("completed = %d, session disconnects, try reconnecting" %completed)
        sleep(5)
        pass

print("success!")
