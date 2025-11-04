/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getTrajectoryHistory = /* GraphQL */ `
  query GetTrajectoryHistory(
    $driverSub: String
    $vehicleImmat: String
    $tagId: String
    $from: String!
    $to: String!
    $page: Int!
    $mode: ReportCallMode!
  ) {
    getTrajectoryHistory(
      driverSub: $driverSub
      vehicleImmat: $vehicleImmat
      tagId: $tagId
      from: $from
      to: $to
      page: $page
      mode: $mode
    ) {
      pagesCount
      currentPageNumber
      currentPageItemsCount
      fullItemsCount
      items {
        deviceId
        imei
        avgSpeed
        begin
        end
        groupingDate
        addressStart
        addressEnd
        distance
        duration
        idleTime
        maxSpeed
        vehicleImmat
        vehicleBrand
        driverSub
        driverFirstname
        driverLastname
        points {
          gisgraphyAddressFormatedPostal
          positionAltitude
          positionLatitude
          positionLongitude
          positionSatellites
          positionSpeed
          timestamp
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;
export const getDailySummary = /* GraphQL */ `
  query GetDailySummary(
    $driverSub: String
    $vehicleImmat: String
    $tagId: String
    $from: String!
    $to: String!
    $page: Int!
    $mode: ReportCallMode!
  ) {
    getDailySummary(
      driverSub: $driverSub
      vehicleImmat: $vehicleImmat
      tagId: $tagId
      from: $from
      to: $to
      page: $page
      mode: $mode
    ) {
      pagesCount
      currentPageNumber
      currentPageItemsCount
      fullItemsCount
      items {
        begin
        end
        route
        duration
        distance
        totalMileage
        vehicleImmat
        vehicleBrand
        driverSub
        driverFirstname
        driverLastname
        __typename
      }
      __typename
    }
  }
`;
export const getActivityReport = /* GraphQL */ `
  query GetActivityReport(
    $driverSub: String
    $vehicleImmat: String
    $tagId: String
    $from: String!
    $to: String!
    $page: Int!
    $mode: ReportCallMode!
  ) {
    getActivityReport(
      driverSub: $driverSub
      vehicleImmat: $vehicleImmat
      tagId: $tagId
      from: $from
      to: $to
      page: $page
      mode: $mode
    ) {
      pagesCount
      currentPageNumber
      currentPageItemsCount
      fullItemsCount
      items {
        begin
        end
        route
        duration
        totalMileage
        maxSpeed
        canMileageStart
        canMileageEnd
        totalCanMileage
        totalFuelConsumed
        vehicleImmat
        vehicleBrand
        driverSub
        driverFirstname
        driverLastname
        __typename
      }
      __typename
    }
  }
