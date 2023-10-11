---
slug: /faqs-connection-and-access-control
sidebar_position: 2
---

# Connection and access control

## Contents

- [How can I deal with a connection timeout error when I attempt to connect to Zilliz Cloud?](#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud)
- [Why can’t I connect to the cluster after the cluster is created?](#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created)
- [What can I do if I cannot connect to Zilliz Cloud with Node.js SDK?](#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk)
- [What can I do if I get an authentication error when connecting to Zilliz Cloud?](#what-can-i-do-if-i-get-an-authentication-error-when-connecting-to-zilliz-cloud)
- [What is the authentication code I use when connecting to Zilliz Cloud clusters?](#what-is-the-authentication-code-i-use-when-connecting-to-zilliz-cloud-clusters)

## FAQs


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

### What can I do if I get an authentication error when connecting to Zilliz Cloud?{#what-can-i-do-if-i-get-an-authentication-error-when-connecting-to-zilliz-cloud}

To solve this problem, please follow the steps below.

1. Ensure that you're using the correct username and password for your dedicated cluster or API key for your serverless cluster.

1. If you forget your password, you can create another user with a new password. To create a new user, go to the Zilliz Cloud console. Click on the database you want to connect to. Navigate to the **Users** tab. Click on the **+ User** button as shown in the screenshot below.
    ![faq-authentication-connection](/img/faq-authentication-connection.png)

### What is the authentication code I use when connecting to Zilliz Cloud clusters?{#what-is-the-authentication-code-i-use-when-connecting-to-zilliz-cloud-clusters}

For serverless clusters, please use API key as the authentication method for connection. For dedicated clusters, please use the token in the format of "username:password" as the authentication method for connection.
