import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core';
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TablePagination
} from '@material-ui/core';

import { Portlet, PortletContent } from '../../../../../components';
import styles from './styles';
import { connect } from "react-redux";

class ShowtimesTable extends Component {
  state = {
    rowsPerPage: 10,
    page: 0
  };

  static propTypes = {
    className: PropTypes.string,
    classes: PropTypes.object.isRequired,
    onSelect: PropTypes.func,
    onShowDetails: PropTypes.func,
    showtimes: PropTypes.array.isRequired
  };

  static defaultProps = {
    showtimes: [],
    onSelect: () => {},
    onShowDetails: () => {}
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render() {
    const {
      classes,
      className,
      showtimes,
      onSelectShowtime,
      selectedShowtimes,
      selectAllShowtimes,
      movies,
      cinemas
    } = this.props;

    const { rowsPerPage, page } = this.state;

    const rootClassName = classNames(classes.root, className);
    return (
        <Portlet className={rootClassName}>
          <PortletContent noPadding>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="left">
                    <Checkbox
                        checked={selectedShowtimes.length === showtimes.length}
                        color="primary"
                        indeterminate={
                            selectedShowtimes.length > 0 &&
                            selectedShowtimes.length < showtimes.length
                        }
                        onChange={selectAllShowtimes}
                    />
                    ID
                  </TableCell>
                  <TableCell align="left">Фильм</TableCell>
                  <TableCell align="left">Кинотеатр</TableCell>
                  <TableCell align="left">Дата начала</TableCell>
                  <TableCell align="left">Дата окончания</TableCell>
                  <TableCell align="left">Время</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {showtimes
                    .filter(showtime => {
                      return showtime;
                    })
                    .slice(0, rowsPerPage)
                    .map(showtime => {
                      const movie  = movies.find(m => m._id === showtime.movieId);
                      const cinema = cinemas.find(c => c._id === showtime.cinemaId);
                      return (
                          <TableRow
                              className={classes.tableRow}
                              hover
                              key={showtime._id}
                              selected={selectedShowtimes.indexOf(showtime._id) !== -1}>
                            <TableCell className={classes.tableCell}>
                              <div className={classes.tableCellInner}>
                                <Checkbox
                                    checked={
                                        selectedShowtimes.indexOf(showtime._id) !== -1
                                    }
                                    color="primary"
                                    onChange={() => onSelectShowtime(showtime._id)}
                                    value="true"
                                />
                                <Typography
                                    className={classes.nameText}
                                    variant="body1">
                                  {showtime._id}
                                </Typography>
                              </div>
                            </TableCell>
                            <TableCell  className={classes.tableCell}>
                              {movie ? movie.title : '—'}
                            </TableCell>
                            <TableCell className={classes.tableCell}>
                              {cinema ? cinema.name : '—'}
                            </TableCell>
                            <TableCell className={classes.tableCell}>
                              {moment(showtime.startDate).format('DD/MM/YYYY')}
                            </TableCell>
                            <TableCell className={classes.tableCell}>
                              {moment(showtime.endDate).format('DD/MM/YYYY')}
                            </TableCell>
                            <TableCell className={classes.tableCell}>
                              {showtime.startAt}
                            </TableCell>
                          </TableRow>
                      )
                    })}
              </TableBody>
            </Table>
            <TablePagination
                backIconButtonProps={{
                  'aria-label': 'Previous Page'
                }}
                component="div"
                count={showtimes.length}
                nextIconButtonProps={{
                  'aria-label': 'Next Page'
                }}
                onChangePage={this.handleChangePage}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
          </PortletContent>
        </Portlet>
    );
  }
}

ShowtimesTable.propTypes = {
  classes: PropTypes.object.isRequired,
  showtimes: PropTypes.array.isRequired,
  movies: PropTypes.array.isRequired,
  cinemas: PropTypes.array.isRequired,
  selectedShowtimes: PropTypes.array.isRequired,
  onSelectShowtime: PropTypes.func.isRequired
};

const mapStateToProps = ({ movieState, cinemaState, showtimeState }) => ({
  movies: movieState.movies,
  cinemas: cinemaState.cinemas,
  showtimes: showtimeState.showtimes
});

export default connect(
    mapStateToProps,
    null
)(withStyles(styles)(ShowtimesTable))
