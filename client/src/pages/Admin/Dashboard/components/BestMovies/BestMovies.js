import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import { makeStyles } from '@material-ui/styles';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Button,
  Typography
} from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import palette from '../../../../../theme/palette';
import { options } from './chart';

const useStyles = makeStyles(() => ({
  root: {},
  chartContainer: {
    height: 400,
    position: 'relative'
  },
  actions: {
    justifyContent: 'flex-end'
  }
}));

const BestMovies = ({ className, bestMovies = [] }) => {
  const classes = useStyles();

  // Отфильтровать записи с валидными данными
  const validEntries = Array.isArray(bestMovies)
    ? bestMovies.filter(
      entry => entry && entry.movie && entry.movie.title && typeof entry.count === 'number'
    )
    : [];

  // Если нет данных — вывести сообщение
  if (validEntries.length === 0) {
    return (
      <Card className={classnames(classes.root, className)}>
        <CardHeader
          action={
            <Button size="small" variant="text">
              Топ 5<ArrowDropDownIcon />
            </Button>
          }
          title="Лучшие фильмы"
        />
        <Divider />
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            Нет данных для отображения
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const labels = validEntries.map(entry => entry.movie.title.toUpperCase());
  const currentYearData = validEntries.map(entry => entry.count);
  // Замените массив прошлогодних данных на реальные, если доступны
  const lastYearData = validEntries.map(() => 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Текущий год',
        backgroundColor: palette.primary.main,
        data: currentYearData
      },
      {
        label: 'Прошлый год',
        backgroundColor: palette.neutral,
        data: lastYearData
      }
    ]
  };

  return (
    <Card className={classnames(classes.root, className)}>
      <CardHeader
        action={
          <Button size="small" variant="text">
            Топ 5<ArrowDropDownIcon />
          </Button>
        }
        title="Лучшие фильмы"
      />
      <Divider />
      <CardContent>
        <div className={classes.chartContainer}>
          <Bar data={data} options={options} />
        </div>
      </CardContent>
      <Divider />
      <CardActions className={classes.actions}>
        <Button color="primary" size="small" variant="text">
          Обзор <ArrowRightIcon />
        </Button>
      </CardActions>
    </Card>
  );
};

BestMovies.propTypes = {
  className: PropTypes.string,
  bestMovies: PropTypes.arrayOf(
    PropTypes.shape({
      movie: PropTypes.shape({
        title: PropTypes.string.isRequired
      }).isRequired,
      count: PropTypes.number.isRequired
    })
  )
};

export default BestMovies;
