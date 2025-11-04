/**
 * Mock data service to provide test data when GraphQL is unavailable
 */

// Mock companies data
const mockCompanies = [
  { id: "1", name: "Transport Dupont", siret: "12345678901234" },
  { id: "2", name: "Logistique Martin", siret: "23456789012345" },
  { id: "3", name: "aaaa", siret: "34567890123456" },
  { id: "4", name: "Express Delivery", siret: "45678901234567" },
  { id: "5", name: "Route 66 Transport", siret: "56789012345678" }
];

// Mock vehicles data
const mockVehicles = [
  {
    id: "v1",
    immatriculation: "AB-123-CD",
    nomVehicule: "Camion 1",
    entreprise: "Transport Dupont",
    marque: "Renault",
    modele: "Master",
    imei: "123456789012345",
    typeBoitier: "GPS Tracker",
    telephone: "0612345678",
    emplacement: "Paris",
    type: "vehicle",
    isAssociated: true
  },
  {
    id: "v2", 
    immatriculation: "EF-456-GH",
    nomVehicule: "Utilitaire 2",
    entreprise: "aaaa",
    marque: "Peugeot",
    modele: "Partner",
    imei: "234567890123456",
    typeBoitier: "GPS Simple",
    telephone: "0623456789",
    emplacement: "Lyon",
    type: "vehicle",
    isAssociated: true
  },
  {
    id: "v3",
    immatriculation: "GH-789-IJ",
    nomVehicule: "Camionnette 3",
    entreprise: "aaaa",
    marque: "Ford",
    modele: "Transit",
    imei: "345678901234568",
    typeBoitier: "GPS Pro",
    telephone: "0645678901",
    emplacement: "Marseille",
    type: "vehicle",
    isAssociated: true
  },
  {
    id: "v4",
    immatriculation: "KL-012-MN",
    nomVehicule: "Fourgon 4",
    entreprise: "Logistique Martin",
    marque: "Mercedes",
    modele: "Sprinter",
    imei: "456789012345679",
    typeBoitier: "GPS Standard",
    telephone: "0656789012",
    emplacement: "Toulouse",
    type: "vehicle",
    isAssociated: true
  },
  {
    id: "v5",
    immatriculation: "OP-345-QR",
    nomVehicule: "Véhicule 5",
    entreprise: "Express Delivery",
    marque: "Iveco",
    modele: "Daily",
    imei: "567890123456780",
    typeBoitier: "GPS Compact",
    telephone: "0667890123",
    emplacement: "Nice",
    type: "vehicle",
    isAssociated: true
  },
  {
    id: "d1",
    immatriculation: "",
    nomVehicule: "",
    entreprise: "Boîtier libre",
    marque: "",
    modele: "",
    imei: "345678901234567",
    typeBoitier: "GPS Avancé",
    telephone: "0634567890",
    emplacement: "",
    type: "device",
    isAssociated: false
  },
  {
    id: "d2",
    immatriculation: "",
    nomVehicule: "",
    entreprise: "Transport Dupont",
    marque: "",
    modele: "",
    imei: "678901234567891",
    typeBoitier: "GPS Basic",
    telephone: "0678901234",
    emplacement: "",
    type: "device",
    isAssociated: false
  },
  {
    id: "d3",
    immatriculation: "",
    nomVehicule: "",
    entreprise: "aaaa",
    marque: "",
    modele: "",
    imei: "789012345678902",
    typeBoitier: "GPS Premium",
    telephone: "0689012345",
    emplacement: "",
    type: "device",
    isAssociated: false
  }
];

/**
 * Mock function to simulate fetchCompaniesWithVehicles
 */
export const fetchMockCompaniesWithVehicles = async () => {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    companies: mockCompanies,
    vehicles: mockVehicles
  };
};

/**
 * Mock function to simulate company search with filtering
 */
export const searchMockCompanies = async (searchTerm) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  if (!searchTerm) return mockCompanies;
  
  return mockCompanies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

/**
 * Get all unique company names from mock data
 */
export const getMockCompanyNames = () => {
  return [...new Set(mockVehicles.map(v => v.entreprise).filter(Boolean))];
};