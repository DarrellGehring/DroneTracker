import os
import psycopg2
from pymemcache.client.base import Client

def get_robot_id(name, gen):

    # Memcached gives O(1) lookups
    client = Client(('memcached', 11211))
    cachevalue = client.get('%s_%s' % (name, gen))
    robotid =  cachevalue.decode('utf-8') if cachevalue else None

    # Result not cached yet
    if not robotid:
        conn = psycopg2.connect(
                host="db",
                database=os.environ['DB_NAME'],
                user=os.environ['DB_USER'],
                password=os.environ['DB_PASSWORD'])
        cur = conn.cursor()

        # Attempt to fetch record
        query = "SELECT * FROM robot WHERE name = %s AND generation = %s"
        cur.execute(query, (str(name), int(gen)))
        robot = cur.fetchall()

        # If no record, attempt new creation
        if not robot:
            query = "INSERT INTO robot (name, generation) VALUES (%s, %s) RETURNING id"
            cur.execute(query, (str(name), int(gen)))
            robot = cur.fetchall()
            
            conn.commit()

        if not robot:
            raise Exception("Something went wrong inserting/retrieving robot")

        robotid = str(robot[0][0])

        # Cache result
        client.set('%s_%s' % (name, gen), robotid)

        if conn:
            cur.close()
            conn.close()

    return robotid