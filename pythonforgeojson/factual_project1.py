from factual import Factual
import dstk

KEY = "i9VTDsvooscG7eFQ6ycBX16gwAvLqOVUDv9u2dMh"
SECRET = "uowo6n31xVVg0UuwVfKJnbxCguCuLM0muJljvFxf"

dstk = dstk.DSTK()

def main():
    factual = Factual(KEY, SECRET)

    table = factual.table('places-us')
    lim = 5
    
    q = table.filters({"$and":[{'locality':{'$in':['los angeles', 'boston']}}, {'name': {'$blank': False}}, {'locality': {'$blank': False}}, {'latitude': {'$blank': False}}, {'longitude': {'$blank': False}},{'factual_id': {'$blank': False}}]}).limit(lim).sort('$random_133').select("name,locality,latitude,longitude,factual_id")

    print '{ "type": "FeatureCollection","features": ['

    for count in range(0,lim):

        lat = q.data()[count][u'latitude']
        name = q.data()[count][u'name']
        lng = q.data()[count][u'longitude']
        fid = q.data()[count][u'factual_id']
        locality = q.data()[count][u'locality']

        coor = '"coordinates":' + '[' + str(lng) + ',' + str(lat) +']},'
        pop_coor = '(' + str(lng) + ', ' + str(lat) +')'
        pop_den = dstk.coordinates2statistics(pop_coor)[0]['statistics']['population_density']['value']
        
        typFeat = '{ "type": "Feature",'
        geo = '"geometry": {"type": "Point",' + coor
        prop = '"properties": {"name": "' + name + '", "locality":"' + locality + '", "factual_id": "' + fid + '", "pop_density": "' + str(pop_den) + '"}}'
        
        if count == lim-1:
            print typFeat + geo + prop
        else:
            print typFeat + geo + prop + ","

    print ']}'
    


if __name__ == '__main__':
  main()
