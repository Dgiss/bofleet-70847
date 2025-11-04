import * as queries from "../graphql/queries";
import * as mutations from "../graphql/mutations";
import { waitForAmplifyConfig, withCredentialRetry, getLazyClient } from "@/config/aws-config.js";
import { fetchAllDevices } from "./DeviceService.js";
import { cleanDataForGraphQL } from "@/lib/utils";
import { createVehicleSimple, updateVehicleSimple } from "./SimpleVehicleService.js";

const client = getLazyClient();

// Simplified GraphQL query to avoid complex nested relations
const SIMPLE_LIST_VEHICLES = `
  query ListVehiclesSimplified(
    $limit: Int
    $nextToken: String
  ) {
    listVehicles(
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        immat
        marque
        companyVehiclesId
        vehicleDeviceImei
        locations
        kilometerage
        code
        brand {
          brandName
        }
        modele {
          modele
        }
      }
      nextToken
    }
  }
`;

export const fetchAllVehiclesOptimized = async () => {
  return await withCredentialRetry(async () => {
    try {
      let allVehicles = [];
      let nextToken = null;
      let batchCount = 0;

      console.log("Récupération de tous les véhicules avec données complètes...");

      do {
        batchCount++;

        const variables = {
          limit: 1000,
          nextToken: nextToken,
        };

        console.log(`Récupération du lot ${batchCount} de véhicules`);

        const response = await client.graphql({
          query: SIMPLE_LIST_VEHICLES,
          variables: variables,
        });

        const results = response.data.listVehicles.items;
        nextToken = response.data.listVehicles.nextToken;

        console.log(
          `Lot ${batchCount}: ${results.length} véhicules récupérés, nextToken: ${nextToken ? "présent" : "absent"}`,
        );

        allVehicles = [...allVehicles, ...results];
      } while (nextToken && batchCount < 100);

      // Load companies for name resolution
      let companiesMap = {};
      try {
        const { fetchCompaniesForSelect } = await import("./CompanyVehicleDeviceService");
        const companies = await fetchCompaniesForSelect();
        companiesMap = companies.reduce((map, company) => {
          map[company.id] = company;
          return map;
        }, {});
        console.log(`Chargé ${companies.length} entreprises pour résolution des noms`);
      } catch (companyError) {
        console.warn("Impossible de charger les entreprises pour résolution des noms:", companyError);
      }

      // Enrich devices with SIM data
      const enrichedVehicles = await enrichDevicesWithSimData(allVehicles);

      const mappedVehicles = enrichedVehicles
        .map((vehicle, index) => {
          try {
            const companyName = companiesMap[vehicle?.companyVehiclesId]?.name || "Non définie";

            return {
              id: vehicle?.immat || `vehicle-${index}`,
              type: "vehicle",
              immatriculation: vehicle?.immat || "",
              entreprise: companyName,
              imei: vehicle?.vehicleDeviceImei || "",
              nomVehicule: vehicle?.nomVehicule || "",
              telephone: vehicle?.sim || "",
              typeBoitier: vehicle?.protocolId?.toString() || "",
              isAssociated: !!vehicle?.vehicleDeviceImei,
              companyVehiclesId: vehicle?.companyVehiclesId,
              vehicleDeviceImei: vehicle?.vehicleDeviceImei,
              deviceData: null,
              marque: vehicle?.brand?.brandName || "",
              modele: vehicle?.modele?.modele || "",
              kilometrage: vehicle?.kilometerage?.toString() || "",
              emplacement: vehicle?.locations || "",
              iccid: vehicle?.iccid || "",
              sim: vehicle?.sim || "",
            };
          } catch (error) {
            console.warn("Erreur mapping véhicule:", error);
            return null;
          }
        })
        .filter(Boolean);

      console.log("Mapped vehicles count:", mappedVehicles.length);
      console.log(
        "Sample vehicle data:",
        mappedVehicles.slice(0, 3).map((v) => ({
          immatriculation: v.immatriculation,
          entreprise: v.entreprise,
          vehicleDeviceImei: v.vehicleDeviceImei,
          companyVehiclesId: v.companyVehiclesId,
        })),
      );

      console.log("Véhicules chargés avec succès:", mappedVehicles.length);

      return {
        companies: Object.values(companiesMap),
        vehicles: mappedVehicles,
      };
    } catch (error) {
      console.error("Erreur principale lors de la récupération des véhicules:", error);

      // Fallback avec requête encore plus simple
      console.log("Tentative de récupération avec fallback...");

      const MINIMAL_LIST_VEHICLES = `
        query ListVehiclesMinimal(
          $limit: Int
          $nextToken: String
        ) {
          listVehicles(
            limit: $limit
            nextToken: $nextToken
          ) {
            items {
              immat
              companyVehiclesId
              vehicleDeviceImei
            }
            nextToken
          }
        }
      `;

      try {
        let allVehicles = [];
        let nextToken = null;
        let batchCount = 0;

        do {
          batchCount++;

          const variables = {
            limit: 1000,
            nextToken: nextToken,
          };

          const response = await client.graphql({
            query: MINIMAL_LIST_VEHICLES,
            variables: variables,
          });

          const results = response.data.listVehicles.items;
          nextToken = response.data.listVehicles.nextToken;

          allVehicles = [...allVehicles, ...results];
        } while (nextToken && batchCount < 50);

        // Load companies for name resolution in fallback
        let companiesMap = {};
        try {
          const { fetchCompaniesForSelect } = await import("./CompanyVehicleDeviceService");
          const companies = await fetchCompaniesForSelect();
          companiesMap = companies.reduce((map, company) => {
            map[company.id] = company;
            return map;
          }, {});
        } catch (companyError) {
          console.warn("Fallback: Impossible de charger les entreprises:", companyError);
        }

        const mappedVehicles = allVehicles
          .map((vehicle, index) => {
            try {
              const companyName = companiesMap[vehicle?.companyVehiclesId]?.name || "Non définie";

              return {
                id: vehicle?.immat || vehicle?.immatriculation || `vehicle-${index}`,
                type: "vehicle",
                immatriculation: vehicle?.immat || vehicle?.immatriculation || "",
                entreprise: companyName,
                imei: vehicle?.vehicleDeviceImei || "",
                nomVehicule: vehicle?.nomVehicule || "",
                telephone: "",
                typeBoitier: "",
                isAssociated: !!vehicle?.vehicleDeviceImei,
                companyVehiclesId: vehicle?.companyVehiclesId,
                vehicleDeviceImei: vehicle?.vehicleDeviceImei,
                deviceData: null,
                marque: vehicle?.marque || "",
                modele: vehicle?.modele || "",
                kilometrage: vehicle?.kilometrage?.toString() || "",
                emplacement: vehicle?.emplacement || "",
                iccid: "",
                sim: "",
              };
            } catch (mappingError) {
              console.warn("Erreur mapping véhicule fallback:", mappingError);
              return null;
            }
          })
          .filter(Boolean);

        console.log("Fallback réussi:", mappedVehicles.length, "véhicules");
        return {
          companies: Object.values(companiesMap),
          vehicles: mappedVehicles,
        };
      } catch (fallbackError) {
        console.error("Tous les fallbacks ont échoué:", fallbackError);
        return {
          companies: [],
          vehicles: [],
        };
      }
    }
  });
};

