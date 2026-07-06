---
title: "VectorDB Audit Logs Reference | BYOC"
slug: /audit-logs-ref
sidebar_label: "VectorDB Audit Logs Reference"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "On Zilliz Cloud, audit logs have the following syntax | BYOC"
type: origin
token: Nby4wCqNviuLg3kEZpkcdKtnnnb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# VectorDB Audit Logs Reference

On Zilliz Cloud, audit logs have the following syntax:

```json
{
    "date": "<timestamp>",
    "action": "<action_type>",
    "cluster_id": "<unique_cluster_identifier>",
    "database": "<database_name>",
    "interface": "<interface_type>",
    "log_type": "<log_type>",
    "params": {
        "<key1>": "<value1>",
        "<key2>": "<value2>",
      ...
    },
    "result": <result_code>,
    "status": "<action_status>",
    "time": <timestamp>,
    "trace_id": "<unique_trace_identifier>",
    "user": "<user_identifier>"
}
```

<table>
   <tr>
     <th><p>Field</p></th>
     <th><p>Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>date</code></p></td>
     <td><p>String (ISO 8601 format)</p></td>
     <td><p>The timestamp when the action occurred, in UTC (e.g., <code>"2025-01-21T08:38:39.494527Z"</code>).</p></td>
   </tr>
   <tr>
     <td><p><code>action</code></p></td>
     <td><p>String</p></td>
     <td><p>The action performed (e.g., <code>"DescribeCollection"</code>). For a list of actions available, refer to <a href="./audit-logs-ref">List of actions</a>.</p></td>
   </tr>
   <tr>
     <td><p><code>cluster_id</code></p></td>
     <td><p>String</p></td>
     <td><p>Unique identifier for the cluster where the action occurred (e.g. <code>"in01-b5a7e190615xxxf"</code>).</p></td>
   </tr>
   <tr>
     <td><p><code>database</code></p></td>
     <td><p>String</p></td>
     <td><p>The name of the database involved in the action (e.g., <code>"default"</code>).</p></td>
   </tr>
   <tr>
     <td><p><code>interface</code></p></td>
     <td><p>string</p></td>
     <td><p>The interface through which the action is performed (e.g., <code>"Grpc"</code>, <code>"Restful"</code>).</p></td>
   </tr>
   <tr>
     <td><p><code>log_type</code></p></td>
     <td><p>String</p></td>
     <td><p>The type of log entry (e.g., <code>"AUDIT"</code>).</p></td>
   </tr>
   <tr>
     <td><p><code>params</code></p></td>
     <td><p>Object (key-value pairs)</p></td>
     <td><p>Additional parameters related to the action. This can include things like <code>collection</code>, <code>consistency_level</code>, etc.</p></td>
   </tr>
   <tr>
     <td><p><code>result</code></p></td>
     <td><p>Integer</p></td>
     <td><p>Result code or status code (e.g., <code>0</code> for success, other codes may indicate errors). Unavailable when the <code>status</code> is <code>Receive</code>.</p></td>
   </tr>
   <tr>
     <td><p><code>status</code></p></td>
     <td><p>String</p></td>
     <td><p>The status of the action being logged (e.g., <code>Receive</code>, <code>Success</code>, <code>Failed</code>).</p><ul><li><p><code>Receive</code>: The action has been received by the system but is not completed.</p></li><li><p><code>Success</code>: The action has been successfully completed without any issues.</p></li><li><p><code>Failed</code>: The action failed.</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>time</code></p></td>
     <td><p>Integer (epoch time, milliseconds)</p></td>
     <td><p>Timestamp in milliseconds since 1970 (epoch time).</p></td>
   </tr>
   <tr>
     <td><p><code>trace_id</code></p></td>
     <td><p>String</p></td>
     <td><p>Unique identifier for tracing the request across systems. This helps link logs together.</p></td>
   </tr>
   <tr>
     <td><p><code>user</code></p></td>
     <td><p>String</p></td>
     <td><p>The user who performed the action.</p></td>
   </tr>
