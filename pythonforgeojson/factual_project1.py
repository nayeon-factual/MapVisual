
from factual import Factual

KEY = "i9VTDsvooscG7eFQ6ycBX16gwAvLqOVUDv9u2dMh"
SECRET = "uowo6n31xVVg0UuwVfKJnbxCguCuLM0muJljvFxf"

def main():
    factual = Factual(KEY, SECRET)

    table = factual.table('places-us')
    lim = 500
    
    q = table.filters({"$and":[{'locality':{'$in':['los angeles', 'boston']}}, {'name': {'$blank': False}}, {'locality': {'$blank': False}}, {'latitude': {'$blank': False}}, {'longitude': {'$blank': False}},{'factual_id': {'$blank': False}}]}).limit(lim).sort('$random_133').select("name,locality,latitude,longitude,factual_id")

    print '{ "type": "FeatureCollection","features": ['

    for count in range(0,lim):

        lat = q.data()[count][u'latitude']
        name = q.data()[count][u'name']
        lng = q.data()[count][u'longitude']
        fid = q.data()[count][u'factual_id']
        locality = q.data()[count][u'locality']

        coor = '"coordinates":' + '[' + str(lng) + ',' + str(lat) +']},'

        typFeat = '{ "type": "Feature",'
        geo = '"geometry": {"type": "Point",' + coor
        prop = '"properties": {"name": "' + name + '", "locality":"' + locality + '", "factual_id": "' + fid + '"}}'
        
        if count == lim-1:
            print typFeat + geo + prop
        else:
            print typFeat + geo + prop + ","

    print ']}'

if __name__ == '__main__':
  main()
