import { gql } from '@apollo/client';

export const GENERATE_REDEMPTION_CODE = gql`
  mutation GenerateRedemptionCode($locationId: String!) {
    generateRedemptionCode(locationId: $locationId) {
      code
      numericCode
      qrDataUrl
      expiresAt
    }
  }
`;

export const ADD_VEHICLE = gql`
  mutation AddVehicle($input: CreateVehicleInput!) {
    addVehicle(input: $input) {
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

export const REMOVE_VEHICLE = gql`
  mutation RemoveVehicle($vehicleId: String!) {
    removeVehicle(vehicleId: $vehicleId) {
      id
    }
  }
`;

export const SUBSCRIBE = gql`
  mutation Subscribe($planId: String!) {
    subscribe(planId: $planId) {
      checkoutUrl
      sessionId
    }
  }
`;

export const PAUSE_MEMBERSHIP = gql`
  mutation PauseMembership($durationDays: Int) {
    pauseMembership(durationDays: $durationDays) {
      id
      status
      pausedUntil
    }
  }
`;

export const CANCEL_MEMBERSHIP = gql`
  mutation CancelMembership {
    cancelMembership {
      id
      status
    }
  }
`;

export const SUBMIT_RATING = gql`
  mutation SubmitRating($redemptionId: String!, $stars: Int!, $text: String) {
    submitRating(redemptionId: $redemptionId, stars: $stars, text: $text) {
      id
      stars
      text
    }
  }
`;

export const REPORT_ISSUE = gql`
  mutation ReportIssue($redemptionId: String!, $type: String!, $description: String!, $photos: [String!]) {
    reportIssue(redemptionId: $redemptionId, type: $type, description: $description, photos: $photos) {
      id
      status
    }
  }
`;
