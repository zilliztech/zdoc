---
title: "Manage Cluster | Cloud"
slug: /manage-cluster
sidebar_label: "Manage Cluster"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide describes the lifecycle of a cluster so that you can make full use of your Zilliz Cloud console to achieve your goals. | Cloud"
type: origin
token: PharwAysCiBzvgkuqqecmNzunQf
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - manage
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# Manage Cluster

This guide describes the lifecycle of a cluster so that you can make full use of your Zilliz Cloud console to achieve your goals.

## Rename cluster\{#rename-cluster}

Navigate to the **Cluster Details** page of your target cluster and then follow the instructions below to rename your cluster.

<Supademo id="cm9tp57ye0ri911m7ljrn1yg6" title=""  />

## Suspend cluster\{#suspend-cluster}

For a running Dedicated cluster, you are billed for both CU and storage. To reduce costs, consider suspending the cluster. Only storage charges apply when a Dedicated cluster is suspended.

Please note that during suspension, you cannot perform other actions on the cluster.

You can suspend a cluster via the web console or programmatically.

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

Navigate to the **Cluster Details** page of your target cluster and then follow the instructions below to suspend your Dedicated cluster.

<Supademo id="cm9tqgxt30snl11m7twwj7xia" title=""  />

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

Once the suspend operation is successful, a job record will be generated. You can check the progress on the [Jobs](./job-center) page.

## Resume cluster\{#resume-cluster}

Free clusters are automatically suspended after 7 days of inactivity and can be resumed anytime.

Serverless clusters do not support suspend and resume operations.

Suspended Dedicated clusters can also be resumed manually when needed.

Please note that during resuming, you cannot perform other actions on the cluster.

You can resume a cluster via the web console or programmatically.

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

Navigate to the **Cluster Details** page of your target cluster and then follow the instruction below to resume your cluster.

<Supademo id="cm9tr2hze0t1j11m7ijth1pr5" title=""  />

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

Once the resume operation is successful, a job record will be generated. You can check the progress on the [Jobs](./job-center) page.

## Upgrade deployment option\{#upgrade-deployment-option}

Some of the features are only limited to Dedicated clusters, to use these features, it is recommended to upgrade your cluster deployment option. 

<table>
   <tr>
     <th><p><strong>Deployment Option Upgrade</strong></p></th>
     <th><p><strong>Notes</strong></p></th>
   </tr>
   <tr>
     <td><p>Free to Serverless</p></td>
     <td><p>Your Free cluster will be upgraded to the Serverless deployment option. Once the cluster is upgraded, you cannot downgrade it.</p></td>
   </tr>
   <tr>
     <td><p>Free to Dedicated</p></td>
     <td><p>A new Dedicated cluster will be created, and data from your existing Free cluster will be automatically migrated. The Free cluster will remain intact.</p><p>Remember to update the cluster endpoint in your application code.</p></td>
   </tr>
   <tr>
     <td><p>Serverless to Dedicated</p></td>
     <td><p>A new Dedicated cluster will be created, and data from your existing Serverless cluster will be automatically migrated. The Serverless cluster will remain intact.</p><p>Remember to update the cluster endpoint in your application code.</p></td>
   </tr>
</table>

The following demo illustrates how to upgrade the deployment option of a cluster, using the Free to Dedicated upgrade as an example.

<Supademo id="cmfnfgviq0il71d3n2up3lci1?utm_source=link" title=""  />

## Upgrade cluster for preview features\{#upgrade-cluster-for-preview-features}

To try the latest preview features, you need to upgrade the compatible Milvus version of your dedicated cluster.

![upgrade-to-preview-version](/img/upgrade-to-preview-version.png "upgrade-to-preview-version")

## Drop cluster\{#drop-cluster}

When a cluster is no longer needed, you can drop it. You can drop a cluster via the web console or programatically.

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

Navigate to the **Cluster Details** page of your target cluster and then follow the instruction below to drop your cluster.

<Supademo id="cm9trwi5n0txr11m7otr902sk" title=""  />

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