export const fetchCompaniesWithVehicles = async () => {
  return await withCredentialRetry(async () => {
    let allCompanies = [];
    let allVehicles = [];
    let nextToken = null;

    do {
      const variables = {
        limit: 1000,
        nextToken: nextToken,
      };

      try {
        const companyList = await client.graphql({
          query: queries.listCompanies,
          variables: variables,
        });

        const data = companyList.data.listCompanies;
        allCompanies = allCompanies.concat(data.items);
        nextToken = data.nextToken;
      } catch (error) {
        throw new Error(`Failed to fetch companies: ${error.message}`);
      }
    } while (nextToken);

    const devices = await fetchAllDevices();

    let totalVehiclesFromCompanies = 0;
    for (const company of allCompanies) {
      try {
        let companyNextToken = null;
        do {
          const vehiclesResult = await client.graphql({
            query: queries.vehiclesByCompanyVehiclesId,
            variables: {
              companyVehiclesId: company.id,
              limit: 1000,
              nextToken: companyNextToken,
            },
          });

          const vehiclesData = vehiclesResult.data.vehiclesByCompanyVehiclesId;

          const companyVehicles = vehiclesData.items.map((vehicle) => {
            const mappedVehicle = {
              ...vehicle,
              entreprise: vehicle.company?.name || company.name || "Non définie",
              type: "vehicle",
              immatriculation: vehicle.immat || "",
              nomVehicule: vehicle.nomVehicule || vehicle.code || "",
              imei: vehicle.vehicleDeviceImei || vehicle.device?.imei || "",
              typeBoitier: vehicle.device?.protocolId?.toString() || "",
              marque: vehicle.marque || vehicle.brand?.brandName || "",
              modele: vehicle.modele_id || vehicle.modele?.modele || "",
              kilometrage: vehicle.kilometerage?.toString() || "",
              telephone: vehicle.device?.sim || "",
              emplacement: vehicle.locations || "",
              deviceData: vehicle.device || null,
              isAssociated: !!(vehicle.vehicleDeviceImei || vehicle.device?.imei),
              AWN_nom_commercial: vehicle.AWN_nom_commercial || "",
              energie: vehicle.energie || "",
              puissanceFiscale: vehicle.puissanceFiscale || "",
              couleur: vehicle.couleur || "",
              dateMiseEnCirculation: vehicle.dateMiseEnCirculation || "",
              VIN: vehicle.VIN || vehicle.AWN_VIN || "",
            };

            totalVehiclesFromCompanies++;
            return mappedVehicle;
          });

          allVehicles = allVehicles.concat(companyVehicles);
          companyNextToken = vehiclesData.nextToken;
        } while (companyNextToken);
      } catch (error) {
        // Log error but continue processing other companies
      }
    }

    const associatedDeviceImeis = new Set(
      allVehicles.map((v) => v.vehicleDeviceImei || v.deviceData?.imei).filter(Boolean),
    );

    const unassociatedDevices = devices
      .filter((device) => device.imei && !associatedDeviceImeis.has(device.imei))
      .map((device) => ({
        id: device.imei,
        entreprise: "Boîtier libre",
        type: "device",
        immatriculation: "",
        nomVehicule: "",
        imei: device.imei,
        typeBoitier: device.protocolId?.toString() || "",
        marque: "",
        modele: "",
        kilometrage: "",
        telephone: device.sim || "",
        emplacement: "",
        deviceData: device,
        isAssociated: false,
        iccid: generateMockIccid(device.sim || device.imei),
        sim: device.sim || "",
      }));

    const allDevices = [...allVehicles, ...unassociatedDevices];

    return { companies: allCompanies, vehicles: allDevices };
  });
};

