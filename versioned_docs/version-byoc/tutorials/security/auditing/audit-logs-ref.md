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
keywords: 
  - zilliz
  - vector database
  - cloud
  - auditing
  - log
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search

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

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Connect</p></td>
     <td><p>Establish a connection</p></td>
   </tr>
</table>

### Database\{#database}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>ListDatabases</p></td>
     <td><p>View all databases in the current instance</p></td>
   </tr>
   <tr>
     <td><p>DescribeDatabase</p></td>
     <td><p>View the details of a database</p></td>
   </tr>
   <tr>
     <td><p>CreateDatabase</p></td>
     <td><p>Create a database</p></td>
   </tr>
   <tr>
     <td><p>DropDatabase</p></td>
     <td><p>Drop a database</p></td>
   </tr>
   <tr>
     <td><p>AlterDatabase</p></td>
     <td><p>Modify the properties of a database</p></td>
   </tr>
</table>

### Collection\{#collection}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>GetLoadState</p></td>
     <td><p>Check the load status of a collection</p></td>
   </tr>
   <tr>
     <td><p>GetLoadingProgress</p></td>
     <td><p>Check the loading progress of a collection</p></td>
   </tr>
   <tr>
     <td><p>DescribeCollection</p></td>
     <td><p>View the details of a collection</p></td>
   </tr>
   <tr>
     <td><p>CreateCollection</p></td>
     <td><p>Create a collection</p></td>
   </tr>
   <tr>
     <td><p>HasCollection</p></td>
     <td><p>Check if a collection exists in the database</p></td>
   </tr>
   <tr>
     <td><p>DropCollection</p></td>
     <td><p>Drop a collection</p></td>
   </tr>
   <tr>
     <td><p>LoadCollection</p></td>
     <td><p>Load a collection</p></td>
   </tr>
   <tr>
     <td><p>AlterCollection</p></td>
     <td><p>Alter the schema or configuration of a collection</p></td>
   </tr>
   <tr>
     <td><p>ShowCollections</p></td>
     <td><p>View all collections with collection privileges</p></td>
   </tr>
   <tr>
     <td><p>RenameCollection</p></td>
     <td><p>Rename a collection</p></td>
   </tr>
   <tr>
     <td><p>ReleaseCollection</p></td>
     <td><p>Release a collection</p></td>
   </tr>
   <tr>
     <td><p>GetCollectionStatistics</p></td>
     <td><p>Obtain the statistics of a collection (eg. The number of entities in a collection)</p></td>
   </tr>
   <tr>
     <td><p>Flush</p></td>
     <td><p>Persist all entities in a collection to a sealed segment. Any entity inserted after the flush operation will be stored in a new segment.</p></td>
   </tr>
   <tr>
     <td><p>GetFlushState</p></td>
     <td><p>Check the status of the collection flush operation</p></td>
   </tr>
   <tr>
     <td><p>CreateAlias</p></td>
     <td><p>Create an alias for a collection</p></td>
   </tr>
   <tr>
     <td><p>DescribeAlias</p></td>
     <td><p>Describe the alias of a collection</p></td>
   </tr>
   <tr>
     <td><p>AlterAlias</p></td>
     <td><p>Change the alias associated with a collection</p></td>
   </tr>
   <tr>
     <td><p>ListAliases</p></td>
     <td><p>View all aliases of a collection</p></td>
   </tr>
   <tr>
     <td><p>DropAlias</p></td>
     <td><p>Drop the alias of a collection</p></td>
   </tr>
   <tr>
     <td><p>GetReplicas</p></td>
     <td><p>Get the replicas of a collection</p></td>
   </tr>
</table>

