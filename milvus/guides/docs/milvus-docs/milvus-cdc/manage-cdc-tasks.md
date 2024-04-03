---
slug: /manage-cdc-tasks
beta: FALSE
notebook: FALSE
type: origin
token: TXD6wJ5zoijjvsk31oYcYKe8ned
sidebar_position: 3
---

# Manage CDC Tasks

A Capture Data Change (CDC) task enables the synchronization of data from a source Milvus instance to a target Milvus instance. It monitors operation logs from the source and replicates data changes such as insertions, deletions, and index operations to the target in real-time. This facilitates real-time disaster recovery or active-active load balancing between Milvus deployments.

This guide covers how to manage CDC tasks, including creation, pausing, resuming, retrieving details, listing, and deletion through HTTP requests.

## Create a task

Creating a CDC task allows data change operations in the source Milvus to be synced to the target Milvus.

To create a CDC task:
Replace __localhost__ with the IP address of the target Milvus server.

__Parameters__:

- __milvus_connect_param__: Connection parameters of the target Milvus.

    - __host__: Hostname or IP address of the Milvus server.

    - __port__: Port number the Milvus server listens on.

    - __username__: Username for authenticating with the Milvus server.

    - __password__: Password for authenticating with the Milvus server.

    - __enable_tls__: Whether to use TLS/SSL encryption for the connection.

    - __connect_timeout__: Timeout period in seconds for establishing the connection.

- __collection_infos__: Collections to synchronize. Currently, only an asterisk (__*__) is supported, as Milvus-CDC synchronizes at the cluster level, not individual collections.

- __rpc_channel_info__: RPC channel name for synchronization, constructed by concatenating the values of __common.chanNamePrefix.cluster__ and __common.chanNamePrefix.replicateMsg__ from the source Milvus configuration, separated by a hyphen (__-__).

Expected response:

```json
{
  "code": 200,
  "data": {
    "task_id":"xxxx"
  }
}
```

## List tasks

To list all created CDC tasks:
Replace __localhost__ with the IP address of the target Milvus server.

Expected response:

```json
{
  "code": 200,
  "data": {
    "tasks": [
      {
        "task_id": "xxxxx",
        "milvus_connect_param": {
          "host": "localhost",
          "port": 19530,
          "connect_timeout": 10
        },
        "collection_infos": [
          {
            "name": "*"
          }
        ],
        "state": "Running"
      }
    ]
  }
}
```

## Pause a task

To pause a CDC task:
Replace __localhost__ with the IP address of the target Milvus server.

__Parameters__:

- __task_id__: ID of the CDC task to pause.

Expected response:
## Resume a task

To resume a paused CDC task:
Replace __localhost__ with the IP address of the target Milvus server.

__Parameters__:

- __task_id__: ID of the CDC task to resume.

Expected response:
## Retrieve task details

To retrieve the details of a specific CDC task:
Replace __localhost__ with the IP address of the target Milvus server.

__Parameters__:

- __task_id__: ID of the CDC task to query.

Expected response:
## Delete a task

To delete a CDC task:
Replace __localhost__ with the IP address of the target Milvus server.

__Parameters__:

- __task_id__: ID of the CDC task to delete.

Expected response:

```json
{
  "code": 200,
  "data": {}
}
```

