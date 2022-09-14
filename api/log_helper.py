from robot_helper import get_robot_id
import psycopg2, time
import os
import sys
from datetime import datetime

# This function assumes no duplication, don't want to add more unique constraints and slow down inserts
def add_positions(positions):
    response = ""
    conn = psycopg2.connect(
            host="db",
            database=os.environ['DB_NAME'],
            user=os.environ['DB_USER'],
            password=os.environ['DB_PASSWORD'])
    cur = conn.cursor()
    try:
        for position in positions:
            query = "INSERT INTO robotpos (robotid, position, timestamp, eventtype) VALUES (%s, POINT(%s, %s), to_timestamp(%s), %s)"
            robotid = get_robot_id(position['robotname'], position['robotgen'])
            cur.execute(query, (robotid, float(position['lat']), float(position['lon']), int(position['timestamp']), position['type']))
        
        conn.commit()
        response = "Inserted %s positions" % len(positions)

    except KeyError as e:
        response = "Missing required key: "+str(e)
    
    except psycopg2.Error as e:
        response = "Error while talking to PostgreSQL: "+str(e)

    except Exception as e:
        response = "Misc Error: "+str(e)

    finally:
        if conn:
            cur.close()
            conn.close()

    return response

def get_positions(robotid, start, end):
    response = []
    conn = psycopg2.connect(
            host="db",
            database="postgres",
            user=os.environ['DB_USER'],
            password=os.environ['DB_PASSWORD'])
    cur = conn.cursor()
    try:
        query = '''
                    /* Get Flight details */
                    SELECT
                        b.id as robot_id,
                        b.name as robot_name,
                        b.generation as robot_gen,
                        a.eventtype,
                        a.timestamp,
                        a.position
                    FROM robotpos a
                    INNER JOIN robot b ON b.id = a.robotid
                    WHERE
                        a.robotid = %s
                        and a.timestamp >= %s and a.timestamp <= %s
                    ORDER BY
                        b.id,
                        a.timestamp
                '''
        cur.execute(query, (robotid, datetime.fromisoformat(start), datetime.fromisoformat(end)))
        positions = cur.fetchall()

        response = positions

    except psycopg2.Error as e:
        response = "Error while talking to PostgreSQL: "+str(e)

    finally:
        if conn:
            cur.close()
            conn.close()

        return response

def get_logs(args):
    response = ""
    conn = psycopg2.connect(
            host="db",
            database="postgres",
            user=os.environ['DB_USER'],
            password=os.environ['DB_PASSWORD'])
    cur = conn.cursor()
    try:
        template_vars = ()
        query = '''
                    WITH logs AS (
                    SELECT
                        b.id as robot_id,
                        b.name as robot_name,
                        b.generation as robot_gen,
                        a.timestamp as start_time,
                        (
                            /* Get the next (newest) stop entry after this start entry */
                            SELECT 
                                timestamp
                            from robotpos tmp 
                            WHERE 
                                tmp.robotid = a.robotid 
                                and tmp.timestamp > a.timestamp
                                and tmp.eventtype='stop' 
                            order by timestamp
                            limit 1
                        ) AS end_time
                    FROM robotpos a
                    /* Get the robot info from its ID */
                    INNER JOIN robot b ON b.id = a.robotid
                    WHERE
                        a.eventtype = 'start'
                    '''
        # Add our where clause stuff (non computed columns search)
        #if args.get('robot_gen', None) or args.get('robot_name', None) or args.get('start_date', None) or args.get('start_time', None):

        if args.get('robot_gen', None):
            query += '''
                        AND b.generation = %s
                    '''
            template_vars = template_vars + (int(args.get('robot_gen')),)

        if args.get('robot_name', None):
            query += '''
                        AND UPPER(b.name) LIKE UPPER(%s)
                    '''
            template_vars = template_vars + (str(args.get('robot_name')+'%'),)

        if args.get('start_date', None):
            query += '''
                        AND a.timestamp >= %s
                    '''
            template_vars = template_vars + (datetime.strptime(args.get('start_date'), '%Y-%m-%d'),)

        if args.get('start_time', None):
            query += '''
                        AND a.timestamp::time >= %s::time
                    '''
            template_vars = template_vars + (datetime.strptime(args.get('start_time'), '%H:%M'),)

        query+= '''
                    ORDER BY
                        b.id,
                        a.timestamp
                    )
                    SELECT 
                        *,
                        COUNT(*) OVER() as totalRows,
                        /* Expensive, should have used MySql for CALC_FOUND_ROWS */
                        EXTRACT(EPOCH FROM (logs.end_time - logs.start_time)) as elapsed_time
                    FROM logs
                '''

        # Filter off computed columns in having clause
        if args.get('end_date', None) or args.get('end_time', None) or args.get('min_minutes', None) or args.get('max_minutes', None):
            priorHits = False
            query += '''
                        WHERE
                    '''

            if args.get('end_date', None):
                query += '''
                            end_time::date <= %s::date
                        '''
                template_vars = template_vars + (datetime.strptime(args.get('end_date'), '%Y-%m-%d'),)
                priorHits = True


            if args.get('end_time', None):
                query += 'AND' if priorHits else ''
                query += '''
                            end_time::time <= %s::time
                        '''
                template_vars = template_vars + (datetime.strptime(args.get('end_time'), '%H:%M'),)
                priorHits = True
            
            if args.get('min_minutes', None):
                query += 'AND' if priorHits else ''
                query += '''
                            EXTRACT(EPOCH FROM (logs.end_time - logs.start_time)) >= %s
                        '''
                template_vars = template_vars + (int(args.get('min_minutes'))*60,)
                priorHits = True

            if args.get('max_minutes', None):
                query += 'AND' if priorHits else ''
                query += '''
                            EXTRACT(EPOCH FROM (logs.end_time - logs.start_time)) <= %s
                        '''
                template_vars = template_vars + (int(args.get('max_minutes'))*60,)

        # This second order by is to avoid writing two blocks just for elapsed_time.
        # Shouldn't impact performance very much, but could be improved
        if args.get('orderby', None) and args.get('ordertype', None):
            # psycopg2 templatization only works with literals, have to alter query by hand (dangerous, subject to injection)

            query += '''
                        ORDER BY %s %s
                    ''' % ((args.get('orderby', None)), (args.get('ordertype', None)))

        if args.get('count', None) and args.get('page', None):
            query += '''
                        LIMIT %s OFFSET %s
                    '''
            template_vars = template_vars + (int(args.get('count')), int(args.get('count'))*int(args.get('page')))
        
        cur.execute(query, template_vars)
        logs = cur.fetchall()

        response = logs

    except psycopg2.Error as e:
        response = "Error while talking to PostgreSQL: "+str(e)

    finally:
        if conn:
            cur.close()
            conn.close()

    return response
