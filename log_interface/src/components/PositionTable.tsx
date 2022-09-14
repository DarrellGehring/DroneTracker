import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function createData(log: Array<any>) {
  let localeData = log[5].substring(1, log[5].length - 1).split(",");

  return {
    lat: localeData[0],
    lon: localeData[1],
    timestamp: log[4],
    eventtype: log[3]
  };
}

function Row(props: { row: ReturnType<typeof createData> }) {
  const { row } = props;

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell align="right">{row.lat}</TableCell>
        <TableCell align="right">{row.lon}</TableCell>
        <TableCell align="right">{row.timestamp}</TableCell>
        <TableCell align="right">{row.eventtype}</TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function PositionTable(props: {robotid: number, start: string, end: string}) {

  const {robotid, start, end} = props;

  const [logs, setLogs] = React.useState<any[]>([]);

  const updateLogs = (data: Array<Array<any>>) => {
    let serializedLogs = data.map(createData);
    setLogs(serializedLogs);
  }

  const getRows = () => {
    if (logs.length > 0) {
      return (
        logs.map((log) => (
        <Row key={log.timestamp} row={log} />
      )))
    }
  }

  React.useEffect(() => {
    const getData = async () => {
      const url = `${process.env.REACT_APP_API}/position?robotid=${robotid}&start=${start}&end=${end}`
      try {
        const response = await fetch(url, {
          headers: {  
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json"
                  }
        });
        if (response.statusText === 'OK') {
          const data = await response.json();

          updateLogs(data)
        } else {
          throw new Error('Request failed')
        }
      } catch (error) {
        console.log(error);
      }
    };
    getData();
  }, []);

  return (
    <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
        <TableHead>
            <TableRow>
                <TableCell>Latitude</TableCell>
                <TableCell align="right">Longitude</TableCell>
                <TableCell align="right">Timestamp</TableCell>
                <TableCell align="right">Type</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {getRows()}
        </TableBody>
        </Table>
    </TableContainer>
  );
}