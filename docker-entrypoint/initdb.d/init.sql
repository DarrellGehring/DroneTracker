DROP TABLE IF EXISTS robot;

CREATE TABLE IF NOT EXISTS robot (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    generation INT NOT NULL,
    CONSTRAINT unique_name_gen
        UNIQUE (name, generation)
);

DROP TABLE IF EXISTS robotpos;

CREATE TYPE EVENT AS ENUM ('start', 'stop', 'update');

CREATE TABLE IF NOT EXISTS robotpos (
    id SERIAL PRIMARY KEY,
    robotid INT NOT NULL,
    position POINT NOT NULL,
    timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    eventtype EVENT NOT NULL
);

CREATE INDEX idx_robotpos_timestamp on robotpos(timestamp);
CREATE INDEX idx_robotpos_eventtype on robotpos(eventtype);
CREATE INDEX idx_robotpos_robotid on robotpos(robotid);