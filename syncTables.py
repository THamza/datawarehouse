import csv
import numpy as np
import datetime

fileName = input("File Name> ")
column = input("Column> ")
originFileName = input("Origin File Name> ")
originColumnName = input("Origin Column> ")
keyColumnInOriginFile = input("Key Column In Origin File> ")
isDate = input("Is Date (0:false,1:true)> ")
# fileName = "factTableTest.csv"
# column = "tutorKey"
# originFileName = "tutorDimensionTest.csv"
# originColumnName = "AUID"
# keyColumnInOriginFile = "studentKey"

factTable = None
originTable = None

def findCell(inputTable,columnName):
    for i in range(0,len(inputTable[0])):
        if(inputTable[0][i] == columnName):
            return i

    return -1

def readCsvFile(fileName):
    return list(csv.reader(open(fileName, encoding='utf-8', errors='ignore')))

def writeCsvFile(fName, array2D):
    with open(fName, mode='w') as file:
        file_writer = csv.writer(file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        for row in array2D:
            file_writer.writerow(row)


factTable = readCsvFile(fileName)
originTable = readCsvFile(originFileName)

print("Finding Indexes..........", end='')
columnIndex = findCell(factTable, column)
columnOriginIndex = findCell(originTable, originColumnName)
keyColumnInOriginFileIndex = findCell(originTable, keyColumnInOriginFile)
print("Done")

print("\n\n'",column,"' Position: ",columnIndex)
print("'",originColumnName,"' Position: ",columnOriginIndex)
print("'",keyColumnInOriginFile,"' Position: ",keyColumnInOriginFileIndex ,"\n\n")

if(columnIndex == -1 or columnOriginIndex == -1 or keyColumnInOriginFileIndex == -1):
    print("Column with label -1 couldn't be found")
else:
    print("Processing...............", end='')
    for i in range(1,len(factTable)):
        key = factTable[i][columnIndex]
        if(isDate == '1'):
            key = datetime.datetime.strptime(key, "%m/%d/%y").strftime("%Y-%m-%d")
        flag = False
        for j in range(1,len(originTable)):
            if(originTable[j][columnOriginIndex] == key):
                factTable[i][columnIndex] = originTable[j][keyColumnInOriginFileIndex]
                flag = True
                break
        if(not flag):
            factTable[i][columnIndex] = ""


    writeCsvFile(fileName,factTable)
    print("Done")





print("[Success]: I'm done, thank you for using me <3")
