---
title: "FAQ: Cluster | BYOC"
slug: /faq-cluster
sidebar_label: "FAQ: Cluster"
beta: FALSE
notebook: FALSE
description: "This topic lists the possible issues that you may encounter while you use Zilliz Cloud clusters and the corresponding solution. | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 2
displayed_sidebar: default

---

# FAQ: Cluster

This topic lists the possible issues that you may encounter while you use Zilliz Cloud clusters and the corresponding solution.

## Contents

- [What can I do if I receive the error "quota exceeded\[reason=disk quota exceeded, please allocate more resources"?](#what-can-i-do-if-i-receive-the-error-quota-exceededreasondisk-quota-exceeded-please-allocate-more-resources)
- [How can I scale down the query CUs of my serving cluster?](#how-can-i-scale-down-the-query-cus-of-my-serving-cluster)
- [How can I deal with a connection timeout error when I attempt to connect to Zilliz Cloud?](#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud)
- [Why can’t I connect to the cluster after the cluster is created?](#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created)
- [What can I do if I cannot connect to Zilliz Cloud with Node.js SDK?](#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk)
- [Will I be charged if I suspend my cluster?](#will-i-be-charged-if-i-suspend-my-cluster)

## FAQs




### What can I do if I receive the error "quota exceeded\[reason=disk quota exceeded, please allocate more resources"?\{#what-can-i-do-if-i-receive-the-error-quota-exceededreasondisk-quota-exceeded-please-allocate-more-resources}

When inserting or upserting data, you will receive this error because your data exceeds the serving cluster CU capacity.  The capacity of a cluster depends on its [cluster type and CU size](./cu-types-explained#assess-capacity).

To address this issue, you can follow the instructions below.

In such a case, you are advised to  [scale up your serving cluster](./auto-scaling) by increasing the query CUs.

### How can I scale down the query CUs of my serving cluster?\{#how-can-i-scale-down-the-query-cus-of-my-serving-cluster}

If you need to scale down your cluster, please[ submit a request](https://support.zilliz.com/hc/en-us).

### How can I deal with a connection timeout error when I attempt to connect to Zilliz Cloud?\{#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud}

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

- VPC security group rules

    If you experience connection timeouts, check your VPC security group rules to ensure the source IP is allowed.

### Why can’t I connect to the cluster after the cluster is created?\{#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created}

You can identify the problem by following these steps:

1. Check if the cluster status is RUNNING. You cannot connect to the cluster if the cluster is being created, deleted, or when its IP whitelist is being updated.

1. Check if the IP address of your connection is included in the IP white list.

1. Check if the port in your cluster endpoint URI is correct. Make sure you copy the endpoint URI from the Zilliz Cloud web console. The following table lists the port of clusters deployed on different cloud providers.

    | **Cloud Provider** | **Port** |
    | --- | --- |
    | AWS | 19530 - 19550 |
    | Google Cloud | 443 |
    | Azure | 19530 |

1. Test the connectivity of the port by running `telnet in01-(uuid).(region).vectordb.zillizcloud.com port-number`.

If the issue persists after all above steps are tried, please[ submit a request](https://support.zilliz.com/hc/en-us).

### What can I do if I cannot connect to Zilliz Cloud with Node.js SDK?\{#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk}

If you fail to connect to Zilliz Cloud with the Node.js SDK, please try the following:

1. Ensure you installed the latest version of [Node.js SDK](https://github.com/milvus-io/milvus-sdk-node).

1. Ensure you initialize the client correctly.

    ```bash
    const client = new MilvusClient('https://your-db-address-with-port', true, 'your-db-user', 'your-db-pasword');
    ```

1. Confirm that your cluster endpoint and token are correct. Ensure to include the protocol `https://` in your cluster endpoint.

1. Check if the port in your cluster endpoint URI is correct. Make sure you copy the endpoint URI from the Zilliz Cloud web console. The following table lists the port of clusters deployed on different cloud providers.

    | **Cloud Provider** | **Port** |
    | --- | --- |
    | AWS | 19530 - 19550 |
    | Google Cloud | 443 |
    | Azure | 19530 |

1. Your IP address must be whitelisted in your cluster settings.

### Will I be charged if I suspend my cluster?\{#will-i-be-charged-if-i-suspend-my-cluster}

When your cluster is suspended, you will only be charged for storage, not computing. For more details about storage costs, see [Pricing](https://zilliz.com/pricing).