/**
 * Enrichir les devices avec les données SIM/ICCID
 */
const enrichDevicesWithSimData = async (vehicles) => {
  try {
    // Récupérer les devices pour enrichir avec SIM/ICCID
    const devices = await fetchAllDevices();
    const deviceMap = devices.reduce((map, device) => {
      map[device.imei] = device;
      return map;
    }, {});

    return vehicles.map((vehicle) => {
      const device = deviceMap[vehicle?.vehicleDeviceImei];
      if (device) {
        return {
          ...vehicle,
          sim: device.sim || "",
          iccid: generateMockIccid(device.sim || device.imei),
          protocolId: device.protocolId,
        };
      }
      return vehicle;
    });
  } catch (error) {
    console.warn("Erreur enrichissement données SIM:", error);
    return vehicles;
  }
};

export const updateVehicleData = async (data) => {
  return await updateVehicleSimple(data);
};

export const createVehicleData = async (data) => {
  return await createVehicleSimple(data);
};

export const deleteVehicleData = async (item) => {
  await waitForAmplifyConfig();

  const cleanedItem = cleanDataForGraphQL(item);

  const vehicleDetails = {
    immat: cleanedItem.immat || cleanedItem.immatriculation,
  };

  await client.graphql({
    query: mutations.deleteVehicle,
    variables: { input: vehicleDetails },
  });
};

/**
 * Associate a vehicle to a device with unique validation
 */
