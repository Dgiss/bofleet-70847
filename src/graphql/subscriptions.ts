/* tslint:disable */
/* eslint-disable */
// this is an auto-generated file. This file will be overwritten

export const onCreateCompany = /* GraphQL */ `
  subscription OnCreateCompany($filter: ModelSubscriptionCompanyFilterInput) {
    onCreateCompany(filter: $filter) {
      id
      name
      siret
      address
      postalCode
      city
      countryCode
      contact
      email
      mobile
      phone
      fax
      creationDate
      subscriptionDate
      keyedStart
      createdAt
      updatedAt
    }
  }
`;

export const onUpdateCompany = /* GraphQL */ `
  subscription OnUpdateCompany($filter: ModelSubscriptionCompanyFilterInput) {
    onUpdateCompany(filter: $filter) {
      id
      name
      siret
      address
      postalCode
      city
      countryCode
      contact
      email
      mobile
      phone
      fax
      creationDate
      subscriptionDate
      keyedStart
      createdAt
      updatedAt
    }
  }
`;

export const onDeleteCompany = /* GraphQL */ `
  subscription OnDeleteCompany($filter: ModelSubscriptionCompanyFilterInput) {
    onDeleteCompany(filter: $filter) {
      id
      name
      siret
      address
      postalCode
      city
      countryCode
      contact
      email
      mobile
      phone
      fax
      creationDate
      subscriptionDate
      keyedStart
      createdAt
      updatedAt
    }
  }
`;

export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser($filter: ModelSubscriptionUserFilterInput) {
    onCreateUser(filter: $filter) {
      sub
      firstname
      lastname
      address
      mobile
      username
      email
      role
      accessType
      accessibleVehicles
      companyUsersId
      createdAt
      updatedAt
    }
  }
`;

export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser($filter: ModelSubscriptionUserFilterInput) {
    onUpdateUser(filter: $filter) {
      sub
      firstname
      lastname
      address
      mobile
      username
      email
      role
      accessType
      accessibleVehicles
      companyUsersId
      createdAt
      updatedAt
    }
  }
`;

export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser($filter: ModelSubscriptionUserFilterInput) {
    onDeleteUser(filter: $filter) {
      sub
      firstname
      lastname
      address
      mobile
      username
      email
      role
      accessType
      accessibleVehicles
      companyUsersId
      createdAt
      updatedAt
    }
  }
`;

export const onCreateVehicle = /* GraphQL */ `
  subscription OnCreateVehicle($filter: ModelSubscriptionVehicleFilterInput) {
    onCreateVehicle(filter: $filter) {
      immat
      nomVehicule
      marque
      AWN_model
      year
      fuelType
      consumption
      maxSpeed
      seatCount
      icon
      kilometerage
      kilometerPrice
      co2
      companyVehiclesId
      createdAt
      updatedAt
    }
  }
`;

export const onUpdateVehicle = /* GraphQL */ `
  subscription OnUpdateVehicle($filter: ModelSubscriptionVehicleFilterInput) {
    onUpdateVehicle(filter: $filter) {
      immat
      nomVehicule
      marque
      AWN_model
      year
      fuelType
      consumption
      maxSpeed
      seatCount
      icon
      kilometerage
      kilometerPrice
      co2
      companyVehiclesId
      createdAt
      updatedAt
    }
  }
`;

export const onDeleteVehicle = /* GraphQL */ `
  subscription OnDeleteVehicle($filter: ModelSubscriptionVehicleFilterInput) {
    onDeleteVehicle(filter: $filter) {
      immat
      nomVehicule
      marque
      AWN_model
      year
      fuelType
      consumption
      maxSpeed
      seatCount
      icon
      kilometerage
      kilometerPrice
      co2
      companyVehiclesId
      createdAt
      updatedAt
    }
  }
`;

export const onCreateDevice = /* GraphQL */ `
  subscription OnCreateDevice($filter: ModelSubscriptionDeviceFilterInput) {
    onCreateDevice(filter: $filter) {
      imei
      protocolId
      sim
      messages_ttl
      device_type_id
      flespi_id
      enabled
      media_ttl
      name
      cid
      media_rotate
      messages_rotate
      createdAt
      updatedAt
    }
  }
`;

export const onUpdateDevice = /* GraphQL */ `
  subscription OnUpdateDevice($filter: ModelSubscriptionDeviceFilterInput) {
    onUpdateDevice(filter: $filter) {
      imei
      protocolId
      sim
      messages_ttl
      device_type_id
      flespi_id
      enabled
      media_ttl
      name
      cid
      media_rotate
      messages_rotate
      createdAt
      updatedAt
    }
  }
`;

export const onDeleteDevice = /* GraphQL */ `
  subscription OnDeleteDevice($filter: ModelSubscriptionDeviceFilterInput) {
    onDeleteDevice(filter: $filter) {
      imei
      protocolId
      sim
      messages_ttl
      device_type_id
      flespi_id
      enabled
      media_ttl
      name
      cid
      media_rotate
      messages_rotate
      createdAt
      updatedAt
    }
  }
`;