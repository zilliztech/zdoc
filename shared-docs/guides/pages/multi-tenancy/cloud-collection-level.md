- **Scalability**: Since a cluster can hold up to 16,384 collections, this strategy can accommodate the same number of tenants within the cluster.

- **Data isolation**: Collections are physically isolated from one another. This strategy provides strong data isolation.

- **Flexibility**: This strategy allows each collection to have its own schema, accommodating tenants with different data schemas.

- **Others**: This strategy also supports RBAC, allowing for granular access control over tenants. Additionally, you can flexibly load or release data for specific tenants to manage hot and cold data effectively.
