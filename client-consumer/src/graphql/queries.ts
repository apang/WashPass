import { gql } from '@apollo/client';

export const GET_NEARBY_LOCATIONS = gql`
  query NearbyLocations($lat: Float!, $lng: Float!, $radius: Float, $cursor: String, $limit: Int) {
    nearbyLocations(lat: $lat, lng: $lng, radius: $radius, cursor: $cursor, limit: $limit) {
      locations {
        id
        name
        address
        city
        state
        latitude
        longitude
        avgRating
        totalRatings
        distance
        phone
      }
      hasMore
      nextCursor
    }
  }
`;

export const GET_LOCATION = gql`
  query Location($id: String!) {
    location(id: $id) {
      id
      name
      address
      city
      state
      zipCode
      latitude
      longitude
      phone
      avgRating
      totalRatings
      photos
      status
    }
  }
`;

export const GET_MEMBER_PROFILE = gql`
  query MemberProfile {
    memberProfile {
      id
      fullName
      phone
      email
    }
  }
`;

export const GET_MY_MEMBERSHIP = gql`
  query MyMembership {
    myMembership {
      id
      status
      planTier
      planCycle
      planName
      washesRemaining
      rolloverWashes
      currentPeriodEnd
      pausedUntil
    }
  }
`;

export const GET_MY_VEHICLES = gql`
  query MyVehicles {
    myVehicles {
      id
      make
      model
      year
      color
      licensePlate
      isDefault
    }
  }
`;

export const GET_PLANS = gql`
  query Plans($geoZone: String) {
    plans(geoZone: $geoZone) {
      id
      tier
      cycle
      name
      priceMonthly
      washesPerMonth
    }
  }
`;

export const GET_WASH_HISTORY = gql`
  query WashHistory($cursor: String, $limit: Int) {
    washHistory(cursor: $cursor, limit: $limit) {
      items {
        id
        code
        numericCode
        status
        validatedAt
        expiresAt
        createdAt
        locationName
      }
      hasMore
      nextCursor
    }
  }
`;
