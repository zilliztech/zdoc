---
slug: /api-comparison
beta: FALSE
notebook: FALSE
token: DAk8w3GCJiuUTTkms6IcMtnAnMf
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# API Availability

Zilliz Cloud operates slightly differently from Milvus in order to provide a better user experience. This article aims to clarify the differences between the two platforms in terms of APIs.

If you are planning to migrate from Milvus to Zilliz Cloud, you may need to make some necessary changes to your legacy code.

## Scenario-specific privileges{#scenario-specific-privileges}

|                                   |  __API__                       |  __Ops on GUI__ |  __Starter tier__ |  __Standard & Enterprise tiers__ |
| --------------------------------- | ------------------------------ | --------------- | ----------------- | -------------------------------- |
|  Alias                            |  alterAlias()                  |  ✘              |  ✘                |  ✘                               |
|                                   |  createAlias()                 |  ✘              |  ✘                |  ✘                               |
|                                   |  dropAlias()                   |  ✘              |  ✘                |  ✘                               |
|  Authentication                   |  createCredential()            |  ✔︎             |  ✘                |  ✔︎                              |
|                                   |  deleteCredential()            |  ✔︎             |  ✘                |  ✔︎                              |
|                                   |  listCredUsers()               |  ✔︎             |  ✘                |  ✔︎                              |
|                                   |  updateCredential()            |  ✔︎             |  ✘                |  ✔︎                              |
|  BulkInsert                       |  bulkInsert()                  |  ✔︎             |  ✘                |  ✘                               |
|                                   |  getBulkInsertState()          |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  listBulkInsertTasks()         |  ✔︎             |  ✔︎               |  ✔︎                              |
|  Collection                       |  getCollectionStatistics()     |  ✘              |  ✔︎               |  ✔︎                              |
|                                   |  createCollection()            |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  describeCollection()          |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  dropCollection()              |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  alterCollection()             |  ✘              |  ✔︎               |  ✔︎                              |
|                                   |  getLoadingProgress()          |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  getPersistentSgementInfo()    |  ✘              |  ✘                |  ✘                               |
|                                   |  getQuerySegmentInfo()         |  ✘              |  ✘                |  ✘                               |
|                                   |  getReplicas()                 |  ✘              |  ✘                |  ✘                               |
|                                   |  insert()                      |  ✘              |  ✔︎               |  ✔︎                              |
|                                   |  loadCollection()              |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  releaseCollection()           |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  showCollections()             |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  getLoadState()                |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  renameCollection()            |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  upsert()                      |  ✘              |  ✔︎               |  ✔︎                              |
|  Database                         |  ListDatabases                 |  ✘              |  ✘                |  ✘                               |
|                                   |  DropDatabase                  |  ✘              |  ✘                |  ✘                               |
|                                   |  CreateDatabase                |  ✘              |  ✘                |  ✘                               |
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
|  Partition                        |  createPartition()             |  ✘              |  ✔︎               |  ✔︎                              |
|                                   |  dropPartition()               |  ✘              |  ✔︎               |  ✔︎                              |
|                                   |  getPartitionStatistics()      |  ✘              |  ✔︎               |  ✔︎                              |
|                                   |  hasPartiotion()               |  ✘              |  ✔︎               |  ✔︎                              |
|                                   |  loadPartitions()              |  ✘              |  ✔︎               |  ✔︎                              |
|                                   |  releasePartitions()           |  ✘              |  ✔︎               |  ✔︎                              |
|                                   |  showPartitions()              |  ✘              |  ✔︎               |  ✔︎                              |
|  Search & Query                   |  search()                      |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  query()                       |  ✘              |  ✔︎               |  ✔︎                              |
|  Role-based access control (RBAC) |  addUserToRole()               |  ✔︎             |  ✘<br/>        |  ✔︎<br/>                      |
|                                   |  createRole()                  |  ✘              |  ✘                |  ✘                               |
|                                   |  dropRole()                    |  ✘              |  ✘                |  ✘                               |
|                                   |  grantRolePrivilege()          |  ✘              |  ✘                |  ✘                               |
|                                   |  removeUserFromRole()          |  ✔︎             |  ✘                |  ✔︎                              |
|                                   |  revokeRolePrivilege()         |  ✘              |  ✘                |  ✘                               |
|                                   |  selectGrantForRole()          |  ✘              |  ✘                |  ✔︎                              |
|                                   |  selectGrantForRoleAndObject() |  ✘              |  ✘                |  ✔︎                              |
|                                   |  selectRole()                  |  ✘              |  ✘                |  ✔︎                              |
|                                   |  selectUser()                  |  ✘              |  ✘                |  ✔︎                              |
|  System                           |  getVersion()                  |  ✔︎             |  ✔︎               |  ✔︎                              |
|                                   |  checkHealth()                 |  ✘              |  ✔︎               |  ✔︎                              |

## Related topics{#related-topics}

- [Migrate from Milvus 1.x](./migrate-from-milvus)

- [AUTOINDEX Explained](./autoindex-explained)

- [Select the Right CU](./cu-types-explained) 

