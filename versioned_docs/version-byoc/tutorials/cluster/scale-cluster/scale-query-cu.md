---
title: "Scale Query CU | BYOC"
slug: /scale-query-cu
sidebar_key: scale-query-cu
sidebar_label: "Scale Query CU"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "As your workload grows and more data is written, the serving cluster may reach its capacity limit. In such cases, read operations will continue to function, but new write operations may fail. | BYOC"
type: origin
token: ExUFwDY1siCa2Bkp4incCvxFnlh
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - scale
  - manage
  - query cu

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Scale Query CU

As your workload grows and more data is written, the serving cluster may reach its capacity limit. In such cases, read operations will continue to function, but new write operations may fail.

To proactively manage this, you can monitor **Query** **CU Capacity** on the [metrics](./metrics-alerts-reference) page to determine when query CU scaling is needed. Based on your business needs and patterns, you can increase the number of query CUs to expand cluster capacity or reduce it when demand decreases to save on costs.

Please note that for serving clusters with 1 - 12 CUs, you can directly scale query CU. For serving clusters with more than 12 CUs, please increase [replicas](./manage-replica).

This guide explains how to resize a serving cluster to suit your changing workload.

## Considerations\{#considerations}

- **Resource Limitations**: 

    - **Scale up**

        - Dedicated (Standard) clusters: Up to 32 CUs

            Dedicated (Enterprise) clusters: Up to 1,024 CUs

        - The product of **Number of Query CU** × **Replica count** must not exceed 10,240

        For larger query CU, [contact sales](http://zilliz.com/contact-sales).

    - **Scale down**

        - Clusters with replicas cannot scale down to less than 12 CUs

        - A scale-down request only succeeds if:

            - Current data volume < 80% of the CU capacity of the new CU size.

            - Current number of collections and partitions < the [maximum number of collections and partitions](./limits#collections) allowed in the new CU size.

- **During Scaling**: The cluster status changes to “Modifying,” during which no operations can be performed. If multiple scaling tasks are triggered, they will be processed sequentially based on trigger timestamp. Completion time depends on data volume.

- **Performance Impact**: Scaling may cause slight service jitter.

- **Backup Limitations**: Dynamic and scheduled scaling settings are not included in [backups](./create-snapshot). After restoring a cluster, reconfigure these settings manually.

## Manual scaling\{#manual-scaling}

You can manually scale your cluster up or down via the Zilliz Cloud console or RESTful API.

The following demo shows how to manually scale up and down a cluster on the Zilliz Cloud web console.

<Supademo id="cmd2r0jc634jlc4kju69onxyh?utm_source=link" title=""  />

<Admonition type="info" icon="📘" title="Notes">

<p>When clicking <strong>Save</strong> in the <strong>Scale Query Node CU</strong> dialog box, you will be prompted to check the resource quota for your project. If the resources are sufficient, the dialog box will disappear after the check is complete, otherwise, you can </p>
<ul>
<li><p>Click <strong>Go To Project Resource Settings</strong> to edit resource settings for the project, or</p></li>
<li><p>Click <strong>Back to Last Step</strong> to change your cluster settings.</p></li>
</ul>
<p>During the process, some additional resources will be required for rolling; these resources will be released after use.</p>

</Admonition>

In addition, you can use the RESTful API to manually scale query CU.

The following example scales an existing cluster to 2 CU. For details, see [Modify Cluster](/reference/restful/modify-cluster-v2).

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "cuSize": 2
}'
```