export const associateVehicleToDevice = async (vehicleImmat, deviceImei) => {
  return await withCredentialRetry(async () => {
    try {
      // VALIDATION CRITIQUE: Vérifier l'unicité du device
      const existingVehicleQuery = /* GraphQL */ `
        query CheckDeviceAssociation($deviceImei: String!) {
          listVehicles(filter: {vehicleDeviceImei: {eq: $deviceImei}}) {
            items {
              immat
              vehicleDeviceImei
            }
          }
        }
      `;

      const existingResponse = await client.graphql({
        query: existingVehicleQuery,
        variables: {
          deviceImei: deviceImei,
        },
      });

      const existingVehicles = existingResponse.data?.listVehicles?.items || [];
      const otherVehicleWithDevice = existingVehicles.find((v) => v.immat !== vehicleImmat);

      if (otherVehicleWithDevice) {
        throw new Error(
          `Le boîtier ${deviceImei} est déjà associé au véhicule ${otherVehicleWithDevice.immat}. Un boîtier ne peut être associé qu'à un seul véhicule.`,
        );
      }

      const updateInput = {
        immat: vehicleImmat,
        vehicleDeviceImei: deviceImei,
      };

      const simpleUpdateVehicle = /* GraphQL */ `
        mutation UpdateVehicle($input: UpdateVehicleInput!) {
          updateVehicle(input: $input) {
            immat
            vehicleDeviceImei
            updatedAt
            __typename
          }
        }
      `;

      const vehicleUpdate = await client.graphql({
        query: simpleUpdateVehicle,
        variables: {
          input: updateInput,
        },
      });

      return { success: true, vehicleUpdate: vehicleUpdate.data?.updateVehicle };
    } catch (error) {
      throw error;
    }
  });
};

export const dissociateVehicleFromDevice = async (vehicleImmat) => {
  return await withCredentialRetry(async () => {
    console.log("=== DISSOCIATING VEHICLE FROM DEVICE ===");
    console.log("Vehicle immat:", vehicleImmat);

    try {
      const minimalUpdateVehicle = /* GraphQL */ `
        mutation UpdateVehicle($input: UpdateVehicleInput!) {
          updateVehicle(input: $input) {
            immat
            vehicleDeviceImei
            updatedAt
            __typename
          }
        }
      `;

      const vehicleUpdate = await client.graphql({
        query: minimalUpdateVehicle,
        variables: {
          input: {
            immat: vehicleImmat,
            vehicleDeviceImei: null,
          },
        },
      });

      console.log("GraphQL response received:", {
        hasData: !!vehicleUpdate.data,
        hasUpdateVehicle: !!vehicleUpdate.data?.updateVehicle,
        hasErrors: !!vehicleUpdate.errors,
        errorCount: vehicleUpdate.errors?.length || 0,
      });

      // Check if the update was successful even with potential non-critical errors
      if (vehicleUpdate.data?.updateVehicle) {
        console.log("✅ Dissociation successful for vehicle:", vehicleImmat);
        if (vehicleUpdate.errors && vehicleUpdate.errors.length > 0) {
          console.warn("⚠️ Non-critical errors during dissociation:", vehicleUpdate.errors);
          // Log each error for debugging
          vehicleUpdate.errors.forEach((err, index) => {
            console.warn(`Error ${index + 1}:`, err);
          });
        }
        return { success: true, vehicleUpdate: vehicleUpdate.data.updateVehicle };
      } else {
        console.error("❌ No data returned from updateVehicle");
        if (vehicleUpdate.errors) {
          console.error("GraphQL errors:", vehicleUpdate.errors);
        }
        throw new Error("Failed to dissociate vehicle from device - no data returned");
      }
    } catch (error) {
      console.error("❌ Exception during dissociation:", error);

      // Handle GraphQL response with errors but potential data
      if (error.data?.updateVehicle) {
        console.log("🔄 Operation may have succeeded despite errors");
        return { success: true, vehicleUpdate: error.data.updateVehicle };
      }

      throw error;
    }
  });
};

export const associateDeviceToVehicle = async (deviceImei, vehicleImmat) => {
  return await associateVehicleToDevice(vehicleImmat, deviceImei);
};

// Helper function to generate mock ICCID based on SIM/IMEI for demonstration
const generateMockIccid = (simOrImei) => {
  if (!simOrImei) return "";

  // Generate a realistic ICCID format: 19-20 digits
  const base = simOrImei.slice(-10);
  const prefix = "8933101234567890";
  return prefix + base.slice(0, 4);
};
