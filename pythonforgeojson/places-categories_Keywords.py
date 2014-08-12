#generate places-categories JSON file

from factual import Factual

KEY = "i9VTDsvooscG7eFQ6ycBX16gwAvLqOVUDv9u2dMh"
SECRET = "uowo6n31xVVg0UuwVfKJnbxCguCuLM0muJljvFxf"

def main():
    factual = Factual(KEY, SECRET)

#    table = factual.table('places-us')
#    lim = 10
#    
#    q = table.limit(lim).select("en, category_id")
    
#    s = factual.table('places').schema()
#    print str(s)
    

    s = factual.table('places').schema()['fields']
    print(s)
    
#    categoriesDict = {};
#    
#    for count in range(0, lim):
#        name = q.data()[count][u'en']
#        cat_id = q.data()[count][u'category_id']
#        splitList = name.split(" ")
#        for i in range(0, len(splitList)):
#            splitName = str(splitList[i])
#            if splitName in categoriesDict.keys():
#                categoriesDict[splitName].append(cat_id)
#            else:
#                categoriesDict[splitName]=[cat_id]
#    
#    print categoriesDict
        
        

if __name__ == '__main__':
  main()
