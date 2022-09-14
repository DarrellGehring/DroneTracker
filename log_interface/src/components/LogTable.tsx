import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination'
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Divider from '@mui/material/Divider';
import { visuallyHidden } from '@mui/utils';
import PositionTable from './PositionTable';
import Filters from './Filters';
import { FilterValues } from '../types'

const createData = (log: Array<any>) => {
  let timespan = new Date(log[6] * 1000).toISOString().substring(14, 19)

  return {
    robot_name: log[1],
    robot_gen: log[2],
    start_time: log[3],
    end_time: log[4],
    elapsed_time: timespan,
    robot_id: log[0]
  };
}

type Order = 'asc' | 'desc';

interface HeadCell {
  disablePadding: boolean;
  id: string;
  label: string;
  leftAlign: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'filler',
    leftAlign: true,
    disablePadding: false,
    label: '',
  },
  {
    id: 'robot_name',
    leftAlign: true,
    disablePadding: false,
    label: 'Name',
  },
  {
    id: 'robot_gen',
    leftAlign: false,
    disablePadding: false,
    label: 'Generation',
  },
  {
    id: 'start_time',
    leftAlign: false,
    disablePadding: false,
    label: 'Start Time',
  },
  {
    id: 'end_time',
    leftAlign: false,
    disablePadding: false,
    label: 'End Time',
  },
  {
    id: 'elapsed_time',
    leftAlign: false,
    disablePadding: false,
    label: 'Elapsed',
  },
];

interface EnhancedTableProps {
  // Would use keyof but we have a fake field on the table
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  order: Order;
  orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } =
    props;
  const createSortHandler =
    (property: string) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          headCell.id === "filler"
          ?
          (
            <TableCell key={headCell.id}/>
          )
          :
          (
            <TableCell
              key={headCell.id}
              align={headCell.leftAlign ? 'left' : 'right'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          )
        ))}
      </TableRow>
    </TableHead>
  );
}


function Row(props: { row: ReturnType<typeof createData> }) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.robot_name}
        </TableCell>
        <TableCell align="right">{row.robot_gen}</TableCell>
        <TableCell align="right">{row.start_time}</TableCell>
        <TableCell align="right">{row.end_time}</TableCell>
        <TableCell align="right">{row.elapsed_time}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                History
              </Typography>
              <PositionTable robotid={row.robot_id} start={row.start_time} end={row.end_time} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

interface TableController {
  page: number,
  totalResults: number,
  order: Order,
  orderBy: string,
  filters: string
}

export default function LogTable() {

  const [logs, setLogs] = React.useState<any[]>([]);
  const [totalRows, setTotalRows] = React.useState(0);
  const [controller, setController] = React.useState<TableController>({
    page: 0,
    totalResults: 0,
    order: 'asc',
    orderBy: 'robot_name',
    filters: '',
  });

  const handlePageChange = (event: any, newPage: number) => {
    setController({
      ...controller,
      page: newPage
    });
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = controller.orderBy === property && controller.order === 'asc';
    setController({
      ...controller,
      order: isAsc ? 'desc' : 'asc',
      orderBy: property
    });
  };

  const handleRequestFilter = (
    filters: FilterValues,
  ) => {
    let filterString = '';
    for (const [key, value] of Object.entries(filters)) {
      // Special case for our array handling
      if (key.toString() === 'elapsed_minutes_range') {
        if (value[0] !== 0 || value[1] !== 30) {
          filterString+=`&min_minutes=${value[0]}&max_minutes=${value[1]}`;
        }
      } else if (value) {
        filterString+=`&${key}=${value}`;
      }
    }

    setController({
      ...controller,
      filters: filterString
    });
  };

  const updateLogs = (data: Array<Array<any>>) => {
    let serializedLogs = data.map(createData);
    setLogs(serializedLogs);
  }

  const getRows = () => {
    if (logs.length > 0) {
      return (
        logs.map((log) => (
        <Row key={log.robot_name+'_'+log.robot_gen+'_'+log.start_time} row={log} />
      )))
    }
  }

  // On pagination controller update
  React.useEffect(() => {
    const getData = async () => {
      const url = `${process.env.REACT_APP_API}/log?page=${controller.page}&count=10&orderby=${controller.orderBy}&ordertype=${controller.order}${controller.filters}`
      try {
        const response = await fetch(url, {
          headers: {  
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json"
                  }
        });
        if (response.statusText === 'OK') {
          const data = await response.json();

          let totalRows = data.length > 0 ? data[0][5] : 0;
          setTotalRows(totalRows)
          updateLogs(data)

          // If we have less results than we can show on one page and we aren't on the first page, force user to first page
          // (Sort of hacky, I know)
          if (totalRows <= 10 && controller.page !== 0) {
            setController({
              ...controller,
              page: 0
            });
          }

        } else {
          throw new Error('Request failed')
        }
      } catch (error) {
        console.log(error);
      }
    };
    getData();
  }, [controller]);

  return (
    <>
      <Card sx={{ minWidth: 275, m: 2 }}>
        <CardContent>
          <Filters setFilters={handleRequestFilter}/>
          <Divider />
          <Box m={2}>
            <Typography variant="h4" component="h4">
              Results
            </Typography>
          </Box>
          <TableContainer component={Paper}>
            <Table aria-label="collapsible table">
              <EnhancedTableHead
                onRequestSort={handleRequestSort}
                order={controller.order}
                orderBy={controller.orderBy}
              />
              <TableBody>
                {getRows()}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              onPageChange={handlePageChange}
              page={controller.page}
              count={totalRows}
              rowsPerPage={10}
              rowsPerPageOptions={[]}
            />
          </TableContainer>
        </CardContent>
      </Card>
    </>
  );
}