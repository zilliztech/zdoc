---
slug: /api-comparison
beta: FALSE
notebook: FALSE
sidebar_position: 2
---



# API Availability

Zilliz Cloud operates slightly differently from Milvus in order to provide a better user experience. This article aims to clarify the differences between the two platforms in terms of APIs.

If you are planning to migrate from Milvus to Zilliz Cloud, you may need to make some necessary changes to your legacy code.

## Scenario-specific privileges{#scenario-specific-privileges}

|                                   |  **API**                       |  **Ops on GUI** |  **Starter tier** |  **Standard & Enterprise tiers** |
| --------------------------------- | ------------------------------ | --------------- | ----------------- | -------------------------------- |
|  Alias                            |  alterAlias()                  |  ✘              |  ✘                |  ✘                               |
|                                   |  createAlias()                 |  ✘              |  ✘                |  ✘                               |
|                                   |  dropAlias()                   |  ✘              |  ✘                |  ✘                               |
|  Authentication                   |  createCredential()            |  ✔︎             |  ✘                |  ✘                               |
|                                   |  deleteCredential()            |  ✔︎             |  ✘                |  ✘                               |
|                                   |  listCredUsers()               |  ✔︎             |  ✘                |  ✘                               |
|                                   |  updateCredential()            |  ✔︎             |  ✘                |  ✘                               |
|  BulkInsert                       |  bulkInsert()                  |  ✔︎             |  ✘                |  ✘                               |
|                                   |  getBulkInsertState()          |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  listBulkInsertTasks()         |  ✔︎             |  ✔︎               |  ✔︎                              |
|  Collection                       |  getCollectionStatistics()     |  ✘              |  ✔︎               |  ✔︎                              |
|                                   |  getLoadingProgress()          |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  getPersistentSgementInfo()    |  ✘              |  ✘                |  ✘                               |
|                                   |  getQuerySegmentInfo()         |  ✘              |  ✘                |  ✘                               |
|                                   |  getReplicas()                 |  ✘              |  ✘                |  ✘                               |
|                                   |  insert()                      |  ✘              |  ✔︎               |  ✔︎                              |
|                                   |  loadCollection()              |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  releaseCollection()           |  ✔︎             |  ✘                |  ✔︎                              |
|                                   |  showCollections()             |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  getLoadState()                |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  renameCollection()            |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  upsert()                      |  ✘              |  ✔︎               |  ✔︎                              |
|  Database                         |  ListDatabases                 |  ✘              |  ✘                |  ✔︎                              |
|                                   |  DropDatabase                  |  ✘              |  ✘                |  ✔︎                              |
|                                   |  CreateDatabase                |  ✘              |  ✘                |  ✔︎                              |
|  Index                            |  createIndex()                 |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  describeIndex()               |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  dropIndex()                   |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  getIndexBuildProgress()       |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  getIndexState()               |  ✔︎             |  ✔︎               |  ✔︎                              |
|  Management                       |  getCompactionState()          |  ✘              |  ✔︎               |  ✔︎                              |
|                                   |  getCompactionStateWithPlan()  |  ✘              |  ✔︎               |  ✔︎                              |
|                                   |  getFlushState()               |  ✘              |  ✔︎               |  ✔︎                              |
|                                   |  getMetrics()                  |  ✘              |  ✘                |  ✘                               |
|                                   |  loadBalance()                 |  ✘              |  ✘                |  ✘                               |
|                                   |  manualCompact()               |  ✘              |  ✘                |  ✔︎                              |
|  Partition                        |  createPartition()             |  ✘              |  ✘                |  ✘                               |
|                                   |  dropPartition()               |  ✘              |  ✘                |  ✘                               |
|                                   |  getPartitionStatistics()      |  ✘              |  ✘                |  ✘                               |
|                                   |  hasPartiotion()               |  ✘              |  ✘                |  ✘                               |
|                                   |  loadPartitions()              |  ✘              |  ✘                |  ✘                               |
|                                   |  releasePartitions()           |  ✘              |  ✘                |  ✘                               |
|                                   |  showPartitions()              |  ✘              |  ✘                |  ✘                               |
|  Search & Query                   |  search()                      |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  query()                       |  ✘              |  ✔︎               |  ✔︎                              |
|  Role-based access control (RBAC) |  addUserToRole()               |  ✘              |  ✘                |  ✘                               |
|                                   |  createRole()                  |  ✘              |  ✘                |  ✘                               |
|                                   |  dropRole()                    |  ✘              |  ✘                |  ✘                               |
|                                   |  grantRolePrivilege()          |  ✘              |  ✘                |  ✘                               |
|                                   |  removeUserFromRole()          |  ✘              |  ✘                |  ✘                               |
|                                   |  revokeRolePrivilege           |  ✘              |  ✘                |  ✘                               |
|                                   |  selectGrantForRole()          |  ✘              |  ✘                |  ✘                               |
|                                   |  selectGrantForRoleAndObject() |  ✘              |  ✘                |  ✘                               |
|                                   |  selectRole()                  |  ✘              |  ✘                |  ✘                               |
|                                   |  selectUser()                  |  ✘              |  ✘                |  ✘                               |
|  System                           |  getVersion()                  |  ✘              |  ✘                |  ✘                               |
|                                   |  checkHealth()                 |  ✘              |  ✔︎               |  ✔︎                              |

## Related topics{#related-topics}

- [Migrate from Milvus 1.x](./migrate-from-milvus) 

- [Migrate from Milvus 2.x](https://zilliverse.feishu.cn/wiki/RGndwk5HoiIl71k1KHZcz7mEnYd) 

- [AUTOINDEX Explained](./autoindex-explained) 

- [CU Types Explained](./cu-types-explained-1) 

- [Other Differences](https://zilliverse.feishu.cn/wiki/CvbnwjZ32iJmOrkX3I9ct46BnUe) 
