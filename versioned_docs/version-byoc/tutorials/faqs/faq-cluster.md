---
slug: /faq-cluster
beta: null
notebook: null
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 2
---

# FAQ: Cluster

This topic lists the possible issues that you may encounter while you use Zilliz Cloud clusters and the corresponding solution.

## Contents



## FAQs




__What can I do if I receive the error "quota exceeded\[reason=disk quota exceeded, please allocate more resources"?__

When inserting or upserting data, you will receive this error because your data exceeds the cluster CU capacity. To address this issue, you can follow the instructions below.

In such a case, you are advised to  [scale up your cluster](./manage-cluster#manage-and-configure-clusters) by increasing the CU size.

__Can I change the CU type after my dedicated cluster is created?__

Yes. To change the CU type, you need to follow the steps below.

1. Create a new cluster with the desired CU type. Use the [calculator](https://zilliz.com/pricing#calculator) to determine the CU size of this new cluster.

1. Migrate the data from the current cluster to the new cluster you just created. Alternatively, you can also [contact us](https://support.zilliz.com/hc/en-us) to handle the data migration between clusters for you. Please specify your source cluster and target cluster when reaching out to us.

__How can I scale down my cluster CU size?__

If you need to scale down your cluster CU size, please[ submit a request](https://support.zilliz.com/hc/en-us). 

__How can I deal with a connection timeout error when I attempt to connect to Zilliz Cloud?__

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

__Why can’t I connect to the cluster after the cluster is created?__

You can identify the problem by following these steps:

1. Check if the cluster status is RUNNING. You cannot connect to the cluster if the cluster is being created, deleted, or when its IP whitelist is being updated.

1. Check if the IP address of your connection is included in the IP white list.

1. Test the connectivity of the port by running __telnet in01-(uuid).(region).vectordb.zillizcloud.com 19530__. If the issue remains unsolved after all above steps are tried, please[ submit a request](https://support.zilliz.com/hc/en-us).

__What can I do if I cannot connect to Zilliz Cloud with Node.js SDK?__

If you fail to connect to Zilliz Cloud with the Node.js SDK, please try the following:

1. Ensure you installed the latest version of [Node.js SDK](https://github.com/milvus-io/milvus-sdk-node).

1. Ensure you initialize the client correctly.

    ```javascript
    const client = new MilvusClient('https://your-db-address-with-port', true, 'your-db-user', 'your-db-pasword');
    ```

__Will I be charged if I suspend my cluster?__

When your cluster is suspended, you will only be charged for storage, not computing. For more details about storage costs, see [Pricing](https://zilliz.com/pricing).
