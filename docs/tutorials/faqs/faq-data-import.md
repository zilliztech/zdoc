---
slug: /faq-data-import
beta: FALSE
notebook: FALSE
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 4

---

# FAQ: Data Import

This topic lists the possible issues that you may encounter while you import data on Zilliz Cloud and the corresponding solution.

## Contents

- [Can I bulk insert data into the Zilliz Cloud vector databases?](#can-i-bulk-insert-data-into-the-zilliz-cloud-vector-databases)
- [What can I do if I receive `ECONNRESET` errors when importing data to or querying Zilliz Cloud clusters with Node.js SDK?](#what-can-i-do-if-i-receive-econnreset-errors-when-importing-data-to-or-querying-zilliz-cloud-clusters-with-nodejs-sdk)

## FAQs




### Can I bulk insert data into the Zilliz Cloud vector databases?{#can-i-bulk-insert-data-into-the-zilliz-cloud-vector-databases}

Yes. Please refer to [Data Import](./data-import) for more information.

### What can I do if I receive `ECONNRESET` errors when importing data to or querying Zilliz Cloud clusters with Node.js SDK?{#what-can-i-do-if-i-receive-econnreset-errors-when-importing-data-to-or-querying-zilliz-cloud-clusters-with-nodejs-sdk}

To solve this problem, please follow the steps below.

1. Upgrade to the latest version of Milvus NodeJS SDK which supports **channelOptions**.

1. Add channelOptions manually.

    ```javascript
    const channelOptions: ChannelOptions = {
    
    // Send keepalive pings every 10 seconds, default is 2 hours.
    
    'grpc.keepalive_time_ms': 10 * 1000,
    
    // Keepalive ping timeout after 5 seconds, default is 20 seconds.
    
    'grpc.keepalive_timeout_ms': 5 * 1000,
    
    // Allow keepalive pings when there are no gRPC calls.
    
    'grpc.keepalive_permit_without_calls': 1,
    
    };
    ```

1. Initialize the client with the channelOptions.

    ```javascript
    import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';
    
    new MilvusClient({
      address: 'your-zilliz-cloud-address',
      ssl: true,
      username: 'username',
      password: 'your-pass',
      channelOptions: channel options
    })
    ```
