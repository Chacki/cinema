import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles, Typography } from '@material-ui/core';
import { Button, TextField, MenuItem } from '@material-ui/core';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';

import styles from './styles';
import { addShowtime, updateShowtime } from '../../../../../store/actions';

class AddShowtime extends Component {
  state = {
    startAt: '',
    startDate: null,
    endDate: null,
    movieId: '',
    cinemaId: ''
  };

  componentDidMount() {
    if (this.props.selectedShowtime) {
      const {
        startAt,
        startDate,
        endDate,
        movieId,
        cinemaId
      } = this.props.selectedShowtime;
      this.setState({
        startAt,
        startDate,
        endDate,
        movieId,
        cinemaId
      });
    }
  }

  handleChange = e => {
    this.setState({
      state: e.target.value
    });
  };

  handleFieldChange = (field, value) => {
    const newState = { ...this.state };
    newState[field] = value;
    this.setState(newState);
  };

  onAddShowtime = () => {
    const { startAt, startDate, endDate, movieId, cinemaId } = this.state;
    const showtime = {
      startAt,
      startDate,
      endDate,
      movieId,
      cinemaId
    };
    this.props.addShowtime(showtime);
  };

  onUpdateShowtime = () => {
    const { startAt, startDate, endDate, movieId, cinemaId } = this.state;
    const showtime = {
      startAt,
      startDate,
      endDate,
      movieId,
      cinemaId
    };
    this.props.updateShowtime(showtime, this.props.selectedShowtime._id);
  };

  onFilterMinDate = () => {
    const { nowShowing } = this.props;
    const { movieId } = this.state;
    const selectedMovie = nowShowing.find(movie => movie._id === movieId);
    if (selectedMovie) return selectedMovie.startDate;
    return new Date();
  };

  onFilterMaxDate = () => {
    const { nowShowing } = this.props;
    const { movieId } = this.state;
    const selectedMovie = nowShowing.find(movie => movie._id === movieId);
    if (selectedMovie) return new Date(selectedMovie.endDate);
    return false;
  };

  render() {
    const { nowShowing, cinemas, classes, className } = this.props;
    const { startAt, startDate, endDate, movieId, cinemaId } = this.state;

    const rootClassName = classNames(classes.root, className);
    const title = this.props.selectedShowtime
        ? 'Редактировать сеанс'
        : 'Добавить сеанс';
    const submitButton = this.props.selectedShowtime
        ? 'Обновить сеанс'
        : 'Сохранить';
    const submitAction = this.props.selectedShowtime
        ? () => this.onUpdateShowtime()
        : () => this.onAddShowtime();

    return (
        <div className={rootClassName}>
          <Typography variant="h4" className={classes.title}>
            {title}
          </Typography>
          <form autoComplete="off" noValidate>
            <div className={classes.field}>
              <TextField
                  fullWidth
                  select
                  className={classes.textField}
                  helperText="Пожалуйста, выберите время"
                  label="Время"
                  margin="dense"
                  required
                  value={startAt}
                  variant="outlined"
                  onChange={event =>
                      this.handleFieldChange('startAt', event.target.value)
                  }>
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = String(i).padStart(2, '0');
                  return `${hour}:00`;
                }).map(time => (
                    <MenuItem key={time} value={time}>
                      {time}
                    </MenuItem>
                ))}
              </TextField>
            </div>
            <div className={classes.field}>
              <TextField
                  fullWidth
                  select
                  label="Фильм"
                  margin="dense"
                  required
                  value={movieId}
                  variant="outlined"
                  onChange={event =>
                      this.handleFieldChange('movieId', event.target.value)
                  }
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: {
                          maxHeight: 48 * 8 + 8,
                        }
                      }
                    }
                  }}
              >
                {nowShowing.map(movie => (
                    <MenuItem key={movie._id} value={movie._id}>
                      {movie.title}
                    </MenuItem>
                ))}
              </TextField>

              <TextField
                  fullWidth
                  select
                  className={classes.textField}
                  label="Кинотеатр"
                  margin="dense"
                  required
                  value={cinemaId}
                  variant="outlined"
                  onChange={event =>
                      this.handleFieldChange('cinemaId', event.target.value)
                  }
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: {
                          maxHeight: 48 * 8 + 8,
                        }
                      }
                    }
                  }}
              >
                {cinemas.map(cinema => (
                    <MenuItem key={cinema._id} value={cinema._id}>
                      {cinema.name}
                    </MenuItem>
                ))}
              </TextField>
            </div>

          <div className={classes.field}>
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <KeyboardDatePicker
                className={classes.textField}
                inputVariant="outlined"
                margin="normal"
                id="start-date"
                label="Дата начала"
                minDate={new Date()}
                maxDate={this.onFilterMaxDate()}
                value={startDate}
                onChange={date => this.handleFieldChange('startDate', date._d)}
                KeyboardButtonProps={{
                  'aria-label': 'change date'
                }}
              />

              <KeyboardDatePicker
                className={classes.textField}
                inputVariant="outlined"
                margin="normal"
                id="end-date"
                label="Дата окончания"
                minDate={new Date(startDate)}
                maxDate={this.onFilterMaxDate()}
                value={endDate}
                onChange={date => this.handleFieldChange('endDate', date._d)}
                KeyboardButtonProps={{
                  'aria-label': 'change date'
                }}
              />
            </MuiPickersUtilsProvider>
          </div>
        </form>

        <Button
          className={classes.buttonFooter}
          color="primary"
          variant="contained"
          onClick={submitAction}>
          {submitButton}
        </Button>
      </div>
    );
  }
}

AddShowtime.propTypes = {
  className: PropTypes.string,
  classes: PropTypes.object.isRequired
};

const mapStateToProps = ({ movieState, cinemaState }) => ({
  movies: movieState.movies,
  nowShowing: movieState.nowShowing,
  cinemas: cinemaState.cinemas
});

const mapDispatchToProps = { addShowtime, updateShowtime };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AddShowtime));
