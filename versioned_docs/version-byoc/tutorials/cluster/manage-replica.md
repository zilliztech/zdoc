---
title: "Manage Replica | BYOC"
slug: /manage-replica
sidebar_label: "Manage Replica"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud supports cluster-level replication. Each replica is an exact copy of the resources and data in a cluster. Using replicas can increase query throughput and availability. | BYOC"
type: origin
token: W8Mhwa4faiQqtRkH4t9cdexCnlf
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - manage
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - openai vector db

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Manage Replica

Zilliz Cloud supports cluster-level replication. Each replica is an exact copy of the resources and data in a cluster. Using replicas can increase query throughput and availability.

For users with small datasets experiencing QPS bottlenecks, adding replicas can distribute the query workload, enhancing overall query throughput. However, adding replicas will not increase the cluster capacity because the capacity is only determined by the CU size of each cluster. If you want to increase the cluster capacity, please refer to [Scale Cluster](./scale-cluster).

This guide outlines the procedures of configuring replicas for a cluster in Zilliz Cloud.

## Limits\{#limits}

You can configure replicas for an existing Dedicated cluster as long as the following conditions are met:

- The cluster has 8 CUs or more

- For clusters whose compatible Milvus version is lower than 2.4.13, all collections in the cluster need to be released

Note that the product of the cluster CU size x replica count should not exceed 256.

<Admonition type="caution" icon="🚧" title="Warning">

<p>Updating the replica configurations may lead to slight service jitter. Please exercise caution.</p>

</Admonition>

## Configure replicas manually\{#configure-replicas-manually}

You can adjust the number of replicas for an existing Dedicated cluster either manually on the console or programmatically.

### Via web console\{#via-web-console}

The following demo shows how to configure replicas on the Zilliz Cloud web console.

<Supademo id="cmd2rwczv35ktc4kjyxwa5xwr" title=""  />

<Admonition type="info" icon="📘" title="Notes">

<p>When clicking <strong>Save</strong> in the <strong>Scale Cluster Replicas</strong> dialog box, you will be prompted to check the resource quota for your project. If the resources are sufficient, the dialog box will disappear after the check is complete, otherwise, you can </p>
<ul>
<li><p>Click <strong>Go To Project Resource Settings</strong> to edit resource settings for the project, or</p></li>
<li><p>Click <strong>Back to Last Step</strong> to change your cluster settings.</p></li>
</ul>
<p>During the process, some additional resources will be required for rolling; these resources will be released after use.</p>

</Admonition>

### Via RESTful API\{#via-restful-api}

You can use the RESTful API to manually adjust the number of replicas in a cluster. 

The following example manually sets the cluster replica count to 2. Note that the value for the `replica` parameter should be an integer ranging from 1 to 8. For details, refer to [Modify Cluster Replica](/reference/restful/modify-cluster-replica-v2).

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export CLUSTER_ID="YOUR_CLUSTER_ID"
export TOKEN="YOUR_API_KEY"

curl --request POST \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modifyReplica" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json" \
     --data-raw '{
        "replica": "2"
      }'
```

## Auto-scale replicas\{#auto-scale-replicas}

Currently, you can only auto-scales replicas based on a predefined time schedule via the Zilliz Cloud web console. 

The following demo shows how to enable replica auto-scaling.

<Supademo id="cmd2s33ac35zhc4kjj2zemejj" title=""  />

