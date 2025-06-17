import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';

import { Grid, GridList, Typography } from '@material-ui/core';
import styles from './styles';
import MovieCard from '../../pages/Public/MoviePage/components/MovieCard/MovieCard';

const LatestMovieList = props => {
  const { classes, movies } = props;

  return (
    <Container maxWidth="xl" className={classes.container}>
      <Grid
        className={classes.fullHeight}
        container
        alignItems="center"
        spacing={1}>
        <Grid item md={3} xs={12}>
          <div className={classes.title}>
            <Typography className={classes.h2} variant="h2" color="inherit">
              Последние фильмы
            </Typography>
            <Typography className={classes.h4} variant="h4" color="inherit">
              Охват января и июня 2025 года
            </Typography>
          </div>
        </Grid>
        <Grid item md={9} xs={12}>
          <GridList className={classes.gridList} cols={2.5}>
            {movies.map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </GridList>
        </Grid>
      </Grid>
    </Container>
  );
};

LatestMovieList.propTypes = {
  className: PropTypes.string,
  classes: PropTypes.object.isRequired,
  movies: PropTypes.array.isRequired
};

export default withStyles(styles)(LatestMovieList);