### Partition\{#partition}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>CreatePartition</p></td>
     <td><p>Create a partition</p></td>
   </tr>
   <tr>
     <td><p>HasPartition</p></td>
     <td><p>Check whether a partition exists</p></td>
   </tr>
   <tr>
     <td><p>LoadPartitions</p></td>
     <td><p>Load one or more partitions</p></td>
   </tr>
   <tr>
     <td><p>ShowPartitions</p></td>
     <td><p>View all partitions in a collection</p></td>
   </tr>
   <tr>
     <td><p>DropPartition</p></td>
     <td><p>Drop a partition</p></td>
   </tr>
   <tr>
     <td><p>ReleasePartitions</p></td>
     <td><p>Release one or more partitions</p></td>
   </tr>
   <tr>
     <td><p>GetPartitionStatistics</p></td>
     <td><p>Obtain the statistics of a partition</p></td>
   </tr>
</table>

### Index\{#index}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>CreateIndex</p></td>
     <td><p>Create an index</p></td>
   </tr>
   <tr>
     <td><p>DescribeIndex</p></td>
     <td><p>View the progress of index building for a collection</p></td>
   </tr>
   <tr>
     <td><p>AlterIndex</p></td>
     <td><p>Update the configuration or parameters of an existing index</p></td>
   </tr>
   <tr>
     <td><p>GetIndexState</p></td>
     <td><p>Update the configuration or parameters of an existing index</p></td>
   </tr>
   <tr>
     <td><p>GetIndexStatistics</p></td>
     <td><p>Retrieve the current state of an index (e.g., <code>building</code>, <code>built</code>, or <code>failed</code>)</p></td>
   </tr>
   <tr>
     <td><p>GetIndexBuildProgress</p></td>
     <td><p>Obtain detailed statistics about an index, such as memory usage or indexed entity count</p></td>
   </tr>
   <tr>
     <td><p>DropIndex</p></td>
     <td><p>Retrieve detailed index data for a specific segment in a collection</p></td>
   </tr>
</table>

### Entity\{#entity}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Insert</p></td>
     <td><p>Insert entities</p></td>
   </tr>
   <tr>
     <td><p>Query</p></td>
     <td><p>Conduct a query</p></td>
   </tr>
   <tr>
     <td><p>Search</p></td>
     <td><p>Conduct a search</p></td>
   </tr>
   <tr>
     <td><p>HybridSearch</p></td>
     <td><p>Conduct a hybrid search</p></td>
   </tr>
   <tr>
     <td><p>Delete</p></td>
     <td><p>Delete entities</p></td>
   </tr>
   <tr>
     <td><p>Upsert</p></td>
     <td><p>Upsert entities</p></td>
   </tr>
</table>

### RBAC\{#rbac}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>SelectRole</p></td>
     <td><p>Retrieve the list of roles available in the current instance</p></td>
   </tr>
   <tr>
     <td><p>CreateRole</p></td>
     <td><p>Define a new role for managing user permissions</p></td>
   </tr>
   <tr>
     <td><p>DropRole</p></td>
     <td><p>Drop a role</p></td>
   </tr>
   <tr>
     <td><p>OperateUserRole</p></td>
     <td><p>Assign a role to a user or remove a role from a user</p></td>
   </tr>
   <tr>
     <td><p>ListPrivilegeGroups</p></td>
     <td><p>View all privilege groups in the current instance</p></td>
   </tr>
   <tr>
     <td><p>OperatePrivilegeV2</p></td>
     <td><p>Add or remove specific privileges from a privilege group</p></td>
   </tr>
   <tr>
     <td><p>SelectGrant</p></td>
     <td><p>Retrieve a list of all privilege grants assigned to a specific role or user</p></td>
   </tr>
   <tr>
     <td><p>CreateCredential</p></td>
     <td><p>Create a new credential (e.g., API key or token) for accessing the system</p></td>
   </tr>
   <tr>
     <td><p>UpdateCredential</p></td>
     <td><p>Update the properties or permissions of an existing credential</p></td>
   </tr>
   <tr>
     <td><p>DeleteCredential</p></td>
     <td><p>Remove a credential from the system</p></td>
   </tr>
   <tr>
     <td><p>ListCredUsers</p></td>
     <td><p>Retrieve a list of all users associated with specific credentials</p></td>
   </tr>
</table>

### Others\{#others}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Authorize</p></td>
     <td><p>Logged only when authorization fails, with the <code>status</code> recorded as <code>Refused</code>.</p></td>
   </tr>
</table>

