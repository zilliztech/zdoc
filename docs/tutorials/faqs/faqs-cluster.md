---
slug: /faqs-cluster
beta: null
notebook: null
sidebar_position: 2
---

# Cluster

This topic lists the possible issues that you may encounter while you use Zilliz Cloud clusters and the corresponding solution.

## Contents

- [Can I change the CU type after my dedicated cluster is created?](#can-i-change-the-cu-type-after-my-dedicated-cluster-is-created)
- [Can I change the cloud region of my cluster after it is created?](#can-i-change-the-cloud-region-of-my-cluster-after-it-is-created)
- [How can I scale down my cluster CU size?](#how-can-i-scale-down-my-cluster-cu-size)
- [Can I deploy a serverless cluster on AWS?](#can-i-deploy-a-serverless-cluster-on-aws)
- [Do serverless clusters in the starter plan support customized schema?](#do-serverless-clusters-in-the-starter-plan-support-customized-schema)
- [How can I deal with a connection timeout error when I attempt to connect to Zilliz Cloud?](#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud)
- [Why can’t I connect to the cluster after the cluster is created?](#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created)
- [What can I do if I cannot connect to Zilliz Cloud with Node.js SDK?](#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk)
- [What happens to my inactive clusters?](#what-happens-to-my-inactive-clusters)
- [Will I be charged if I suspend my cluster?](#will-i-be-charged-if-i-suspend-my-cluster)

## FAQs


This topic lists the possible issues that you may encounter while you use Zilliz Cloud clusters and the corresponding solution.

### Can I change the CU type after my dedicated cluster is created?{#can-i-change-the-cu-type-after-my-dedicated-cluster-is-created}

No. You cannot directly modify the CU type once the cluster is created. However, if you want to change the cluster type, please try the workaround plan.

1. Create a new cluster with your desired cluster type.

1. [ Submit a request](https://support.zilliz.com/hc/en-us) so that we can handle the data migration between clusters for you. Please specify your source cluster and target cluster when reaching out to us.

### Can I change the cloud region of my cluster after it is created?{#can-i-change-the-cloud-region-of-my-cluster-after-it-is-created}

No. Currently, you cannot directly change the cloud region of the cluster once it is created. However, you can create a new cluster with the desired cloud region and[ submit a request](https://support.zilliz.com/hc/en-us) to us so that we can manually migrate the data to the new cluster for you.

### How can I scale down my cluster CU size?{#how-can-i-scale-down-my-cluster-cu-size}

If you need to scale down your cluster CU size, please[ submit a request](https://support.zilliz.com/hc/en-us) . We will scale down the cluster for you in less than 8 hours.

### Can I deploy a serverless cluster on AWS?{#can-i-deploy-a-serverless-cluster-on-aws}

No. Currently, Zilliz Cloud only supports deploying a serverless cluster on GCP. If you need to deploy a cluster on AWS, please choose the Standard or Enterprise plan.

### Do serverless clusters in the starter plan support customized schema?{#do-serverless-clusters-in-the-starter-plan-support-customized-schema}

No. The free serverless clusters do not support customized schema. However, dynamic schema is enabled by default, meaning you can always insert data with fields that are not pre-defined. Refer to this [documentation](https://docs.zilliz.com/docs/enable-dynamic-schema) for more details about dynamic schema.

### How can I deal with a connection timeout error when I attempt to connect to Zilliz Cloud?{#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud}

To establish a connection to a Zilliz Cloud cluster, you will need to provide several relevant parameters. For instance, the PyMilvus SDK's connect method can be used as shown below:

```python
from pymilvus import Connections

conn = Connections.connect(
        alias=ALIAS,
        host=HOST,
        port=PORT,
        user=USER,
        password=PASSWORD,
        timeout=30,
        secure=True
)
```

A connection timeout error may occur in the following scenarios:

- Poor network conditions
    To address poor network conditions, it is recommended to increase the timeout duration for the connect operation. In the above code, `timeout` is set to `30` seconds, meaning that the connect operation will time out if no response is received within 30 seconds after the request has been sent.

- Incorrect connection parameters
    Zilliz Cloud clusters come with TLS enabled, so to connect successfully to your cluster, ensure that you include `secure` in the connect parameters and set it to `true` as shown in the above example. Failure to do so may result in a connection failure and a timeout error prompt.

- Non-whitelisted local IP addresses
    If you are attempting to connect to your cluster, you also need to ensure that you have turned off any VPN/Proxy connections, obtained your public IP address (private IP addresses simply do not work), and added that IP address to the whitelist for the clusters you want to connect to.

### Why can’t I connect to the cluster after the cluster is created?{#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created}

You can identify the problem by following these steps:

1. Check if the cluster status is RUNNING. You cannot connect to the cluster if the cluster is being created, deleted, or when its IP whitelist is being updated.

1. Check if the IP address of your connection is included in the IP white list.

1. Test the connectivity of the port by running **telnet in01-(uuid).(region).vectordb.zillizcloud.com 19530**. If the issue remains unsolved after all above steps are tried, please[ submit a request](https://support.zilliz.com/hc/en-us).

### What can I do if I cannot connect to Zilliz Cloud with Node.js SDK?{#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk}

If you fail to connect to Zilliz Cloud with the Node.js SDK, please try the following:

1. Ensure you installed the latest version of [Node.js SDK](https://github.com/milvus-io/milvus-sdk-node).

1. Ensure you initialize the client correctly.
    ```javascript
    const client = new MilvusClient('https://your-db-address-with-port', true, 'your-db-user', 'your-db-pasword');
    ```

### What happens to my inactive clusters?{#what-happens-to-my-inactive-clusters}

Your serverless clusters are automatically suspended with notice after 7 days of inactivity. You can always resume the clusters when necessary. However, your dedicated clusters will not be automatically suspended due to prolonged inactivity. To save costs, we advise you to manually suspend your dedicated clusters.

### Will I be charged if I suspend my cluster?{#will-i-be-charged-if-i-suspend-my-cluster}

When your cluster is suspended, you will only be charged for storage, not computing. For more details about storage costs, see [Pricing](https://zilliz.com/pricing).
