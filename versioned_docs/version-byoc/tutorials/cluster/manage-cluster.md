---
title: "Manage Cluster | BYOC"
slug: /manage-cluster
sidebar_key: manage-cluster
sidebar_label: "Manage Cluster"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
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

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Manage Cluster

This guide describes the lifecycle of a cluster so that you can make full use of your Zilliz Cloud console to achieve your goals.

You can perform the following operations on a Dedicated cluster.

## Rename\{#rename}

<Procedures>

1. Navigate to the **Cluster Details** page of your target cluster.

1. Click on **Actions** and then select **Rename**.

    ![XR4QbJtm1o1My7xPp5ecuwnonAf](https://zdoc-images.s3.us-west-2.amazonaws.com/xr4qbjtm1o1my7xpp5ecuwnonaf.png "XR4QbJtm1o1My7xPp5ecuwnonAf")

1. Enter the new name of the cluster and click on **Save**.

    ![KmiAbYLuRonF7jxvYfsczx2cns8](https://zdoc-images.s3.us-west-2.amazonaws.com/kmiabyluronf7jxvyfsczx2cns8.png "KmiAbYLuRonF7jxvYfsczx2cns8")

</Procedures>

## Edit description\{#edit-description}

<Procedures>

1. Navigate to the **Cluster Details** page of your target cluster.

1. Hover on the cluster description and click on the **Edit** **description** icon.

    ![VVDNbEWIcoEiWrxUtYbcfy5snRg](https://zdoc-images.s3.us-west-2.amazonaws.com/vvdnbewicoeiwrxutybcfy5snrg.png "VVDNbEWIcoEiWrxUtYbcfy5snRg")

1. Enter the new description of the cluster and click on **Save**.

    ![ZfXqb3NGOoEm1gxmJGkcAxU2nke](https://zdoc-images.s3.us-west-2.amazonaws.com/zfxqb3ngooem1gxmjgkcaxu2nke.png "ZfXqb3NGOoEm1gxmJGkcAxU2nke")

</Procedures>

## Suspend\{#suspend}

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

- `{API_KEY}`: The credential used to authenticate API requests. Replace the value with your own. Note that API keys authenticate Platform API (Control Plane) requests. For data plan connections, use cluster credentials (`username:password`) instead.

- `{CLUSTER_ID}`: The ID of the Dedicated cluster to suspend.

For details, refer to [Suspend Cluster](/reference/restful/suspend-cluster-v2).

</TabItem>

</Tabs>

Once the suspend operation is successful, a job record will be generated. You can check the progress on the [Jobs](./job-center) page.

## Resume\{#resume}

Please note that during resuming, you cannot perform other actions on the cluster.

You can resume a cluster via the web console or programmatically.

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

Navigate to the **Cluster Details** page of your target cluster and then follow the instruction below to resume your cluster.

<Supademo id="cm9tr2hze0t1j11m7ijth1pr5" title=""  />

<Admonition type="info" icon="📘" title="Notes">

When clicking **Resume** in the **Resume Cluster** dialog box, you will be prompted to check the resource quota for your project. If the resources are sufficient, the dialog box will disappear after the check is complete, otherwise, you can

- Click **Go To Project Resource Settings** to edit resource settings for the project, or

- Click **Back to Last Step** to change your cluster settings.

During the process, some additional resources will be required for rolling; these resources will be released after use.

</Admonition>

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

- `{API_KEY}`: The credential used to authenticate API requests. Replace the value with your own. Note that API keys authenticate Platform API (Control Plane) requests. For data plan connections, use cluster credentials (`username:password`) instead.

- `{CLUSTER_ID}`: The ID of the cluster to resume.

For details, refer to [Resume Cluster](/reference/restful/resume-cluster-v2).

</TabItem>

</Tabs>

Once the resume operation is successful, a job record will be generated. You can check the progress on the [Jobs](./job-center) page.

### Convert to a global cluster\{#convert-to-a-global-cluster}

If you need to convert an existing Dedicated cluster to a [global cluster](./global-cluster-explained), follow the steps below.

<Supademo id="cmm5p53sh3hogdtfhemesjhv0" title=""  />

## Drop\{#drop}

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
#         "prompt": "The cluster has been deleted. If you consider this action to be an error, you have the option to restore the deleted cluster from the recycle bin within a 30-day period."
#     }
# }     
```

In the command above,

- `{API_KEY}`: The credential used to authenticate API requests. Replace the value with your own. Note that API keys authenticate Platform API (Control Plane) requests. For data plan connections, use cluster credentials (`username:password`) instead.

- `{CLUSTER_ID}`: The ID of the Dedicated cluster to drop.

For details, refer to [Drop Cluster](/reference/restful/drop-cluster-v2).

</TabItem>

</Tabs>
