import csv
import numpy as np
import datetime

courses = list(csv.reader(open('courseDimension.csv', encoding='utf-8', errors='ignore')))
res = [["key", "courseCode"]]

oldCourse = ""
for i in range(0,len(courses)):
    if(courses[i][2] != oldCourse):
        res.append([i,courses[i][2]])
        oldCourse=courses[i][2]

with open('courseMap.csv', mode='w') as file:
    file_writer = csv.writer(file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    for row in res:
        file_writer.writerow(row)
