/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const executeCustomAction = /* GraphQL */ `
  mutation ExecuteCustomAction(
    $operation: CustomActionOperation!
    $request: AWSJSON!
  ) {
    executeCustomAction(operation: $operation, request: $request) {
      status
      message
      __typename
    }
  }
`;
export const createCompany = /* GraphQL */ `
  mutation CreateCompany(
    $input: CreateCompanyInput!
    $condition: ModelCompanyConditionInput
  ) {
    createCompany(input: $input, condition: $condition) {
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
      users {
        items {
          sub
          firstname
          lastname
          mobile
          beginDate
          endDate
          mappingId
          languageCode
          lastModificationDate
          showReport
          dispatcher
          applicationVersion
          themeId
          picture {
            bucket
            region
            key
            __typename
          }
          companyUsersId
          company {
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
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        nextToken
        __typename
      }
      vehicles {
        items {
          immat
          year
          fuelType
          consumption
          maxSpeed
          seatCount
          icon
          picture {
            bucket
            region
            key
            __typename
          }
          kilometerage
          kilometerPrice
          kilometerageStart
          kilometerageDay
          kilometerageLastUpdate
          timeRunning
          counterValue
          co2
          lastModificationDate
          rollingTimeStart
          rollingTimeDay
          locations
          installationPrecautions
          code
          vehicleCategory {
            id
            category
            description
            createdAt
            updatedAt
            __typename
          }
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          modele {
            id
            modele
            createdAt
            updatedAt
            vehicleBrandModelsBrandName
            __typename
          }
          gefcoSend
          tankCapacity
          canMileage
          companyVehiclesId
          company {
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
            __typename
          }
          device {
            imei
            protocolId
            sim
            createdAt
            updatedAt
            deviceVehicleImmat
            __typename
          }
          alerts {
            nextToken
            __typename
          }
          tags {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          vehicleVehicleCategoryId
          vehicleBrandBrandName
          vehicleModeleId
          vehicleDeviceImei
          __typename
        }
        nextToken
        __typename
      }
      drivers {
        items {
          sub
          firstname
          lastname
          fullname
          birthDate
          drivingLicenseNumber
          drivingLicenseType
          job
          hiringDate
          comment
          driverKey
          email
          mobile
          lastModificationDate
          code
          address
          agencyId
          cdc
          pdm
          nni
          companyDriversId
          company {
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
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        nextToken
        __typename
      }
      trames {
        items {
          id
          speed
          lat
          lng
          address
          azimut
          immobilisation
          timestamp
          state
          fuel
          ibuttonCode
          companyId
          driverFullName
          vehicleBrandName
          companyTramesId
          company {
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
            __typename
          }
          driver {
            sub
            firstname
            lastname
            fullname
            birthDate
            drivingLicenseNumber
            drivingLicenseType
            job
            hiringDate
            comment
            driverKey
            email
            mobile
            lastModificationDate
            code
            address
            agencyId
            cdc
            pdm
            nni
            companyDriversId
            createdAt
            updatedAt
            __typename
          }
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          processor
          createdAt
          updatedAt
          trameDriverSub
          trameVehicleImmat
          __typename
        }
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateCompany = /* GraphQL */ `
  mutation UpdateCompany(
    $input: UpdateCompanyInput!
    $condition: ModelCompanyConditionInput
  ) {
    updateCompany(input: $input, condition: $condition) {
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
      haveAntai
      hasAntaiSubscription
      users {
        items {
          sub
          firstname
          lastname
          mobile
          beginDate
          endDate
          mappingId
          languageCode
          lastModificationDate
          showReport
          dispatcher
          applicationVersion
          themeId
          picture {
            bucket
            region
            key
            __typename
          }
          companyUsersId
          company {
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
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        nextToken
        __typename
      }
      vehicles {
        items {
          immat
          year
          fuelType
          consumption
          maxSpeed
          seatCount
          icon
          picture {
            bucket
            region
            key
            __typename
          }
          kilometerage
          kilometerPrice
          kilometerageStart
          kilometerageDay
          kilometerageLastUpdate
          timeRunning
          counterValue
          co2
          lastModificationDate
          rollingTimeStart
          rollingTimeDay
          locations
          installationPrecautions
          code
          vehicleCategory {
            id
            category
            description
            createdAt
            updatedAt
            __typename
          }
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          modele {
            id
            modele
            createdAt
            updatedAt
            vehicleBrandModelsBrandName
            __typename
          }
          gefcoSend
          tankCapacity
          canMileage
          companyVehiclesId
          company {
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
            __typename
          }
          device {
            imei
            protocolId
            sim
            createdAt
            updatedAt
            deviceVehicleImmat
            __typename
          }
          alerts {
            nextToken
            __typename
          }
          tags {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          vehicleVehicleCategoryId
          vehicleBrandBrandName
          vehicleModeleId
          vehicleDeviceImei
          __typename
        }
        nextToken
        __typename
      }
      drivers {
        items {
          sub
          firstname
          lastname
          fullname
          birthDate
          drivingLicenseNumber
          drivingLicenseType
          job
          hiringDate
          comment
          driverKey
          email
          mobile
          lastModificationDate
          code
          address
          agencyId
          cdc
          pdm
          nni
          companyDriversId
          company {
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
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        nextToken
        __typename
      }
      trames {
        items {
          id
          speed
          lat
          lng
          address
          azimut
          immobilisation
          timestamp
          state
          fuel
          ibuttonCode
          companyId
          driverFullName
          vehicleBrandName
          companyTramesId
          company {
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
            __typename
          }
          driver {
            sub
            firstname
            lastname
            fullname
            birthDate
            drivingLicenseNumber
            drivingLicenseType
            job
            hiringDate
            comment
            driverKey
            email
            mobile
            lastModificationDate
            code
            address
            agencyId
            cdc
            pdm
            nni
            companyDriversId
            createdAt
            updatedAt
            __typename
          }
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          processor
          createdAt
          updatedAt
          trameDriverSub
          trameVehicleImmat
          __typename
        }
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteCompany = /* GraphQL */ `
  mutation DeleteCompany(
    $input: DeleteCompanyInput!
    $condition: ModelCompanyConditionInput
  ) {
    deleteCompany(input: $input, condition: $condition) {
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
      __typename
    }
  }
`;
export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
      sub
      firstname
      lastname
      mobile
      password
      username
      beginDate
      endDate
      mappingId
      languageCode
      lastModificationDate
      showReport
      dispatcher
      applicationVersion
      themeId
      picture {
        bucket
        region
        key
        __typename
      }
      companyUsersId
      company {
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
        users {
          items {
            sub
            firstname
            lastname
            mobile
            beginDate
            endDate
            mappingId
            languageCode
            lastModificationDate
            showReport
            dispatcher
            applicationVersion
            themeId
            companyUsersId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        vehicles {
          items {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          nextToken
          __typename
        }
        drivers {
          items {
            sub
            firstname
            lastname
            fullname
            birthDate
            drivingLicenseNumber
            drivingLicenseType
            job
            hiringDate
            comment
            driverKey
            email
            mobile
            lastModificationDate
            code
            address
            agencyId
            cdc
            pdm
            nni
            companyDriversId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        trames {
          items {
            id
            speed
            lat
            lng
            address
            azimut
            immobilisation
            timestamp
            state
            fuel
            ibuttonCode
            companyId
            driverFullName
            vehicleBrandName
            companyTramesId
            processor
            createdAt
            updatedAt
            trameDriverSub
            trameVehicleImmat
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
      sub
      firstname
      lastname
      mobile
      password
      username
      beginDate
      endDate
      mappingId
      languageCode
      lastModificationDate
      showReport
      dispatcher
      applicationVersion
      themeId
      picture {
        bucket
        region
        key
        __typename
      }
      companyUsersId
      company {
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
        users {
          items {
            sub
            firstname
            lastname
            mobile
            beginDate
            endDate
            mappingId
            languageCode
            lastModificationDate
            showReport
            dispatcher
            applicationVersion
            themeId
            companyUsersId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        vehicles {
          items {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          nextToken
          __typename
        }
        drivers {
          items {
            sub
            firstname
            lastname
            fullname
            birthDate
            drivingLicenseNumber
            drivingLicenseType
            job
            hiringDate
            comment
            driverKey
            email
            mobile
            lastModificationDate
            code
            address
            agencyId
            cdc
            pdm
            nni
            companyDriversId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        trames {
          items {
            id
            speed
            lat
            lng
            address
            azimut
            immobilisation
            timestamp
            state
            fuel
            ibuttonCode
            companyId
            driverFullName
            vehicleBrandName
            companyTramesId
            processor
            createdAt
            updatedAt
            trameDriverSub
            trameVehicleImmat
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
      sub
      firstname
      lastname
      mobile
      password
      username
      beginDate
      endDate
      mappingId
      languageCode
      lastModificationDate
      showReport
      dispatcher
      applicationVersion
      themeId
      picture {
        bucket
        region
        key
        __typename
      }
      companyUsersId
      # company {
      #   id
      #   name
      #   siret
      #   address
      #   postalCode
      #   city
      #   countryCode
      #   contact
      #   email
      #   mobile
      #   phone
      #   fax
      #   creationDate
      #   subscriptionDate
      #   keyedStart
      #   users {
      #     items {
      #       sub
      #       firstname
      #       lastname
      #       mobile
      #       beginDate
      #       endDate
      #       mappingId
      #       languageCode
      #       lastModificationDate
      #       showReport
      #       dispatcher
      #       applicationVersion
      #       themeId
      #       companyUsersId
      #       createdAt
      #       updatedAt
      #       __typename
      #     }
      #     nextToken
      #     __typename
      #   }
      #   vehicles {
      #     items {
      #       immat
      #       year
      #       fuelType
      #       consumption
      #       maxSpeed
      #       seatCount
      #       icon
      #       kilometerage
      #       kilometerPrice
      #       kilometerageStart
      #       kilometerageDay
      #       kilometerageLastUpdate
      #       timeRunning
      #       counterValue
      #       co2
      #       lastModificationDate
      #       rollingTimeStart
      #       rollingTimeDay
      #       locations
      #       installationPrecautions
      #       code
      #       gefcoSend
      #       tankCapacity
      #       canMileage
      #       companyVehiclesId
      #       createdAt
      #       updatedAt
      #       vehicleVehicleCategoryId
      #       vehicleBrandBrandName
      #       vehicleModeleId
      #       vehicleDeviceImei
      #       __typename
      #     }
      #     nextToken
      #     __typename
      #   }
      #   drivers {
      #     items {
      #       sub
      #       firstname
      #       lastname
      #       fullname
      #       birthDate
      #       drivingLicenseNumber
      #       drivingLicenseType
      #       job
      #       hiringDate
      #       comment
      #       driverKey
      #       email
      #       mobile
      #       lastModificationDate
      #       code
      #       address
      #       agencyId
      #       cdc
      #       pdm
      #       nni
      #       companyDriversId
      #       createdAt
      #       updatedAt
      #       __typename
      #     }
      #     nextToken
      #     __typename
      #   }
      #   trames {
      #     items {
      #       id
      #       speed
      #       lat
      #       lng
      #       address
      #       azimut
      #       immobilisation
      #       timestamp
      #       state
      #       fuel
      #       ibuttonCode
      #       companyId
      #       driverFullName
      #       vehicleBrandName
      #       companyTramesId
      #       processor
      #       createdAt
      #       updatedAt
      #       trameDriverSub
      #       trameVehicleImmat
      #       __typename
      #     }
      #     nextToken
      #     __typename
      #   }
      #   createdAt
      #   updatedAt
      #   __typename
      # }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createDriver = /* GraphQL */ `
  mutation CreateDriver(
    $input: CreateDriverInput!
    $condition: ModelDriverConditionInput
  ) {
    createDriver(input: $input, condition: $condition) {
      sub
      firstname
      lastname
      fullname
      birthDate
      drivingLicenseNumber
      drivingLicenseType
      job
      hiringDate
      comment
      driverKey
      email
      mobile
      lastModificationDate
      code
      address
      agencyId
      cdc
      pdm
      nni
      companyDriversId
      company {
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
        users {
          items {
            sub
            firstname
            lastname
            mobile
            beginDate
            endDate
            mappingId
            languageCode
            lastModificationDate
            showReport
            dispatcher
            applicationVersion
            themeId
            companyUsersId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        vehicles {
          items {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          nextToken
          __typename
        }
        drivers {
          items {
            sub
            firstname
            lastname
            fullname
            birthDate
            drivingLicenseNumber
            drivingLicenseType
            job
            hiringDate
            comment
            driverKey
            email
            mobile
            lastModificationDate
            code
            address
            agencyId
            cdc
            pdm
            nni
            companyDriversId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        trames {
          items {
            id
            speed
            lat
            lng
            address
            azimut
            immobilisation
            timestamp
            state
            fuel
            ibuttonCode
            companyId
            driverFullName
            vehicleBrandName
            companyTramesId
            processor
            createdAt
            updatedAt
            trameDriverSub
            trameVehicleImmat
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateDriver = /* GraphQL */ `
  mutation UpdateDriver(
    $input: UpdateDriverInput!
    $condition: ModelDriverConditionInput
  ) {
    updateDriver(input: $input, condition: $condition) {
      sub
      firstname
      lastname
      fullname
      birthDate
      drivingLicenseNumber
      drivingLicenseType
      job
      hiringDate
      comment
      driverKey
      email
      mobile
      lastModificationDate
      code
      address
      agencyId
      cdc
      pdm
      nni
      companyDriversId
      company {
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
        users {
          items {
            sub
            firstname
            lastname
            mobile
            beginDate
            endDate
            mappingId
            languageCode
            lastModificationDate
            showReport
            dispatcher
            applicationVersion
            themeId
            companyUsersId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        vehicles {
          items {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          nextToken
          __typename
        }
        drivers {
          items {
            sub
            firstname
            lastname
            fullname
            birthDate
            drivingLicenseNumber
            drivingLicenseType
            job
            hiringDate
            comment
            driverKey
            email
            mobile
            lastModificationDate
            code
            address
            agencyId
            cdc
            pdm
            nni
            companyDriversId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        trames {
          items {
            id
            speed
            lat
            lng
            address
            azimut
            immobilisation
            timestamp
            state
            fuel
            ibuttonCode
            companyId
            driverFullName
            vehicleBrandName
            companyTramesId
            processor
            createdAt
            updatedAt
            trameDriverSub
            trameVehicleImmat
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteDriver = /* GraphQL */ `
  mutation DeleteDriver(
    $input: DeleteDriverInput!
    $condition: ModelDriverConditionInput
  ) {
    deleteDriver(input: $input, condition: $condition) {
      sub
      firstname
      lastname
      fullname
      birthDate
      drivingLicenseNumber
      drivingLicenseType
      job
      hiringDate
      comment
      driverKey
      email
      mobile
      lastModificationDate
      code
      address
      agencyId
      cdc
      pdm
      nni
      companyDriversId
      company {
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
        users {
          items {
            sub
            firstname
            lastname
            mobile
            beginDate
            endDate
            mappingId
            languageCode
            lastModificationDate
            showReport
            dispatcher
            applicationVersion
            themeId
            companyUsersId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        vehicles {
          items {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          nextToken
          __typename
        }
        drivers {
          items {
            sub
            firstname
            lastname
            fullname
            birthDate
            drivingLicenseNumber
            drivingLicenseType
            job
            hiringDate
            comment
            driverKey
            email
            mobile
            lastModificationDate
            code
            address
            agencyId
            cdc
            pdm
            nni
            companyDriversId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        trames {
          items {
            id
            speed
            lat
            lng
            address
            azimut
            immobilisation
            timestamp
            state
            fuel
            ibuttonCode
            companyId
            driverFullName
            vehicleBrandName
            companyTramesId
            processor
            createdAt
            updatedAt
            trameDriverSub
            trameVehicleImmat
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createVehicle = /* GraphQL */ `
  mutation CreateVehicle(
    $input: CreateVehicleInput!
    $condition: ModelVehicleConditionInput
  ) {
    createVehicle(input: $input, condition: $condition) {
      immat
      year
      fuelType
      consumption
      maxSpeed
      seatCount
      icon
      picture {
        bucket
        region
        key
        __typename
      }
      kilometerage
      kilometerPrice
      kilometerageStart
      kilometerageDay
      kilometerageLastUpdate
      timeRunning
      counterValue
      co2
      lastModificationDate
      rollingTimeStart
      rollingTimeDay
      locations
      installationPrecautions
      code
      vehicleCategory {
        # id
        # category
        description
        # createdAt
        # updatedAt
        __typename
      }
      brand {
        brandName
        logo {
          bucket
          region
          key
          __typename
        }
        models {
          items {
            id
            modele
            createdAt
            updatedAt
            vehicleBrandModelsBrandName
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      modele {
        id
        modele
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        createdAt
        updatedAt
        vehicleBrandModelsBrandName
        __typename
      }
      gefcoSend
      tankCapacity
      canMileage
      companyVehiclesId
      # company {
      #   id
      #   name
      #   siret
      #   address
      #   postalCode
      #   city
      #   countryCode
      #   contact
      #   email
      #   mobile
      #   phone
      #   fax
      #   creationDate
      #   subscriptionDate
      #   keyedStart
      #   users {
      #     items {
      #       sub
      #       firstname
      #       lastname
      #       mobile
      #       beginDate
      #       endDate
      #       mappingId
      #       languageCode
      #       lastModificationDate
      #       showReport
      #       dispatcher
      #       applicationVersion
      #       themeId
      #       companyUsersId
      #       createdAt
      #       updatedAt
      #       __typename
      #     }
      #     nextToken
      #     __typename
      #   }
      #   vehicles {
      #     items {
      #       immat
      #       year
      #       fuelType
      #       consumption
      #       maxSpeed
      #       seatCount
      #       icon
      #       kilometerage
      #       kilometerPrice
      #       kilometerageStart
      #       kilometerageDay
      #       kilometerageLastUpdate
      #       timeRunning
      #       counterValue
      #       co2
      #       lastModificationDate
      #       rollingTimeStart
      #       rollingTimeDay
      #       locations
      #       installationPrecautions
      #       code
      #       gefcoSend
      #       tankCapacity
      #       canMileage
      #       companyVehiclesId
      #       createdAt
      #       updatedAt
      #       vehicleVehicleCategoryId
      #       vehicleBrandBrandName
      #       vehicleModeleId
      #       vehicleDeviceImei
      #       __typename
      #     }
      #     nextToken
      #     __typename
      #   }
      #   drivers {
      #     items {
      #       sub
      #       firstname
      #       lastname
      #       fullname
      #       birthDate
      #       drivingLicenseNumber
      #       drivingLicenseType
      #       job
      #       hiringDate
      #       comment
      #       driverKey
      #       email
      #       mobile
      #       lastModificationDate
      #       code
      #       address
      #       agencyId
      #       cdc
      #       pdm
      #       nni
      #       companyDriversId
      #       createdAt
      #       updatedAt
      #       __typename
      #     }
      #     nextToken
      #     __typename
      #   }
      #   trames {
      #     items {
      #       id
      #       speed
      #       lat
      #       lng
      #       address
      #       azimut
      #       immobilisation
      #       timestamp
      #       state
      #       fuel
      #       ibuttonCode
      #       companyId
      #       driverFullName
      #       vehicleBrandName
      #       companyTramesId
      #       processor
      #       createdAt
      #       updatedAt
      #       trameDriverSub
      #       trameVehicleImmat
      #       __typename
      #     }
      #     nextToken
      #     __typename
      #   }
      #   createdAt
      #   updatedAt
      #   __typename
      # }
      device {
        # imei
        protocolId
        sim
        vehicle {
          immat
          year
          fuelType
          consumption
          maxSpeed
          seatCount
          icon
          picture {
            bucket
            region
            key
            __typename
          }
          kilometerage
          kilometerPrice
          kilometerageStart
          kilometerageDay
          kilometerageLastUpdate
          timeRunning
          counterValue
          co2
          lastModificationDate
          rollingTimeStart
          rollingTimeDay
          locations
          installationPrecautions
          code
          vehicleCategory {
            id
            category
            description
            createdAt
            updatedAt
            __typename
          }
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          modele {
            id
            modele
            createdAt
            updatedAt
            vehicleBrandModelsBrandName
            __typename
          }
          gefcoSend
          tankCapacity
          canMileage
          companyVehiclesId
          company {
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
            __typename
          }
          device {
            imei
            protocolId
            sim
            createdAt
            updatedAt
            deviceVehicleImmat
            __typename
          }
          alerts {
            nextToken
            __typename
          }
          tags {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          vehicleVehicleCategoryId
          vehicleBrandBrandName
          vehicleModeleId
          vehicleDeviceImei
          __typename
        }
        # createdAt
        # updatedAt
        deviceVehicleImmat
        __typename
      }
      alerts {
        items {
          id
          vehicleImmat
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          alertId
          alert {
            id
            name
            type
            disabled
            instantaneous
            reportFrequency
            byMail
            bySms
            byWhatsapp
            smsTemplate
            emailTemplate
            sentToDriver
            phones
            emails
            extra
            createdAt
            updatedAt
            alertCompanyId
            alertZoneId
            __typename
          }
          isFlespi
          createdAt
          updatedAt
          __typename
        }
        nextToken
        __typename
      }
      tags {
        items {
          id
          vehicleImmat
          tagId
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          tag {
            id
            name
            description
            color
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        nextToken
        __typename
      }
      createdAt
      updatedAt
      vehicleVehicleCategoryId
      vehicleBrandBrandName
      vehicleModeleId
      vehicleDeviceImei
      __typename
    }
  }
`;
export const updateVehicle = /* GraphQL */ `
  mutation UpdateVehicle(
    $input: UpdateVehicleInput!
    $condition: ModelVehicleConditionInput
  ) {
    updateVehicle(input: $input, condition: $condition) {
      immat
      year
      fuelType
      consumption
      maxSpeed
      seatCount
      icon
      picture {
        bucket
        region
        key
        __typename
      }
      kilometerage
      kilometerPrice
      kilometerageStart
      kilometerageDay
      kilometerageLastUpdate
      timeRunning
      counterValue
      co2
      lastModificationDate
      rollingTimeStart
      rollingTimeDay
      locations
      installationPrecautions
      code
      vehicleCategory {
        id
        category
        description
        createdAt
        updatedAt
        __typename
      }
      brand {
        brandName
        logo {
          bucket
          region
          key
          __typename
        }
        models {
          items {
            id
            modele
            createdAt
            updatedAt
            vehicleBrandModelsBrandName
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      modele {
        id
        modele
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        createdAt
        updatedAt
        vehicleBrandModelsBrandName
        __typename
      }
      gefcoSend
      tankCapacity
      canMileage
      companyVehiclesId
      company {
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
        users {
          items {
            sub
            firstname
            lastname
            mobile
            beginDate
            endDate
            mappingId
            languageCode
            lastModificationDate
            showReport
            dispatcher
            applicationVersion
            themeId
            companyUsersId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        vehicles {
          items {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          nextToken
          __typename
        }
        drivers {
          items {
            sub
            firstname
            lastname
            fullname
            birthDate
            drivingLicenseNumber
            drivingLicenseType
            job
            hiringDate
            comment
            driverKey
            email
            mobile
            lastModificationDate
            code
            address
            agencyId
            cdc
            pdm
            nni
            companyDriversId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        trames {
          items {
            id
            speed
            lat
            lng
            address
            azimut
            immobilisation
            timestamp
            state
            fuel
            ibuttonCode
            companyId
            driverFullName
            vehicleBrandName
            companyTramesId
            processor
            createdAt
            updatedAt
            trameDriverSub
            trameVehicleImmat
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      device {
        imei
        protocolId
        sim
        vehicle {
          immat
          year
          fuelType
          consumption
          maxSpeed
          seatCount
          icon
          picture {
            bucket
            region
            key
            __typename
          }
          kilometerage
          kilometerPrice
          kilometerageStart
          kilometerageDay
          kilometerageLastUpdate
          timeRunning
          counterValue
          co2
          lastModificationDate
          rollingTimeStart
          rollingTimeDay
          locations
          installationPrecautions
          code
          vehicleCategory {
            id
            category
            description
            createdAt
            updatedAt
            __typename
          }
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          modele {
            id
            modele
            createdAt
            updatedAt
            vehicleBrandModelsBrandName
            __typename
          }
          gefcoSend
          tankCapacity
          canMileage
          companyVehiclesId
          company {
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
            __typename
          }
          device {
            imei
            protocolId
            sim
            createdAt
            updatedAt
            deviceVehicleImmat
            __typename
          }
          alerts {
            nextToken
            __typename
          }
          tags {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          vehicleVehicleCategoryId
          vehicleBrandBrandName
          vehicleModeleId
          vehicleDeviceImei
          __typename
        }
        createdAt
        updatedAt
        deviceVehicleImmat
        __typename
      }
      alerts {
        items {
          id
          vehicleImmat
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          alertId
          alert {
            id
            name
            type
            disabled
            instantaneous
            reportFrequency
            byMail
            bySms
            byWhatsapp
            smsTemplate
            emailTemplate
            sentToDriver
            phones
            emails
            extra
            createdAt
            updatedAt
            alertCompanyId
            alertZoneId
            __typename
          }
          isFlespi
          createdAt
          updatedAt
          __typename
        }
        nextToken
        __typename
      }
      tags {
        items {
          id
          vehicleImmat
          tagId
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          tag {
            id
            name
            description
            color
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        nextToken
        __typename
      }
      createdAt
      updatedAt
      vehicleVehicleCategoryId
      vehicleBrandBrandName
      vehicleModeleId
      vehicleDeviceImei
      __typename
    }
  }
`;
export const deleteVehicle = /* GraphQL */ `
  mutation DeleteVehicle(
    $input: DeleteVehicleInput!
    $condition: ModelVehicleConditionInput
  ) {
    deleteVehicle(input: $input, condition: $condition) {
      immat
      year
      fuelType
      consumption
      maxSpeed
      seatCount
      icon
      picture {
        bucket
        region
        key
        __typename
      }
      kilometerage
      kilometerPrice
      kilometerageStart
      kilometerageDay
      kilometerageLastUpdate
      timeRunning
      counterValue
      co2
      lastModificationDate
      rollingTimeStart
      rollingTimeDay
      locations
      installationPrecautions
      code
      vehicleCategory {
        id
        category
        description
       
        __typename
      }
      brand {
        brandName
        logo {
          bucket
          region
          key
          __typename
        }
        models {
          items {
            id
            modele
            createdAt
            updatedAt
            vehicleBrandModelsBrandName
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      modele {
        id
        modele
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        createdAt
        updatedAt
        vehicleBrandModelsBrandName
        __typename
      }
      gefcoSend
      tankCapacity
      canMileage
      companyVehiclesId
      company {
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
        users {
          items {
            sub
            firstname
            lastname
            mobile
            beginDate
            endDate
            mappingId
            languageCode
            lastModificationDate
            showReport
            dispatcher
            applicationVersion
            themeId
            companyUsersId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        vehicles {
          items {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          nextToken
          __typename
        }
        drivers {
          items {
            sub
            firstname
            lastname
            fullname
            birthDate
            drivingLicenseNumber
            drivingLicenseType
            job
            hiringDate
            comment
            driverKey
            email
            mobile
            lastModificationDate
            code
            address
            agencyId
            cdc
            pdm
            nni
            companyDriversId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        trames {
          items {
            id
            speed
            lat
            lng
            address
            azimut
            immobilisation
            timestamp
            state
            fuel
            ibuttonCode
            companyId
            driverFullName
            vehicleBrandName
            companyTramesId
            processor
            createdAt
            updatedAt
            trameDriverSub
            trameVehicleImmat
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      device {
        imei
        protocolId
        sim
        vehicle {
          immat
          year
          fuelType
          consumption
          maxSpeed
          seatCount
          icon
          picture {
            bucket
            region
            key
            __typename
          }
          kilometerage
          kilometerPrice
          kilometerageStart
          kilometerageDay
          kilometerageLastUpdate
          timeRunning
          counterValue
          co2
          lastModificationDate
          rollingTimeStart
          rollingTimeDay
          locations
          installationPrecautions
          code
          vehicleCategory {
            id
            category
            description
            createdAt
            updatedAt
            __typename
          }
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          modele {
            id
            modele
            createdAt
            updatedAt
            vehicleBrandModelsBrandName
            __typename
          }
          gefcoSend
          tankCapacity
          canMileage
          companyVehiclesId
          company {
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
            __typename
          }
          device {
            imei
            protocolId
            sim
            createdAt
            updatedAt
            deviceVehicleImmat
            __typename
          }
          alerts {
            nextToken
            __typename
          }
          tags {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          vehicleVehicleCategoryId
          vehicleBrandBrandName
          vehicleModeleId
          vehicleDeviceImei
          __typename
        }
        createdAt
        updatedAt
        deviceVehicleImmat
        __typename
      }
      alerts {
        items {
          id
          vehicleImmat
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          alertId
          alert {
            id
            name
            type
            disabled
            instantaneous
            reportFrequency
            byMail
            bySms
            byWhatsapp
            smsTemplate
            emailTemplate
            sentToDriver
            phones
            emails
            extra
            createdAt
            updatedAt
            alertCompanyId
            alertZoneId
            __typename
          }
          isFlespi
          createdAt
          updatedAt
          __typename
        }
        nextToken
        __typename
      }
      tags {
        items {
          id
          vehicleImmat
          tagId
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          tag {
            id
            name
            description
            color
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        nextToken
        __typename
      }
      createdAt
      updatedAt
      vehicleVehicleCategoryId
      vehicleBrandBrandName
      vehicleModeleId
      vehicleDeviceImei
      __typename
    }
  }
`;
export const createAlert = /* GraphQL */ `
  mutation CreateAlert(
    $input: CreateAlertInput!
    $condition: ModelAlertConditionInput
  ) {
    createAlert(input: $input, condition: $condition) {
      id
      name
      type
      disabled
      instantaneous
      reportFrequency
      byMail
      bySms
      byWhatsapp
      smsTemplate
      emailTemplate
      sentToDriver
      phones
      emails
      company {
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
        users {
          items {
            sub
            firstname
            lastname
            mobile
            beginDate
            endDate
            mappingId
            languageCode
            lastModificationDate
            showReport
            dispatcher
            applicationVersion
            themeId
            companyUsersId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        vehicles {
          items {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          nextToken
          __typename
        }
        drivers {
          items {
            sub
            firstname
            lastname
            fullname
            birthDate
            drivingLicenseNumber
            drivingLicenseType
            job
            hiringDate
            comment
            driverKey
            email
            mobile
            lastModificationDate
            code
            address
            agencyId
            cdc
            pdm
            nni
            companyDriversId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        trames {
          items {
            id
            speed
            lat
            lng
            address
            azimut
            immobilisation
            timestamp
            state
            fuel
            ibuttonCode
            companyId
            driverFullName
            vehicleBrandName
            companyTramesId
            processor
            createdAt
            updatedAt
            trameDriverSub
            trameVehicleImmat
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      vehicles {
        items {
          id
          vehicleImmat
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          alertId
          alert {
            id
            name
            type
            disabled
            instantaneous
            reportFrequency
            byMail
            bySms
            byWhatsapp
            smsTemplate
            emailTemplate
            sentToDriver
            phones
            emails
            extra
            createdAt
            updatedAt
            alertCompanyId
            alertZoneId
            __typename
          }
          isFlespi
          createdAt
          updatedAt
          __typename
        }
        nextToken
        __typename
      }
      extra
      zone {
        id
        name
        lat
        lng
        radius
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      alertCompanyId
      alertZoneId
      __typename
    }
  }
`;
export const updateAlert = /* GraphQL */ `
  mutation UpdateAlert(
    $input: UpdateAlertInput!
    $condition: ModelAlertConditionInput
  ) {
    updateAlert(input: $input, condition: $condition) {
      id
      name
      type
      disabled
      instantaneous
      reportFrequency
      byMail
      bySms
      byWhatsapp
      smsTemplate
      emailTemplate
      sentToDriver
      phones
      emails
      company {
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
        users {
          items {
            sub
            firstname
            lastname
            mobile
            beginDate
            endDate
            mappingId
            languageCode
            lastModificationDate
            showReport
            dispatcher
            applicationVersion
            themeId
            companyUsersId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        vehicles {
          items {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          nextToken
          __typename
        }
        drivers {
          items {
            sub
            firstname
            lastname
            fullname
            birthDate
            drivingLicenseNumber
            drivingLicenseType
            job
            hiringDate
            comment
            driverKey
            email
            mobile
            lastModificationDate
            code
            address
            agencyId
            cdc
            pdm
            nni
            companyDriversId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        trames {
          items {
            id
            speed
            lat
            lng
            address
            azimut
            immobilisation
            timestamp
            state
            fuel
            ibuttonCode
            companyId
            driverFullName
            vehicleBrandName
            companyTramesId
            processor
            createdAt
            updatedAt
            trameDriverSub
            trameVehicleImmat
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      vehicles {
        items {
          id
          vehicleImmat
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          alertId
          alert {
            id
            name
            type
            disabled
            instantaneous
            reportFrequency
            byMail
            bySms
            byWhatsapp
            smsTemplate
            emailTemplate
            sentToDriver
            phones
            emails
            extra
            createdAt
            updatedAt
            alertCompanyId
            alertZoneId
            __typename
          }
          isFlespi
          createdAt
          updatedAt
          __typename
        }
        nextToken
        __typename
      }
      extra
      zone {
        id
        name
        lat
        lng
        radius
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      alertCompanyId
      alertZoneId
      __typename
    }
  }
`;
export const deleteAlert = /* GraphQL */ `
  mutation DeleteAlert(
    $input: DeleteAlertInput!
    $condition: ModelAlertConditionInput
  ) {
    deleteAlert(input: $input, condition: $condition) {
      id
      name
      type
      disabled
      instantaneous
      reportFrequency
      byMail
      bySms
      byWhatsapp
      smsTemplate
      emailTemplate
      sentToDriver
      phones
      emails
      company {
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
        users {
          items {
            sub
            firstname
            lastname
            mobile
            beginDate
            endDate
            mappingId
            languageCode
            lastModificationDate
            showReport
            dispatcher
            applicationVersion
            themeId
            companyUsersId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        vehicles {
          items {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          nextToken
          __typename
        }
        drivers {
          items {
            sub
            firstname
            lastname
            fullname
            birthDate
            drivingLicenseNumber
            drivingLicenseType
            job
            hiringDate
            comment
            driverKey
            email
            mobile
            lastModificationDate
            code
            address
            agencyId
            cdc
            pdm
            nni
            companyDriversId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        trames {
          items {
            id
            speed
            lat
            lng
            address
            azimut
            immobilisation
            timestamp
            state
            fuel
            ibuttonCode
            companyId
            driverFullName
            vehicleBrandName
            companyTramesId
            processor
            createdAt
            updatedAt
            trameDriverSub
            trameVehicleImmat
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      vehicles {
        items {
          id
          vehicleImmat
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          alertId
          alert {
            id
            name
            type
            disabled
            instantaneous
            reportFrequency
            byMail
            bySms
            byWhatsapp
            smsTemplate
            emailTemplate
            sentToDriver
            phones
            emails
            extra
            createdAt
            updatedAt
            alertCompanyId
            alertZoneId
            __typename
          }
          isFlespi
          createdAt
          updatedAt
          __typename
        }
        nextToken
        __typename
      }
      extra
      zone {
        id
        name
        lat
        lng
        radius
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      alertCompanyId
      alertZoneId
      __typename
    }
  }
`;
export const createVehicleAlerts = /* GraphQL */ `
  mutation CreateVehicleAlerts(
    $input: CreateVehicleAlertsInput!
    $condition: ModelVehicleAlertsConditionInput
  ) {
    createVehicleAlerts(input: $input, condition: $condition) {
      id
      vehicleImmat
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          createdAt
          updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      alertId
      alert {
        id
        name
        type
        disabled
        instantaneous
        reportFrequency
        byMail
        bySms
        byWhatsapp
        smsTemplate
        emailTemplate
        sentToDriver
        phones
        emails
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        vehicles {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        extra
        zone {
          id
          name
          lat
          lng
          radius
          createdAt
          updatedAt
          __typename
        }
        createdAt
        updatedAt
        alertCompanyId
        alertZoneId
        __typename
      }
      isFlespi
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateVehicleAlerts = /* GraphQL */ `
  mutation UpdateVehicleAlerts(
    $input: UpdateVehicleAlertsInput!
    $condition: ModelVehicleAlertsConditionInput
  ) {
    updateVehicleAlerts(input: $input, condition: $condition) {
      id
      vehicleImmat
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          createdAt
          updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      alertId
      alert {
        id
        name
        type
        disabled
        instantaneous
        reportFrequency
        byMail
        bySms
        byWhatsapp
        smsTemplate
        emailTemplate
        sentToDriver
        phones
        emails
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        vehicles {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        extra
        zone {
          id
          name
          lat
          lng
          radius
          createdAt
          updatedAt
          __typename
        }
        createdAt
        updatedAt
        alertCompanyId
        alertZoneId
        __typename
      }
      isFlespi
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteVehicleAlerts = /* GraphQL */ `
  mutation DeleteVehicleAlerts(
    $input: DeleteVehicleAlertsInput!
    $condition: ModelVehicleAlertsConditionInput
  ) {
    deleteVehicleAlerts(input: $input, condition: $condition) {
      id
      vehicleImmat
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          createdAt
          updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      alertId
      alert {
        id
        name
        type
        disabled
        instantaneous
        reportFrequency
        byMail
        bySms
        byWhatsapp
        smsTemplate
        emailTemplate
        sentToDriver
        phones
        emails
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        vehicles {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        extra
        zone {
          id
          name
          lat
          lng
          radius
          createdAt
          updatedAt
          __typename
        }
        createdAt
        updatedAt
        alertCompanyId
        alertZoneId
        __typename
      }
      isFlespi
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createAlertDefinition = /* GraphQL */ `
  mutation CreateAlertDefinition(
    $input: CreateAlertDefinitionInput!
    $condition: ModelAlertDefinitionConditionInput
  ) {
    createAlertDefinition(input: $input, condition: $condition) {
      key
      label
      description
      isFlespi
      calculator
      variables
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAlertDefinition = /* GraphQL */ `
  mutation UpdateAlertDefinition(
    $input: UpdateAlertDefinitionInput!
    $condition: ModelAlertDefinitionConditionInput
  ) {
    updateAlertDefinition(input: $input, condition: $condition) {
      key
      label
      description
      isFlespi
      calculator
      variables
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAlertDefinition = /* GraphQL */ `
  mutation DeleteAlertDefinition(
    $input: DeleteAlertDefinitionInput!
    $condition: ModelAlertDefinitionConditionInput
  ) {
    deleteAlertDefinition(input: $input, condition: $condition) {
      key
      label
      description
      isFlespi
      calculator
      variables
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createVehicleAlertState = /* GraphQL */ `
  mutation CreateVehicleAlertState(
    $input: CreateVehicleAlertStateInput!
    $condition: ModelVehicleAlertStateConditionInput
  ) {
    createVehicleAlertState(input: $input, condition: $condition) {
      id
      alert
      state
      timestamp
      zone {
        id
        name
        lat
        lng
        radius
        createdAt
        updatedAt
        __typename
      }
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          createdAt
          updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      createdAt
      updatedAt
      vehicleAlertStateZoneId
      vehicleAlertStateVehicleImmat
      __typename
    }
  }
`;
export const updateVehicleAlertState = /* GraphQL */ `
  mutation UpdateVehicleAlertState(
    $input: UpdateVehicleAlertStateInput!
    $condition: ModelVehicleAlertStateConditionInput
  ) {
    updateVehicleAlertState(input: $input, condition: $condition) {
      id
      alert
      state
      timestamp
      zone {
        id
        name
        lat
        lng
        radius
        createdAt
        updatedAt
        __typename
      }
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          createdAt
          updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      createdAt
      updatedAt
      vehicleAlertStateZoneId
      vehicleAlertStateVehicleImmat
      __typename
    }
  }
`;
export const deleteVehicleAlertState = /* GraphQL */ `
  mutation DeleteVehicleAlertState(
    $input: DeleteVehicleAlertStateInput!
    $condition: ModelVehicleAlertStateConditionInput
  ) {
    deleteVehicleAlertState(input: $input, condition: $condition) {
      id
      alert
      state
      timestamp
      zone {
        id
        name
        lat
        lng
        radius
        createdAt
        updatedAt
        __typename
      }
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          createdAt
          updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      createdAt
      updatedAt
      vehicleAlertStateZoneId
      vehicleAlertStateVehicleImmat
      __typename
    }
  }
`;
export const createAlertHistory = /* GraphQL */ `
  mutation CreateAlertHistory(
    $input: CreateAlertHistoryInput!
    $condition: ModelAlertHistoryConditionInput
  ) {
    createAlertHistory(input: $input, condition: $condition) {
      id
      type
      imei
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          createdAt
          updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      driver {
        sub
        firstname
        lastname
        fullname
        birthDate
        drivingLicenseNumber
        drivingLicenseType
        job
        hiringDate
        comment
        driverKey
        email
        mobile
        lastModificationDate
        code
        address
        agencyId
        cdc
        pdm
        nni
        companyDriversId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      company {
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
        users {
          items {
            sub
            firstname
            lastname
            mobile
            beginDate
            endDate
            mappingId
            languageCode
            lastModificationDate
            showReport
            dispatcher
            applicationVersion
            themeId
            companyUsersId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        vehicles {
          items {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          nextToken
          __typename
        }
        drivers {
          items {
            sub
            firstname
            lastname
            fullname
            birthDate
            drivingLicenseNumber
            drivingLicenseType
            job
            hiringDate
            comment
            driverKey
            email
            mobile
            lastModificationDate
            code
            address
            agencyId
            cdc
            pdm
            nni
            companyDriversId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        trames {
          items {
            id
            speed
            lat
            lng
            address
            azimut
            immobilisation
            timestamp
            state
            fuel
            ibuttonCode
            companyId
            driverFullName
            vehicleBrandName
            companyTramesId
            processor
            createdAt
            updatedAt
            trameDriverSub
            trameVehicleImmat
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      timestamp
      config {
        id
        name
        type
        disabled
        instantaneous
        reportFrequency
        byMail
        bySms
        byWhatsapp
        smsTemplate
        emailTemplate
        sentToDriver
        phones
        emails
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        vehicles {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        extra
        zone {
          id
          name
          lat
          lng
          radius
          createdAt
          updatedAt
          __typename
        }
        createdAt
        updatedAt
        alertCompanyId
        alertZoneId
        __typename
      }
      data
      createdAt
      updatedAt
      alertHistoryVehicleImmat
      alertHistoryDriverSub
      alertHistoryCompanyId
      alertHistoryConfigId
      __typename
    }
  }
`;
export const updateAlertHistory = /* GraphQL */ `
  mutation UpdateAlertHistory(
    $input: UpdateAlertHistoryInput!
    $condition: ModelAlertHistoryConditionInput
  ) {
    updateAlertHistory(input: $input, condition: $condition) {
      id
      type
      imei
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          createdAt
          updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      driver {
        sub
        firstname
        lastname
        fullname
        birthDate
        drivingLicenseNumber
        drivingLicenseType
        job
        hiringDate
        comment
        driverKey
        email
        mobile
        lastModificationDate
        code
        address
        agencyId
        cdc
        pdm
        nni
        companyDriversId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      company {
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
        users {
          items {
            sub
            firstname
            lastname
            mobile
            beginDate
            endDate
            mappingId
            languageCode
            lastModificationDate
            showReport
            dispatcher
            applicationVersion
            themeId
            companyUsersId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        vehicles {
          items {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          nextToken
          __typename
        }
        drivers {
          items {
            sub
            firstname
            lastname
            fullname
            birthDate
            drivingLicenseNumber
            drivingLicenseType
            job
            hiringDate
            comment
            driverKey
            email
            mobile
            lastModificationDate
            code
            address
            agencyId
            cdc
            pdm
            nni
            companyDriversId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        trames {
          items {
            id
            speed
            lat
            lng
            address
            azimut
            immobilisation
            timestamp
            state
            fuel
            ibuttonCode
            companyId
            driverFullName
            vehicleBrandName
            companyTramesId
            processor
            createdAt
            updatedAt
            trameDriverSub
            trameVehicleImmat
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      timestamp
      config {
        id
        name
        type
        disabled
        instantaneous
        reportFrequency
        byMail
        bySms
        byWhatsapp
        smsTemplate
        emailTemplate
        sentToDriver
        phones
        emails
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        vehicles {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        extra
        zone {
          id
          name
          lat
          lng
          radius
          createdAt
          updatedAt
          __typename
        }
        createdAt
        updatedAt
        alertCompanyId
        alertZoneId
        __typename
      }
      data
      createdAt
      updatedAt
      alertHistoryVehicleImmat
      alertHistoryDriverSub
      alertHistoryCompanyId
      alertHistoryConfigId
      __typename
    }
  }
`;
export const deleteAlertHistory = /* GraphQL */ `
  mutation DeleteAlertHistory(
    $input: DeleteAlertHistoryInput!
    $condition: ModelAlertHistoryConditionInput
  ) {
    deleteAlertHistory(input: $input, condition: $condition) {
      id
      type
      imei
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          createdAt
          updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      driver {
        sub
        firstname
        lastname
        fullname
        birthDate
        drivingLicenseNumber
        drivingLicenseType
        job
        hiringDate
        comment
        driverKey
        email
        mobile
        lastModificationDate
        code
        address
        agencyId
        cdc
        pdm
        nni
        companyDriversId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      company {
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
        users {
          items {
            sub
            firstname
            lastname
            mobile
            beginDate
            endDate
            mappingId
            languageCode
            lastModificationDate
            showReport
            dispatcher
            applicationVersion
            themeId
            companyUsersId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        vehicles {
          items {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          nextToken
          __typename
        }
        drivers {
          items {
            sub
            firstname
            lastname
            fullname
            birthDate
            drivingLicenseNumber
            drivingLicenseType
            job
            hiringDate
            comment
            driverKey
            email
            mobile
            lastModificationDate
            code
            address
            agencyId
            cdc
            pdm
            nni
            companyDriversId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        trames {
          items {
            id
            speed
            lat
            lng
            address
            azimut
            immobilisation
            timestamp
            state
            fuel
            ibuttonCode
            companyId
            driverFullName
            vehicleBrandName
            companyTramesId
            processor
            createdAt
            updatedAt
            trameDriverSub
            trameVehicleImmat
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      timestamp
      config {
        id
        name
        type
        disabled
        instantaneous
        reportFrequency
        byMail
        bySms
        byWhatsapp
        smsTemplate
        emailTemplate
        sentToDriver
        phones
        emails
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        vehicles {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        extra
        zone {
          id
          name
          lat
          lng
          radius
          createdAt
          updatedAt
          __typename
        }
        createdAt
        updatedAt
        alertCompanyId
        alertZoneId
        __typename
      }
      data
      createdAt
      updatedAt
      alertHistoryVehicleImmat
      alertHistoryDriverSub
      alertHistoryCompanyId
      alertHistoryConfigId
      __typename
    }
  }
`;
export const createZone = /* GraphQL */ `
  mutation CreateZone(
    $input: CreateZoneInput!
    $condition: ModelZoneConditionInput
  ) {
    createZone(input: $input, condition: $condition) {
      id
      name
      lat
      lng
      radius
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateZone = /* GraphQL */ `
  mutation UpdateZone(
    $input: UpdateZoneInput!
    $condition: ModelZoneConditionInput
  ) {
    updateZone(input: $input, condition: $condition) {
      id
      name
      lat
      lng
      radius
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteZone = /* GraphQL */ `
  mutation DeleteZone(
    $input: DeleteZoneInput!
    $condition: ModelZoneConditionInput
  ) {
    deleteZone(input: $input, condition: $condition) {
      id
      name
      lat
      lng
      radius
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createVehicleCategory = /* GraphQL */ `
  mutation CreateVehicleCategory(
    $input: CreateVehicleCategoryInput!
    $condition: ModelVehicleCategoryConditionInput
  ) {
    createVehicleCategory(input: $input, condition: $condition) {
      id
      category
      description
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateVehicleCategory = /* GraphQL */ `
  mutation UpdateVehicleCategory(
    $input: UpdateVehicleCategoryInput!
    $condition: ModelVehicleCategoryConditionInput
  ) {
    updateVehicleCategory(input: $input, condition: $condition) {
      id
      category
      description
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteVehicleCategory = /* GraphQL */ `
  mutation DeleteVehicleCategory(
    $input: DeleteVehicleCategoryInput!
    $condition: ModelVehicleCategoryConditionInput
  ) {
    deleteVehicleCategory(input: $input, condition: $condition) {
      id
      category
      description
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createVehicleBrand = /* GraphQL */ `
  mutation CreateVehicleBrand(
    $input: CreateVehicleBrandInput!
    $condition: ModelVehicleBrandConditionInput
  ) {
    createVehicleBrand(input: $input, condition: $condition) {
      brandName
      logo {
        bucket
        region
        key
        __typename
      }
      models {
        items {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateVehicleBrand = /* GraphQL */ `
  mutation UpdateVehicleBrand(
    $input: UpdateVehicleBrandInput!
    $condition: ModelVehicleBrandConditionInput
  ) {
    updateVehicleBrand(input: $input, condition: $condition) {
      brandName
      logo {
        bucket
        region
        key
        __typename
      }
      models {
        items {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteVehicleBrand = /* GraphQL */ `
  mutation DeleteVehicleBrand(
    $input: DeleteVehicleBrandInput!
    $condition: ModelVehicleBrandConditionInput
  ) {
    deleteVehicleBrand(input: $input, condition: $condition) {
      brandName
      logo {
        bucket
        region
        key
        __typename
      }
      models {
        items {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createVehicleModel = /* GraphQL */ `
  mutation CreateVehicleModel(
    $input: CreateVehicleModelInput!
    $condition: ModelVehicleModelConditionInput
  ) {
    createVehicleModel(input: $input, condition: $condition) {
      id
      modele
      brand {
        brandName
        logo {
          bucket
          region
          key
          __typename
        }
        models {
          items {
            id
            modele
            createdAt
            updatedAt
            vehicleBrandModelsBrandName
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      vehicleBrandModelsBrandName
      __typename
    }
  }
`;
export const updateVehicleModel = /* GraphQL */ `
  mutation UpdateVehicleModel(
    $input: UpdateVehicleModelInput!
    $condition: ModelVehicleModelConditionInput
  ) {
    updateVehicleModel(input: $input, condition: $condition) {
      id
      modele
      brand {
        brandName
        logo {
          bucket
          region
          key
          __typename
        }
        models {
          items {
            id
            modele
            createdAt
            updatedAt
            vehicleBrandModelsBrandName
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      vehicleBrandModelsBrandName
      __typename
    }
  }
`;
export const deleteVehicleModel = /* GraphQL */ `
  mutation DeleteVehicleModel(
    $input: DeleteVehicleModelInput!
    $condition: ModelVehicleModelConditionInput
  ) {
    deleteVehicleModel(input: $input, condition: $condition) {
      id
      modele
      brand {
        brandName
        logo {
          bucket
          region
          key
          __typename
        }
        models {
          items {
            id
            modele
            createdAt
            updatedAt
            vehicleBrandModelsBrandName
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      vehicleBrandModelsBrandName
      __typename
    }
  }
`;
export const createDevice = /* GraphQL */ `
  mutation CreateDevice(
    $input: CreateDeviceInput!
    $condition: ModelDeviceConditionInput
  ) {
    createDevice(input: $input, condition: $condition) {
      imei
      protocolId
      sim
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          createdAt
          updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      createdAt
      updatedAt
      deviceVehicleImmat
      __typename
    }
  }
`;
export const updateDevice = /* GraphQL */ `
  mutation UpdateDevice(
    $input: UpdateDeviceInput!
    $condition: ModelDeviceConditionInput
  ) {
    updateDevice(input: $input, condition: $condition) {
      imei
      protocolId
      sim
      # vehicle {
      #   immat
      #   year
      #   fuelType
      #   consumption
      #   maxSpeed
      #   seatCount
      #   icon
      #   picture {
      #     bucket
      #     region
      #     key
      #     __typename
      #   }
      #   kilometerage
      #   kilometerPrice
      #   kilometerageStart
      #   kilometerageDay
      #   kilometerageLastUpdate
      #   timeRunning
      #   counterValue
      #   co2
      #   lastModificationDate
      #   rollingTimeStart
      #   rollingTimeDay
      #   locations
      #   installationPrecautions
      #   code
      #   vehicleCategory {
      #     id
      #     category
      #     description
      #     createdAt
      #     updatedAt
      #     __typename
      #   }
      #   brand {
      #     brandName
      #     logo {
      #       bucket
      #       region
      #       key
      #       __typename
      #     }
      #     models {
      #       nextToken
      #       __typename
      #     }
      #     createdAt
      #     updatedAt
      #     __typename
      #   }
      #   modele {
      #     id
      #     modele
      #     brand {
      #       brandName
      #       createdAt
      #       updatedAt
      #       __typename
      #     }
      #     createdAt
      #     updatedAt
      #     vehicleBrandModelsBrandName
      #     __typename
      #   }
      #   gefcoSend
      #   tankCapacity
      #   canMileage
      #   companyVehiclesId
      #   company {
      #     id
      #     name
      #     siret
      #     address
      #     postalCode
      #     city
      #     countryCode
      #     contact
      #     email
      #     mobile
      #     phone
      #     fax
      #     creationDate
      #     subscriptionDate
      #     keyedStart
      #     users {
      #       nextToken
      #       __typename
      #     }
      #     vehicles {
      #       nextToken
      #       __typename
      #     }
      #     drivers {
      #       nextToken
      #       __typename
      #     }
      #     trames {
      #       nextToken
      #       __typename
      #     }
      #     createdAt
      #     updatedAt
      #     __typename
      #   }
      #   device {
      #     imei
      #     protocolId
      #     sim
      #     vehicle {
      #       immat
      #       year
      #       fuelType
      #       consumption
      #       maxSpeed
      #       seatCount
      #       icon
      #       kilometerage
      #       kilometerPrice
      #       kilometerageStart
      #       kilometerageDay
      #       kilometerageLastUpdate
      #       timeRunning
      #       counterValue
      #       co2
      #       lastModificationDate
      #       rollingTimeStart
      #       rollingTimeDay
      #       locations
      #       installationPrecautions
      #       code
      #       gefcoSend
      #       tankCapacity
      #       canMileage
      #       companyVehiclesId
      #       createdAt
      #       updatedAt
      #       vehicleVehicleCategoryId
      #       vehicleBrandBrandName
      #       vehicleModeleId
      #       vehicleDeviceImei
      #       __typename
      #     }
      #     createdAt
      #     updatedAt
      #     deviceVehicleImmat
      #     __typename
      #   }
      #   alerts {
      #     items {
      #       id
      #       vehicleImmat
      #       alertId
      #       isFlespi
      #       createdAt
      #       updatedAt
      #       __typename
      #     }
      #     nextToken
      #     __typename
      #   }
      #   tags {
      #     items {
      #       id
      #       vehicleImmat
      #       tagId
      #       createdAt
      #       updatedAt
      #       __typename
      #     }
      #     nextToken
      #     __typename
      #   }
      #   createdAt
      #   updatedAt
      #   vehicleVehicleCategoryId
      #   vehicleBrandBrandName
      #   vehicleModeleId
      #   vehicleDeviceImei
      #   __typename
      # }
      # createdAt
      # updatedAt
      deviceVehicleImmat
      __typename
    }
  }
`;
export const deleteDevice = /* GraphQL */ `
  mutation DeleteDevice(
    $input: DeleteDeviceInput!
    $condition: ModelDeviceConditionInput
  ) {
    deleteDevice(input: $input, condition: $condition) {
      imei
      protocolId
      sim
      # vehicle {
      #   immat
      #   year
      #   fuelType
      #   consumption
      #   maxSpeed
      #   seatCount
      #   icon
      #   picture {
      #     bucket
      #     region
      #     key
      #     __typename
      #   }
      #   kilometerage
      #   kilometerPrice
      #   kilometerageStart
      #   kilometerageDay
      #   kilometerageLastUpdate
      #   timeRunning
      #   counterValue
      #   co2
      #   lastModificationDate
      #   rollingTimeStart
      #   rollingTimeDay
      #   locations
      #   installationPrecautions
      #   code
      #   vehicleCategory {
      #     id
      #     category
      #     description
      #     createdAt
      #     updatedAt
      #     __typename
      #   }
      #   brand {
      #     brandName
      #     logo {
      #       bucket
      #       region
      #       key
      #       __typename
      #     }
      #     models {
      #       nextToken
      #       __typename
      #     }
      #     createdAt
      #     updatedAt
      #     __typename
      #   }
      #   modele {
      #     id
      #     modele
      #     brand {
      #       brandName
      #       createdAt
      #       updatedAt
      #       __typename
      #     }
      #     createdAt
      #     updatedAt
      #     vehicleBrandModelsBrandName
      #     __typename
      #   }
      #   gefcoSend
      #   tankCapacity
      #   canMileage
      #   companyVehiclesId
      #   company {
      #     id
      #     name
      #     siret
      #     address
      #     postalCode
      #     city
      #     countryCode
      #     contact
      #     email
      #     mobile
      #     phone
      #     fax
      #     creationDate
      #     subscriptionDate
      #     keyedStart
      #     users {
      #       nextToken
      #       __typename
      #     }
      #     vehicles {
      #       nextToken
      #       __typename
      #     }
      #     drivers {
      #       nextToken
      #       __typename
      #     }
      #     trames {
      #       nextToken
      #       __typename
      #     }
      #     # createdAt
      #     # updatedAt
      #     __typename
      #   }
      #   device {
      #     imei
      #     protocolId
      #     sim
      #     # vehicle {
      #     #   immat
      #     #   year
      #     #   fuelType
      #     #   consumption
      #     #   maxSpeed
      #     #   seatCount
      #     #   icon
      #     #   kilometerage
      #     #   kilometerPrice
      #     #   kilometerageStart
      #     #   kilometerageDay
      #     #   kilometerageLastUpdate
      #     #   timeRunning
      #     #   counterValue
      #     #   co2
      #     #   lastModificationDate
      #     #   rollingTimeStart
      #     #   rollingTimeDay
      #     #   locations
      #     #   installationPrecautions
      #     #   code
      #     #   gefcoSend
      #     #   tankCapacity
      #     #   canMileage
      #     #   companyVehiclesId
      #     #   createdAt
      #     #   updatedAt
      #     #   vehicleVehicleCategoryId
      #     #   vehicleBrandBrandName
      #     #   vehicleModeleId
      #     #   vehicleDeviceImei
      #     #   __typename
      #     # }
      #     createdAt
      #     updatedAt
      #     deviceVehicleImmat
      #     __typename
      #   }
      #   alerts {
      #     items {
      #       id
      #       vehicleImmat
      #       alertId
      #       isFlespi
      #       createdAt
      #       updatedAt
      #       __typename
      #     }
      #     nextToken
      #     __typename
      #   }
      #   tags {
      #     items {
      #       id
      #       vehicleImmat
      #       tagId
      #       createdAt
      #       updatedAt
      #       __typename
      #     }
      #     nextToken
      #     __typename
      #   }
      #   createdAt
      #   updatedAt
      #   vehicleVehicleCategoryId
      #   vehicleBrandBrandName
      #   vehicleModeleId
      #   vehicleDeviceImei
      #   __typename
      # }
      # createdAt
      # updatedAt
      deviceVehicleImmat
      __typename
    }
  }
`;
export const createTrame = /* GraphQL */ `
  mutation CreateTrame(
    $input: CreateTrameInput!
    $condition: ModelTrameConditionInput
  ) {
    createTrame(input: $input, condition: $condition) {
      id
      speed
      lat
      lng
      address
      azimut
      immobilisation
      timestamp
      state
      fuel
      ibuttonCode
      companyId
      driverFullName
      vehicleBrandName
      companyTramesId
      company {
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
        users {
          items {
            sub
            firstname
            lastname
            mobile
            beginDate
            endDate
            mappingId
            languageCode
            lastModificationDate
            showReport
            dispatcher
            applicationVersion
            themeId
            companyUsersId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        vehicles {
          items {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          nextToken
          __typename
        }
        drivers {
          items {
            sub
            firstname
            lastname
            fullname
            birthDate
            drivingLicenseNumber
            drivingLicenseType
            job
            hiringDate
            comment
            driverKey
            email
            mobile
            lastModificationDate
            code
            address
            agencyId
            cdc
            pdm
            nni
            companyDriversId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        trames {
          items {
            id
            speed
            lat
            lng
            address
            azimut
            immobilisation
            timestamp
            state
            fuel
            ibuttonCode
            companyId
            driverFullName
            vehicleBrandName
            companyTramesId
            processor
            createdAt
            updatedAt
            trameDriverSub
            trameVehicleImmat
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      driver {
        sub
        firstname
        lastname
        fullname
        birthDate
        drivingLicenseNumber
        drivingLicenseType
        job
        hiringDate
        comment
        driverKey
        email
        mobile
        lastModificationDate
        code
        address
        agencyId
        cdc
        pdm
        nni
        companyDriversId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          # createdAt
          # updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      processor
      createdAt
      updatedAt
      trameDriverSub
      trameVehicleImmat
      __typename
    }
  }
`;
export const updateTrame = /* GraphQL */ `
  mutation UpdateTrame(
    $input: UpdateTrameInput!
    $condition: ModelTrameConditionInput
  ) {
    updateTrame(input: $input, condition: $condition) {
      id
      speed
      lat
      lng
      address
      azimut
      immobilisation
      timestamp
      state
      fuel
      ibuttonCode
      companyId
      driverFullName
      vehicleBrandName
      companyTramesId
      company {
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
        users {
          items {
            sub
            firstname
            lastname
            mobile
            beginDate
            endDate
            mappingId
            languageCode
            lastModificationDate
            showReport
            dispatcher
            applicationVersion
            themeId
            companyUsersId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        vehicles {
          items {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          nextToken
          __typename
        }
        drivers {
          items {
            sub
            firstname
            lastname
            fullname
            birthDate
            drivingLicenseNumber
            drivingLicenseType
            job
            hiringDate
            comment
            driverKey
            email
            mobile
            lastModificationDate
            code
            address
            agencyId
            cdc
            pdm
            nni
            companyDriversId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        trames {
          items {
            id
            speed
            lat
            lng
            address
            azimut
            immobilisation
            timestamp
            state
            fuel
            ibuttonCode
            companyId
            driverFullName
            vehicleBrandName
            companyTramesId
            processor
            createdAt
            updatedAt
            trameDriverSub
            trameVehicleImmat
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      driver {
        sub
        firstname
        lastname
        fullname
        birthDate
        drivingLicenseNumber
        drivingLicenseType
        job
        hiringDate
        comment
        driverKey
        email
        mobile
        lastModificationDate
        code
        address
        agencyId
        cdc
        pdm
        nni
        companyDriversId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          createdAt
          updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      processor
      createdAt
      updatedAt
      trameDriverSub
      trameVehicleImmat
      __typename
    }
  }
`;
export const deleteTrame = /* GraphQL */ `
  mutation DeleteTrame(
    $input: DeleteTrameInput!
    $condition: ModelTrameConditionInput
  ) {
    deleteTrame(input: $input, condition: $condition) {
      id
      speed
      lat
      lng
      address
      azimut
      immobilisation
      timestamp
      state
      fuel
      ibuttonCode
      companyId
      driverFullName
      vehicleBrandName
      companyTramesId
      company {
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
        users {
          items {
            sub
            firstname
            lastname
            mobile
            beginDate
            endDate
            mappingId
            languageCode
            lastModificationDate
            showReport
            dispatcher
            applicationVersion
            themeId
            companyUsersId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        vehicles {
          items {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          nextToken
          __typename
        }
        drivers {
          items {
            sub
            firstname
            lastname
            fullname
            birthDate
            drivingLicenseNumber
            drivingLicenseType
            job
            hiringDate
            comment
            driverKey
            email
            mobile
            lastModificationDate
            code
            address
            agencyId
            cdc
            pdm
            nni
            companyDriversId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        trames {
          items {
            id
            speed
            lat
            lng
            address
            azimut
            immobilisation
            timestamp
            state
            fuel
            ibuttonCode
            companyId
            driverFullName
            vehicleBrandName
            companyTramesId
            processor
            createdAt
            updatedAt
            trameDriverSub
            trameVehicleImmat
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      driver {
        sub
        firstname
        lastname
        fullname
        birthDate
        drivingLicenseNumber
        drivingLicenseType
        job
        hiringDate
        comment
        driverKey
        email
        mobile
        lastModificationDate
        code
        address
        agencyId
        cdc
        pdm
        nni
        companyDriversId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          createdAt
          updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      processor
      createdAt
      updatedAt
      trameDriverSub
      trameVehicleImmat
      __typename
    }
  }
`;
export const createDvD = /* GraphQL */ `
  mutation CreateDvD(
    $input: CreateDvDInput!
    $condition: ModelDvDConditionInput
  ) {
    createDvD(input: $input, condition: $condition) {
      id
      dvDVehicleImmat
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          createdAt
          updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      dvDDriverSub
      driver {
        sub
        firstname
        lastname
        fullname
        birthDate
        drivingLicenseNumber
        drivingLicenseType
        job
        hiringDate
        comment
        driverKey
        email
        mobile
        lastModificationDate
        code
        address
        agencyId
        cdc
        pdm
        nni
        companyDriversId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      company {
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
        users {
          items {
            sub
            firstname
            lastname
            mobile
            beginDate
            endDate
            mappingId
            languageCode
            lastModificationDate
            showReport
            dispatcher
            applicationVersion
            themeId
            companyUsersId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        vehicles {
          items {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          nextToken
          __typename
        }
        drivers {
          items {
            sub
            firstname
            lastname
            fullname
            birthDate
            drivingLicenseNumber
            drivingLicenseType
            job
            hiringDate
            comment
            driverKey
            email
            mobile
            lastModificationDate
            code
            address
            agencyId
            cdc
            pdm
            nni
            companyDriversId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        trames {
          items {
            id
            speed
            lat
            lng
            address
            azimut
            immobilisation
            timestamp
            state
            fuel
            ibuttonCode
            companyId
            driverFullName
            vehicleBrandName
            companyTramesId
            processor
            createdAt
            updatedAt
            trameDriverSub
            trameVehicleImmat
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      assignmentDate
      unassignmentDate
      createdAt
      updatedAt
      dvDCompanyId
      __typename
    }
  }
`;
export const updateDvD = /* GraphQL */ `
  mutation UpdateDvD(
    $input: UpdateDvDInput!
    $condition: ModelDvDConditionInput
  ) {
    updateDvD(input: $input, condition: $condition) {
      id
      dvDVehicleImmat
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          createdAt
          updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      dvDDriverSub
      driver {
        sub
        firstname
        lastname
        fullname
        birthDate
        drivingLicenseNumber
        drivingLicenseType
        job
        hiringDate
        comment
        driverKey
        email
        mobile
        lastModificationDate
        code
        address
        agencyId
        cdc
        pdm
        nni
        companyDriversId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      company {
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
        users {
          items {
            sub
            firstname
            lastname
            mobile
            beginDate
            endDate
            mappingId
            languageCode
            lastModificationDate
            showReport
            dispatcher
            applicationVersion
            themeId
            companyUsersId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        vehicles {
          items {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          nextToken
          __typename
        }
        drivers {
          items {
            sub
            firstname
            lastname
            fullname
            birthDate
            drivingLicenseNumber
            drivingLicenseType
            job
            hiringDate
            comment
            driverKey
            email
            mobile
            lastModificationDate
            code
            address
            agencyId
            cdc
            pdm
            nni
            companyDriversId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        trames {
          items {
            id
            speed
            lat
            lng
            address
            azimut
            immobilisation
            timestamp
            state
            fuel
            ibuttonCode
            companyId
            driverFullName
            vehicleBrandName
            companyTramesId
            processor
            createdAt
            updatedAt
            trameDriverSub
            trameVehicleImmat
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      assignmentDate
      unassignmentDate
      createdAt
      updatedAt
      dvDCompanyId
      __typename
    }
  }
`;
export const deleteDvD = /* GraphQL */ `
  mutation DeleteDvD(
    $input: DeleteDvDInput!
    $condition: ModelDvDConditionInput
  ) {
    deleteDvD(input: $input, condition: $condition) {
      id
      dvDVehicleImmat
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          createdAt
          updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      dvDDriverSub
      driver {
        sub
        firstname
        lastname
        fullname
        birthDate
        drivingLicenseNumber
        drivingLicenseType
        job
        hiringDate
        comment
        driverKey
        email
        mobile
        lastModificationDate
        code
        address
        agencyId
        cdc
        pdm
        nni
        companyDriversId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      company {
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
        users {
          items {
            sub
            firstname
            lastname
            mobile
            beginDate
            endDate
            mappingId
            languageCode
            lastModificationDate
            showReport
            dispatcher
            applicationVersion
            themeId
            companyUsersId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        vehicles {
          items {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          nextToken
          __typename
        }
        drivers {
          items {
            sub
            firstname
            lastname
            fullname
            birthDate
            drivingLicenseNumber
            drivingLicenseType
            job
            hiringDate
            comment
            driverKey
            email
            mobile
            lastModificationDate
            code
            address
            agencyId
            cdc
            pdm
            nni
            companyDriversId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        trames {
          items {
            id
            speed
            lat
            lng
            address
            azimut
            immobilisation
            timestamp
            state
            fuel
            ibuttonCode
            companyId
            driverFullName
            vehicleBrandName
            companyTramesId
            processor
            createdAt
            updatedAt
            trameDriverSub
            trameVehicleImmat
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      assignmentDate
      unassignmentDate
      createdAt
      updatedAt
      dvDCompanyId
      __typename
    }
  }
`;
export const createDepense = /* GraphQL */ `
  mutation CreateDepense(
    $input: CreateDepenseInput!
    $condition: ModelDepenseConditionInput
  ) {
    createDepense(input: $input, condition: $condition) {
      id
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          createdAt
          updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      type
      prestataire
      montantTTC
      montantHT
      associateDate
      produit
      qte
      description
      companyId
      createdAt
      updatedAt
      depenseVehicleImmat
      __typename
    }
  }
`;
export const updateDepense = /* GraphQL */ `
  mutation UpdateDepense(
    $input: UpdateDepenseInput!
    $condition: ModelDepenseConditionInput
  ) {
    updateDepense(input: $input, condition: $condition) {
      id
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          createdAt
          updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      type
      prestataire
      montantTTC
      montantHT
      associateDate
      produit
      qte
      description
      companyId
      createdAt
      updatedAt
      depenseVehicleImmat
      __typename
    }
  }
`;
export const deleteDepense = /* GraphQL */ `
  mutation DeleteDepense(
    $input: DeleteDepenseInput!
    $condition: ModelDepenseConditionInput
  ) {
    deleteDepense(input: $input, condition: $condition) {
      id
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          createdAt
          updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      type
      prestataire
      montantTTC
      montantHT
      associateDate
      produit
      qte
      description
      companyId
      createdAt
      updatedAt
      depenseVehicleImmat
      __typename
    }
  }
`;
export const createLabelsCollection = /* GraphQL */ `
  mutation CreateLabelsCollection(
    $input: CreateLabelsCollectionInput!
    $condition: ModelLabelsCollectionConditionInput
  ) {
    createLabelsCollection(input: $input, condition: $condition) {
      key
      label
      type
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateLabelsCollection = /* GraphQL */ `
  mutation UpdateLabelsCollection(
    $input: UpdateLabelsCollectionInput!
    $condition: ModelLabelsCollectionConditionInput
  ) {
    updateLabelsCollection(input: $input, condition: $condition) {
      key
      label
      type
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteLabelsCollection = /* GraphQL */ `
  mutation DeleteLabelsCollection(
    $input: DeleteLabelsCollectionInput!
    $condition: ModelLabelsCollectionConditionInput
  ) {
    deleteLabelsCollection(input: $input, condition: $condition) {
      key
      label
      type
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createTag = /* GraphQL */ `
  mutation CreateTag(
    $input: CreateTagInput!
    $condition: ModelTagConditionInput
  ) {
    createTag(input: $input, condition: $condition) {
      id
      name
      description
      color
      vehicles {
        items {
          id
          vehicleImmat
          tagId
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          tag {
            id
            name
            description
            color
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateTag = /* GraphQL */ `
  mutation UpdateTag(
    $input: UpdateTagInput!
    $condition: ModelTagConditionInput
  ) {
    updateTag(input: $input, condition: $condition) {
      id
      name
      description
      color
      vehicles {
        items {
          id
          vehicleImmat
          tagId
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          tag {
            id
            name
            description
            color
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteTag = /* GraphQL */ `
  mutation DeleteTag(
    $input: DeleteTagInput!
    $condition: ModelTagConditionInput
  ) {
    deleteTag(input: $input, condition: $condition) {
      id
      name
      description
      color
      vehicles {
        items {
          id
          vehicleImmat
          tagId
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          tag {
            id
            name
            description
            color
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createVehicleTags = /* GraphQL */ `
  mutation CreateVehicleTags(
    $input: CreateVehicleTagsInput!
    $condition: ModelVehicleTagsConditionInput
  ) {
    createVehicleTags(input: $input, condition: $condition) {
      id
      vehicleImmat
      tagId
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          createdAt
          updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      tag {
        id
        name
        description
        color
        vehicles {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateVehicleTags = /* GraphQL */ `
  mutation UpdateVehicleTags(
    $input: UpdateVehicleTagsInput!
    $condition: ModelVehicleTagsConditionInput
  ) {
    updateVehicleTags(input: $input, condition: $condition) {
      id
      vehicleImmat
      tagId
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          createdAt
          updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      tag {
        id
        name
        description
        color
        vehicles {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteVehicleTags = /* GraphQL */ `
  mutation DeleteVehicleTags(
    $input: DeleteVehicleTagsInput!
    $condition: ModelVehicleTagsConditionInput
  ) {
    deleteVehicleTags(input: $input, condition: $condition) {
      id
      vehicleImmat
      tagId
      vehicle {
        immat
        year
        fuelType
        consumption
        maxSpeed
        seatCount
        icon
        picture {
          bucket
          region
          key
          __typename
        }
        kilometerage
        kilometerPrice
        kilometerageStart
        kilometerageDay
        kilometerageLastUpdate
        timeRunning
        counterValue
        co2
        lastModificationDate
        rollingTimeStart
        rollingTimeDay
        locations
        installationPrecautions
        code
        vehicleCategory {
          id
          category
          description
          createdAt
          updatedAt
          __typename
        }
        brand {
          brandName
          logo {
            bucket
            region
            key
            __typename
          }
          models {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        modele {
          id
          modele
          brand {
            brandName
            createdAt
            updatedAt
            __typename
          }
          createdAt
          updatedAt
          vehicleBrandModelsBrandName
          __typename
        }
        gefcoSend
        tankCapacity
        canMileage
        companyVehiclesId
        company {
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
          users {
            nextToken
            __typename
          }
          vehicles {
            nextToken
            __typename
          }
          drivers {
            nextToken
            __typename
          }
          trames {
            nextToken
            __typename
          }
          createdAt
          updatedAt
          __typename
        }
        device {
          imei
          protocolId
          sim
          vehicle {
            immat
            year
            fuelType
            consumption
            maxSpeed
            seatCount
            icon
            kilometerage
            kilometerPrice
            kilometerageStart
            kilometerageDay
            kilometerageLastUpdate
            timeRunning
            counterValue
            co2
            lastModificationDate
            rollingTimeStart
            rollingTimeDay
            locations
            installationPrecautions
            code
            gefcoSend
            tankCapacity
            canMileage
            companyVehiclesId
            createdAt
            updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          createdAt
          updatedAt
          deviceVehicleImmat
          __typename
        }
        alerts {
          items {
            id
            vehicleImmat
            alertId
            isFlespi
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        tags {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      tag {
        id
        name
        description
        color
        vehicles {
          items {
            id
            vehicleImmat
            tagId
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
  
`;

export const createCompanyDevice = /* GraphQL */ `
  mutation CreateCompanyDevice(
    $input: CreateCompanyDeviceInput!
    $condition: ModelCompanyDeviceConditionInput
  ) {
    createCompanyDevice(input: $input, condition: $condition) {
      id
      companyID
      deviceIMEI
      associationDate
      dissociationDate
      isActive
      company {
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
        __typename
      }
      device {
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
        deviceVehicleImmat
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;

export const updateCompanyDevice = /* GraphQL */ `
  mutation UpdateCompanyDevice(
    $input: UpdateCompanyDeviceInput!
    $condition: ModelCompanyDeviceConditionInput
  ) {
    updateCompanyDevice(input: $input, condition: $condition) {
      id
      companyID
      deviceIMEI
      associationDate
      dissociationDate
      isActive
      company {
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
        __typename
      }
      device {
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
        deviceVehicleImmat
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;


export const getCompanyDevice = /* GraphQL */ `
  query GetCompanyDevice($id: ID!) {
    getCompanyDevice(id: $id) {
      id
      companyID
      deviceIMEI
      associationDate
      dissociationDate
      isActive
      company {
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
        __typename
      }
      device {
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
        companyDevices {
          nextToken
          __typename
        }
        vehicle {
          immat
          realImmat

          __typename
        }
        createdAt
        updatedAt
        deviceVehicleImmat
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;

export const companyDevicesByCompanyIDAndAssociationDate = /* GraphQL */ `
  query CompanyDevicesByCompanyIDAndAssociationDate(
    $companyID: ID!
    $associationDate: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelCompanyDeviceFilterInput
    $limit: Int
    $nextToken: String
  ) {
    companyDevicesByCompanyIDAndAssociationDate(
      companyID: $companyID
      associationDate: $associationDate
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        companyID
        deviceIMEI
        associationDate
        dissociationDate
        isActive
        company {
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
          __typename
        }
        device {
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
          deviceVehicleImmat
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const companyDevicesByDeviceIMEIAndAssociationDate = /* GraphQL */ `
  query CompanyDevicesByDeviceIMEIAndAssociationDate(
    $deviceIMEI: String!
    $associationDate: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelCompanyDeviceFilterInput
    $limit: Int
    $nextToken: String
  ) {
    companyDevicesByDeviceIMEIAndAssociationDate(
      deviceIMEI: $deviceIMEI
      associationDate: $associationDate
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        companyID
        deviceIMEI
        associationDate
        dissociationDate
        isActive
        company {
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
          __typename
        }
        device {
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
          deviceVehicleImmat
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;

export const createAntaiVehicleAndInfraction = /* GraphQL */ `
  mutation CreateAntaiVehicleAndInfraction($input: AntaiVehicleInput!) {
    createAntaiVehicleAndInfraction(input: $input) {
      success
      vehicleResponse
      infractionResponse
      error
      __typename
    }
  }
`;