`;
export const getCompany = /* GraphQL */ `
  query GetCompany($id: ID!) {
    getCompany(id: $id) {
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
export const listCompanies = /* GraphQL */ `
  query ListCompanies(
    $id: ID
    $filter: ModelCompanyFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listCompanies(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
            # createdAt
            # updatedAt
            vehicleVehicleCategoryId
            vehicleBrandBrandName
            vehicleModeleId
            vehicleDeviceImei
            __typename
          }
          nextToken
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
export const getUser = /* GraphQL */ `
  query GetUser($sub: String!) {
    getUser(sub: $sub) {
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
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $sub: String
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listUsers(
      sub: $sub
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
        #     nextToken
        #     __typename
        #   }
        #   vehicles {
        #     nextToken
        #     __typename
        #   }
        #   drivers {
        #     nextToken
        #     __typename
        #   }
        #   trames {
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
      nextToken
      __typename
    }
  }
`;
export const usersByCompanyUsersId = /* GraphQL */ `
  query UsersByCompanyUsersId(
    $companyUsersId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    usersByCompanyUsersId(
      companyUsersId: $companyUsersId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        sub
        firstname
        lastname
        password
        username
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
        # picture {
        #   bucket
        #   region
        #   key
        #   __typename
        # }
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
        #     nextToken
        #     __typename
        #   }
        #   # vehicles {
        #   #   nextToken
        #   #   __typename
        #   # }
        #   # drivers {
        #   #   nextToken
        #   #   __typename
        #   # }
        #   # trames {
        #   #   nextToken
        #   #   __typename
        #   # }
        #   createdAt
        #   updatedAt
        #   __typename
        # }
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getDriver = /* GraphQL */ `
  query GetDriver($sub: String!) {
    getDriver(sub: $sub) {
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
export const listDrivers = /* GraphQL */ `
  query ListDrivers(
    $sub: String
    $filter: ModelDriverFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listDrivers(
      sub: $sub
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
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
      nextToken
      __typename
    }
  }
`;
export const driversByDriverKey = /* GraphQL */ `
  query DriversByDriverKey(
    $driverKey: String!
    $sortDirection: ModelSortDirection
    $filter: ModelDriverFilterInput
    $limit: Int
    $nextToken: String
  ) {
    driversByDriverKey(
      driverKey: $driverKey
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
      nextToken
      __typename
    }
  }
`;
export const driversByCompanyDriversId = /* GraphQL */ `
  query DriversByCompanyDriversId(
    $companyDriversId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelDriverFilterInput
    $limit: Int
    $nextToken: String
  ) {
    driversByCompanyDriversId(
      companyDriversId: $companyDriversId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
      nextToken
      __typename
    }
  }
`;
export const getVehicle = /* GraphQL */ `
  query GetVehicle($immat: String!) {
    getVehicle(immat: $immat) {
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
            # createdAt
            # updatedAt
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
      # createdAt
      # updatedAt
      vehicleVehicleCategoryId
      vehicleBrandBrandName
      vehicleModeleId
      vehicleDeviceImei
      __typename
    }
  }
`;
export const listVehicles = /* GraphQL */ `
  query ListVehicles(
    $immat: String
    $filter: ModelVehicleFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listVehicles(
      immat: $immat
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
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
        # vehicleCategory {
        #   id
        #   category
        #   description
        #   # createdAt
        #   # updatedAt
        #   __typename
        # }
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
        # createdAt
        # updatedAt
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const vehiclesByCompanyVehiclesId = /* GraphQL */ `
  query VehiclesByCompanyVehiclesId(
    $companyVehiclesId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelVehicleFilterInput
    $limit: Int
    $nextToken: String
  ) {
    vehiclesByCompanyVehiclesId(
      companyVehiclesId: $companyVehiclesId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        immat
        code_certificat_qualite_air
        ad_blue
        AWN_genre
        emissions
        AWN_nom_commercial
        AWN_numero_de_serie
        AWN_niveau_de_bruit_au_ralenti
        AWN_consommation_ex_urbaine
        AWN_consommation_urbaine
        AWN_max_speed
        AWN_emission_co_2_prf
        AWN_depollution
        AWN_nbr_soupapes
        AWN_nbr_vitesses
        AWN_nbr_portes
        AWN_nbr_places
        AWN_propulsion
        AWN_date_30
        AWN_date_cg
        AWN_collection
        AWN_segment
        AWN_type_frein
        AWN_group
        AWN_VIN
        AWN_k_type
        AWN_version
        AWN_label
        AWN_code_moteur
        AWN_nbr_cylindre_energie
        AWN_nbr_cylindres
        AWN_energie_code
        AWN_mode_injection
        AWN_type_injection
        AWN_turbo_compressor
        AWN_vitesse_moteur
        AWN_generation
        AWN_poids_total
        AWN_poids_vide
        AWN_poids_total_roulant
        AWN_consommation_mixte
        ad_green
        AWN_poids_max_autorise
        depollution
        cl_environ_prf
        AWN_model
        AWN_model_image
        dateMiseEnCirculation
        puissanceFiscale
        puissanceDin
        energie
        AWN_puissance_KW
        boiteVitesse
        couleur
        carrosserie
        marque
        marque_id
        modele_id
        version
        immatriculation
        VIN
        k_type
        type_mine
        AWN_url_image
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
        nomVehicule
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
        vehicleVehicleCategoryId
        vehicleBrandBrandName
        vehicleModeleId
        vehicleDeviceImei
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getAlert = /* GraphQL */ `
  query GetAlert($id: ID!) {
    getAlert(id: $id) {
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
export const listAlerts = /* GraphQL */ `
  query ListAlerts(
    $id: ID
    $filter: ModelAlertFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listAlerts(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getVehicleAlerts = /* GraphQL */ `
  query GetVehicleAlerts($id: ID!) {
    getVehicleAlerts(id: $id) {
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
export const listVehicleAlerts = /* GraphQL */ `
  query ListVehicleAlerts(
    $id: ID
    $filter: ModelVehicleAlertsFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listVehicleAlerts(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
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
            createdAt
            updatedAt
            __typename
          }
          vehicles {
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
      nextToken
      __typename
    }
  }
`;
export const vehicleAlertsByVehicleImmat = /* GraphQL */ `
  query VehicleAlertsByVehicleImmat(
    $vehicleImmat: String!
    $sortDirection: ModelSortDirection
    $filter: ModelVehicleAlertsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    vehicleAlertsByVehicleImmat(
      vehicleImmat: $vehicleImmat
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
            createdAt
            updatedAt
            __typename
          }
          vehicles {
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
      nextToken
      __typename
    }
  }
`;
export const vehicleAlertsByAlertId = /* GraphQL */ `
  query VehicleAlertsByAlertId(
    $alertId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelVehicleAlertsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    vehicleAlertsByAlertId(
      alertId: $alertId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
            createdAt
            updatedAt
            __typename
          }
          vehicles {
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
      nextToken
      __typename
    }
  }
`;
export const getAlertDefinition = /* GraphQL */ `
  query GetAlertDefinition($key: AlertType!) {
    getAlertDefinition(key: $key) {
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
export const listAlertDefinitions = /* GraphQL */ `
  query ListAlertDefinitions(
    $key: AlertType
    $filter: ModelAlertDefinitionFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listAlertDefinitions(
      key: $key
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getVehicleAlertState = /* GraphQL */ `
  query GetVehicleAlertState($id: String!) {
    getVehicleAlertState(id: $id) {
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
export const listVehicleAlertStates = /* GraphQL */ `
  query ListVehicleAlertStates(
    $id: String
    $filter: ModelVehicleAlertStateFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listVehicleAlertStates(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
        vehicleAlertStateZoneId
        vehicleAlertStateVehicleImmat
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getAlertHistory = /* GraphQL */ `
  query GetAlertHistory($id: ID!) {
    getAlertHistory(id: $id) {
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
export const listAlertHistories = /* GraphQL */ `
  query ListAlertHistories(
    $id: ID
    $filter: ModelAlertHistoryFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listAlertHistories(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
            createdAt
            updatedAt
            __typename
          }
          vehicles {
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
      nextToken
      __typename
    }
  }
`;
export const getZone = /* GraphQL */ `
  query GetZone($id: ID!) {
    getZone(id: $id) {
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
export const listZones = /* GraphQL */ `
  query ListZones(
    $filter: ModelZoneFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listZones(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        lat
        lng
        radius
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getVehicleCategory = /* GraphQL */ `
  query GetVehicleCategory($id: ID!) {
    getVehicleCategory(id: $id) {
      id
      category
      description
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listVehicleCategories = /* GraphQL */ `
  query ListVehicleCategories(
    $id: ID
    $filter: ModelVehicleCategoryFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listVehicleCategories(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        category
        description
        # createdAt
        # updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getVehicleBrand = /* GraphQL */ `
  query GetVehicleBrand($brandName: String!) {
    getVehicleBrand(brandName: $brandName) {
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
export const listVehicleBrands = /* GraphQL */ `
  query ListVehicleBrands(
    $brandName: String
    $filter: ModelVehicleBrandFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listVehicleBrands(
      brandName: $brandName
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getVehicleModel = /* GraphQL */ `
  query GetVehicleModel($id: ID!) {
    getVehicleModel(id: $id) {
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
export const listVehicleModels = /* GraphQL */ `
  query ListVehicleModels(
    $id: ID
    $filter: ModelVehicleModelFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listVehicleModels(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        modele
      #   brand {
      #   brandName
      #   logo {
      #     bucket
      #     region
      #     key
      #     __typename
      #   }
      #   models {
      #     items {
      #       id
      #       modele
      #       createdAt
      #       updatedAt
      #       vehicleBrandModelsBrandName
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
        vehicleBrandModelsBrandName
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getDevice = /* GraphQL */ `
  query GetDevice($imei: String!) {
    getDevice(imei: $imei) {
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
export const listDevices = /* GraphQL */ `
  query ListDevices(
    $imei: String
    $filter: ModelDeviceFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listDevices(
      imei: $imei
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        imei
        protocolId
        sim
        vehicle {
          immat
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
        deviceVehicleImmat
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const listCompanyDevices = /* GraphQL */ `
  query ListCompanyDevices(
    $id: ID
    $filter: ModelCompanyDeviceFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listCompanyDevices(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
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
export const getTrame = /* GraphQL */ `
  query GetTrame($id: String!) {
    getTrame(id: $id) {
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
export const listTrames = /* GraphQL */ `
  query ListTrames(
    $id: String
    $filter: ModelTrameFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listTrames(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
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
  }
`;
export const tramesByCompanyTramesId = /* GraphQL */ `
  query TramesByCompanyTramesId(
    $companyTramesId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelTrameFilterInput
    $limit: Int
    $nextToken: String
  ) {
    tramesByCompanyTramesId(
      companyTramesId: $companyTramesId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
  }
`;
export const getDvD = /* GraphQL */ `
  query GetDvD($id: ID!) {
    getDvD(id: $id) {
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
export const listDvDS = /* GraphQL */ `
  query ListDvDS(
    $id: ID
    $filter: ModelDvDFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listDvDS(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
        assignmentDate
        unassignmentDate
        createdAt
        updatedAt
        dvDCompanyId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const dvDSByDvDVehicleImmat = /* GraphQL */ `
  query DvDSByDvDVehicleImmat(
    $dvDVehicleImmat: String!
    $sortDirection: ModelSortDirection
    $filter: ModelDvDFilterInput
    $limit: Int
    $nextToken: String
  ) {
    dvDSByDvDVehicleImmat(
      dvDVehicleImmat: $dvDVehicleImmat
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
        assignmentDate
        unassignmentDate
        createdAt
        updatedAt
        dvDCompanyId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const dvDSByDvDDriverSub = /* GraphQL */ `
  query DvDSByDvDDriverSub(
    $dvDDriverSub: String!
    $sortDirection: ModelSortDirection
    $filter: ModelDvDFilterInput
    $limit: Int
    $nextToken: String
  ) {
    dvDSByDvDDriverSub(
      dvDDriverSub: $dvDDriverSub
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
        assignmentDate
        unassignmentDate
        createdAt
        updatedAt
        dvDCompanyId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getDepense = /* GraphQL */ `
  query GetDepense($id: ID!) {
    getDepense(id: $id) {
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
export const listDepenses = /* GraphQL */ `
  query ListDepenses(
    $id: ID
    $filter: ModelDepenseFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listDepenses(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getLabelsCollection = /* GraphQL */ `
  query GetLabelsCollection($key: String!) {
    getLabelsCollection(key: $key) {
      key
      label
      type
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listLabelsCollections = /* GraphQL */ `
  query ListLabelsCollections(
    $key: String
    $filter: ModelLabelsCollectionFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listLabelsCollections(
      key: $key
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        key
        label
        type
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getTag = /* GraphQL */ `
  query GetTag($id: ID!) {
    getTag(id: $id) {
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
export const listTags = /* GraphQL */ `
  query ListTags(
    $filter: ModelTagFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTags(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getVehicleTags = /* GraphQL */ `
  query GetVehicleTags($id: ID!) {
    getVehicleTags(id: $id) {
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
export const listVehicleTags = /* GraphQL */ `
  query ListVehicleTags(
    $filter: ModelVehicleTagsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listVehicleTags(filter: $filter, limit: $limit, nextToken: $nextToken) {
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
        tag {
          id
          name
          description
          color
          vehicles {
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
      nextToken
      __typename
    }
  }
`;
export const vehicleTagsByVehicleImmat = /* GraphQL */ `
  query VehicleTagsByVehicleImmat(
    $vehicleImmat: String!
    $sortDirection: ModelSortDirection
    $filter: ModelVehicleTagsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    vehicleTagsByVehicleImmat(
      vehicleImmat: $vehicleImmat
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
        tag {
          id
          name
          description
          color
          vehicles {
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
      nextToken
      __typename
    }
  }
`;
export const vehicleTagsByTagId = /* GraphQL */ `
  query VehicleTagsByTagId(
    $tagId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelVehicleTagsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    vehicleTagsByTagId(
      tagId: $tagId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
        tag {
          id
          name
          description
          color
          vehicles {
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
      nextToken
      __typename
    }
  }
`;
