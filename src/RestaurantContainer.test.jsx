import { render, fireEvent } from '@testing-library/react';

import { useDispatch, useSelector } from 'react-redux';

import RestaurantContainer from './RestaurantContainer';

describe('RestaurantContainer', () => {
  const dispatch = jest.fn();

  function renderRestaurantContainer() {
    return render(<RestaurantContainer restaurantId="1" />);
  }

  useDispatch.mockImplementation(() => dispatch);

  useSelector.mockImplementation((selector) => selector({
    restaurant: given.restaurant,
    accessToken: given.accessToken,
    reviewFields: given.reviewFields,
    errorMessage: given.errorMessage,
  }));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('dispatches action', () => {
    renderRestaurantContainer();

    expect(dispatch).toBeCalled();
  });

  context('with restaurant', () => {
    given('restaurant', () => ({
      id: 1,
      name: '마법사주방',
      address: '서울시 강남구',
    }));

    it('renders name and address', () => {
      const { container } = renderRestaurantContainer();

      expect(container).toHaveTextContent('마법사주방');
      expect(container).toHaveTextContent('서울시');
    });
  });

  context('without restaurant', () => {
    given('restaurant', () => null);

    it('renders loading', () => {
      const { container } = renderRestaurantContainer();

      expect(container).toHaveTextContent('Loading');
    });
  });

  context('when logged-in', () => {
    given('restaurant', () => ({
      id: 1,
      name: '마법사주방',
      address: '서울시 강남구',
    }));

    given('accessToken', () => 'TOKEN');

    given('reviewFields', () => ({
      score: 3,
      description: '맛있어요',
    }));

    it('renders review form', () => {
      const { queryByLabelText } = renderRestaurantContainer();

      expect(queryByLabelText('평점')).not.toBeNull();
      expect(queryByLabelText('리뷰 내용')).not.toBeNull();
    });

    it('calls dispatch', () => {
      const { getByText, getByLabelText } = renderRestaurantContainer();

      fireEvent.click(getByText('리뷰 남기기'));

      expect(dispatch).toBeCalledTimes(2);

      fireEvent.change(getByLabelText('평점'), { target: { value: 5 } });

      expect(dispatch).toBeCalledWith({
        type: 'changeReviewFields',
        payload: {
          reviewFields: {
            name: 'score',
            value: '5',
          },
        },
      });
    });
  });

  context('when logged-out', () => {
    given('restaurant', () => ({
      id: 1,
      name: '마법사주방',
      address: '서울시 강남구',
    }));

    given('accessToken', () => '');

    it("doesn't render review form", () => {
      const { queryByLabelText } = renderRestaurantContainer();

      expect(queryByLabelText('평점')).toBeNull();
      expect(queryByLabelText('리뷰 내용')).toBeNull();
    });
  });

  context('when the error is thrown', () => {
    given('restaurant', () => ({
      id: 1,
      name: '마법사주방',
      address: '서울시 강남구',
    }));

    given('accessToken', () => 'TOKEN');

    given('reviewFields', () => ({
      score: 3,
      description: '맛있어요',
    }));

    given('errorMessage', () => 'Error');

    it('renders the error message', () => {
      const { container } = renderRestaurantContainer();

      expect(container).toHaveTextContent('Error');
    });
  });
});
