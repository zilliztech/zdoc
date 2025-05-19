---
title: "Manage Cluster | BYOC"
slug: /manage-cluster
sidebar_label: "Manage Cluster"
beta: FALSE
notebook: FALSE
description: "This guide describes the lifecycle of a cluster so that you can make full use of your Zilliz Cloud console to achieve your goals. | BYOC"
type: origin
token: PharwAysCiBzvgkuqqecmNzunQf
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - manage
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# Manage Cluster

This guide describes the lifecycle of a cluster so that you can make full use of your Zilliz Cloud console to achieve your goals.

## Rename cluster{#rename-cluster}

Navigate to the **Cluster Details** page of your target cluster and then follow the instructions below to rename your cluster.

<Supademo id="cm9tp57ye0ri911m7ljrn1yg6" title="Zilliz Cloud - Rename Cluster Demo" />

## Suspend cluster{#suspend-cluster}

For a running Dedicated cluster, you are billed for both CU and storage. To reduce costs, consider suspending the cluster. Only storage charges apply when a Dedicated cluster is suspended.

Please note that during suspension, you cannot perform other actions on the cluster.

You can suspend a Dedicated cluster via the web console or programmatically.

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

Navigate to the **Cluster Details** page of your target cluster and then follow the instructions below to suspend your Dedicated cluster.

<Supademo id="cm9tqgxt30snl11m7twwj7xia" title="Zilliz Cloud - Suspend Cluster Demo" />

</TabItem>

<TabItem value="Bash">

Your request should resemble the following example, where `{API_KEY}` is your API key used for authentication.

The following `POST` request takes a request body and suspends a Dedicated cluster.

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/${CLUSTER_ID}/suspend" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \

# {
#     "code": 0,
#     "data": {
#         "clusterId": "inxx-xxxxxxxxxxxxxxx",
#         "prompt": "Successfully Submitted. The cluster will not incur any computing costs when suspended. You will only be billed for the storage costs during this time."
#     }
# }     
```

In the command above,

- `{API_KEY}`: The credential used to authenticate API requests. Replace the value with your own.

- `{CLUSTER_ID}`: The ID of the Dedicated cluster to suspend.

For details, refer to [Suspend Cluster](/reference/restful/suspend-cluster-v2).

</TabItem>

</Tabs>

## Resume cluster{#resume-cluster}

Free and Serverless clusters are automatically suspended after 7 days of inactivity and can be resumed anytime.

Suspended Dedicated clusters can also be resumed manually when needed.

Please note that during resuming, you cannot perform other actions on the cluster.

You can resume a cluster via the web console or programmatically.

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

Navigate to the **Cluster Details** page of your target cluster and then follow the instruction below to resume your cluster.

<Supademo id="cm9tr2hze0t1j11m7ijth1pr5" title="Zilliz Cloud - Resume Cluster Demo" />

</TabItem>

<TabItem value="Bash">

Your request should resemble the following example, where `{API_KEY}` is your API key used for authentication.

The following `POST` request takes a request body and resumes a cluster.

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/${CLUSTER_ID}/resume" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \

# {
#     "code": 0,
#     "data": {
#         "clusterId": "inxx-xxxxxxxxxxxxxxx",
#         "prompt": "successfully Submitted. Cluster is being resumed, which is expected to takes several minutes. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK."
#     }
# }     
```

In the command above,

- `{API_KEY}`: The credential used to authenticate API requests. Replace the value with your own.

- `{CLUSTER_ID}`: The ID of the cluster to resume.

For details, refer to [Resume Cluster](/reference/restful/resume-cluster-v2).

</TabItem>

</Tabs>

## Drop cluster{#drop-cluster}

When a cluster is no longer needed, you can drop it. You can drop a cluster via the web console or programatically.

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

Navigate to the **Cluster Details** page of your target cluster and then follow the instruction below to drop your cluster.

<Supademo id="cm9trwi5n0txr11m7otr902sk" title="Zilliz Cloud - Drop Cluster Demo" />

</TabItem>

<TabItem value="Bash">

Your request should resemble the following example, where `{API_KEY}` is your API key used for authentication.

The following `DELETE` request takes a request body and drops a cluster.

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/${CLUSTER_ID}/drop" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \

# {
#     "code": 0,
#     "data": {
#         "clusterId": "inxx-xxxxxxxxxxxxxxx",
#         "prompt": "The cluster has been deleted. If you consider this action to be an error, you have the option to restore the deleted cluster from the recycle bin within a 30-day period. Kindly note, this recovery feature does not apply to free clusters."
#     }
# }     
```

In the command above,

- `{API_KEY}`: The credential used to authenticate API requests. Replace the value with your own.

- `{CLUSTER_ID}`: The ID of the Dedicated cluster to drop.

For details, refer to [Drop Cluster](/reference/restful/drop-cluster-v2).

</TabItem>

</Tabs>

