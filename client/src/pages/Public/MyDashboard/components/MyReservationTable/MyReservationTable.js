import React, { Component } from 'react';
import QRCodeLib from 'qrcode';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles, Button } from '@material-ui/core';
import jsPDF from 'jspdf';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination
} from '@material-ui/core';

import { Portlet, PortletContent } from '../../../../../components';
import styles from './styles';

class ReservationsTable extends Component {
  state = {
    rowsPerPage: 10,
    page: 0
  };

  static propTypes = {
    className: PropTypes.string,
    classes: PropTypes.object.isRequired,
    reservations: PropTypes.array.isRequired,
    movies: PropTypes.array.isRequired,
    cinemas: PropTypes.array.isRequired
  };

  static defaultProps = {
    reservations: [],
    movies: [],
    cinemas: []
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  onFindAttr = (id, list, attr) => {
    const item = list.find(item => item._id === id);
    return item ? item[attr] : `Не найдено ${attr}`;
  };

  generatePDF = async reservation => {
    const { movies, cinemas } = this.props;
    const movieTitle = this.onFindAttr(reservation.movieId, movies, 'title');
    const cinemaName = this.onFindAttr(reservation.cinemaId, cinemas, 'name');
    const dateStr = new Date(reservation.date).toLocaleDateString('ru-RU');
    const timeStr = reservation.startAt;

    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCodeLib.toDataURL(reservation._id);
    } catch (err) {
      console.error('Не удалось сгенерировать QR:', err);
    }

    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(movieTitle, 20, 20);
    doc.setFontSize(16);
    doc.text(cinemaName, 20, 30);
    doc.text(`Дата: ${dateStr}  Время: ${timeStr}`, 20, 40);

    if (qrDataUrl) {
      // формат PNG в DataURI автоматически, поэтому используем 'PNG'
      doc.addImage(qrDataUrl, 'PNG', 15, 50, 160, 160);
    }

    doc.save(`${movieTitle}-${dateStr}.pdf`);
  };

  render() {
    const { classes, className, reservations, movies, cinemas } = this.props;
    const { rowsPerPage, page } = this.state;
    const rootClassName = classNames(classes.root, className);

    return (
      <Portlet className={rootClassName}>
        <PortletContent noPadding>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="left">Фильм</TableCell>
                <TableCell align="left">Кинотеатр</TableCell>
                <TableCell align="left">Дата</TableCell>
                <TableCell align="left">Начало</TableCell>
                <TableCell align="left">Стоимость билета</TableCell>
                <TableCell align="left">Итого</TableCell>
                <TableCell align="left">Билеты</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(reservation => (
                  <TableRow
                    className={classes.tableRow}
                    hover
                    key={reservation._id}>
                    <TableCell className={classes.tableCell}>
                      {this.onFindAttr(reservation.movieId, movies, 'title')}
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      {this.onFindAttr(reservation.cinemaId, cinemas, 'name')}
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      {new Date(reservation.date).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      {reservation.startAt}
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      {reservation.ticketPrice} ₽
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      {reservation.total} ₽
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => this.generatePDF(reservation)}
                      >
                        Скачать
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            backIconButtonProps={{ 'aria-label': 'Предыдущая страница' }}
            component="div"
            count={reservations.length}
            nextIconButtonProps={{ 'aria-label': 'Следующая страница' }}
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

export default withStyles(styles)(ReservationsTable);
