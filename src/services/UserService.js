
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';
import { getLazyClient } from '@/config/aws-config.js';

const client = getLazyClient();

export const fetchUsers = async () => {
  let allUsers = [];
  let nextToken = null;
  
  do {
    const variables = {
      limit: 4000,
      nextToken: nextToken
    };
    
    const userList = await client.graphql({
      query: queries.listUsers,
      variables: variables
    });
    
    const data = userList.data.listUsers;
    allUsers = allUsers.concat(data.items);
    nextToken = data.nextToken;
    
  } while (nextToken);
  
  // Add login and password data
  return allUsers.map(user => ({
    ...user,
    nom: user.sub || user.firstname || 'N/A',
    motDePasse: `${user.firstname || 'user'}${new Date().getFullYear()}`,
    entreprise: 'N/A' // Will be populated when we have company data
  }));
};

export const fetchFilteredUsers = async (searchName, searchEnterprise) => {
  let filtersArray = [];
  
  if (searchName && searchName.trim()) {
    filtersArray.push({ 
      or: [
        { firstname: { contains: searchName.trim() } },
        { lastname: { contains: searchName.trim() } },
        { sub: { contains: searchName.trim() } }
      ]
    });
  }
  
  if (searchEnterprise && searchEnterprise.trim()) {
    // This would need to be filtered after getting company data
  }
  
  let nextToken = null;
  let allUsers = [];

  const variables = {
    limit: 6000,
    ...(filtersArray.length > 0 && { filter: { and: filtersArray } })
  };

  do {
    const queryVariables = { ...variables, nextToken };

    const res = await client.graphql({
      query: queries.listUsers,
      variables: queryVariables
    });

    const fetchedUsers = res.data.listUsers.items;
    allUsers = [...allUsers, ...fetchedUsers];
    nextToken = res.data.listUsers.nextToken;
  } while (nextToken); 

  return allUsers.map(user => ({
    ...user,
    nom: user.sub || user.firstname || 'N/A',
    motDePasse: `${user.firstname || 'user'}${new Date().getFullYear()}`,
    entreprise: 'N/A' // Will be populated when we have company data
  }));
};

export const updateUserData = async (data) => {
  const userDetails = {
    sub: data.sub,
    firstname: data.firstname,
    lastname: data.lastname,
    mobile: data.mobile,
    companyUsersId: data.companyUsersId
  };

  await client.graphql({
    query: mutations.updateUser,
    variables: {
      input: userDetails
    }
  });
};

export const deleteUserData = async (item) => {
  const userDetails = {
    sub: item.sub
  };

  await client.graphql({
    query: mutations.deleteUser,
    variables: { input: userDetails }
  });
};