</table>

## List of actions\{#list-of-actions}

The following tables summarize actions on the data plane that can be logged for auditing.

### Connection\{#connection}

| `action` | Description |
| --- | --- |
| Connect | Establish a connection |

### Database\{#database}

| `action` | Description |
| --- | --- |
| ListDatabases | View all databases in the current instance |
| DescribeDatabase | View the details of a database |
| CreateDatabase | Create a database |
| DropDatabase | Drop a database |
| AlterDatabase | Modify the properties of a database |

### Collection\{#collection}

| `action` | Description |
| --- | --- |
| GetLoadState | Check the load status of a collection |
| GetLoadingProgress | Check the loading progress of a collection |
| DescribeCollection | View the details of a collection |
| CreateCollection | Create a collection |
| HasCollection | Check if a collection exists in the database |
| DropCollection | Drop a collection |
| LoadCollection | Load a collection |
| AlterCollection | Alter the schema or configuration of a collection |
| ShowCollections | View all collections with collection privileges |
| RenameCollection | Rename a collection |
| ReleaseCollection | Release a collection |
| GetCollectionStatistics | Obtain the statistics of a collection (eg. The number of entities in a collection) |
| Flush | Persist all entities in a collection to a sealed segment. Any entity inserted after the flush operation will be stored in a new segment. |
| GetFlushState | Check the status of the collection flush operation |
| CreateAlias | Create an alias for a collection |
| DescribeAlias | Describe the alias of a collection |
| AlterAlias | Change the alias associated with a collection |
| ListAliases | View all aliases of a collection |
| DropAlias | Drop the alias of a collection |
| GetReplicas | Get the replicas of a collection |

### Partition\{#partition}

| `action` | Description |
| --- | --- |
| CreatePartition | Create a partition |
| HasPartition | Check whether a partition exists |
| LoadPartitions | Load one or more partitions |
| ShowPartitions | View all partitions in a collection |
| DropPartition | Drop a partition |
| ReleasePartitions | Release one or more partitions |
| GetPartitionStatistics | Obtain the statistics of a partition |

### Index\{#index}

| `action` | Description |
| --- | --- |
| CreateIndex | Create an index |
| DescribeIndex | View the progress of index building for a collection |
| AlterIndex | Update the configuration or parameters of an existing index |
| GetIndexState | Update the configuration or parameters of an existing index |
| GetIndexStatistics | Retrieve the current state of an index (e.g., `building`, `built`, or `failed`) |
| GetIndexBuildProgress | Obtain detailed statistics about an index, such as memory usage or indexed entity count |
| DropIndex | Retrieve detailed index data for a specific segment in a collection |

### Entity\{#entity}

| `action` | Description |
| --- | --- |
| Insert | Insert entities |
| Query | Conduct a query |
| Search | Conduct a search |
| HybridSearch | Conduct a hybrid search |
| Delete | Delete entities |
| Upsert | Upsert entities |

### RBAC\{#rbac}

| `action` | Description |
| --- | --- |
| SelectRole | Retrieve the list of roles available in the current instance |
| CreateRole | Define a new role for managing user permissions |
| DropRole | Drop a role |
| OperateUserRole | Assign a role to a user or remove a role from a user |
| ListPrivilegeGroups | View all privilege groups in the current instance |
| OperatePrivilegeV2 | Add or remove specific privileges from a privilege group |
| SelectGrant | Retrieve a list of all privilege grants assigned to a specific role or user |
| CreateCredential | Create a new credential (e.g., API key or token) for accessing the system |
| UpdateCredential | Update the properties or permissions of an existing credential |
| DeleteCredential | Remove a credential from the system |
| ListCredUsers | Retrieve a list of all users associated with specific credentials |

### Others\{#others}

| `action` | Description |
| --- | --- |
| Authorize | Logged only when authorization fails, with the `status` recorded as `Refused`. |

