---
title: "Free & Serverless Clusters | Cloud"
slug: /free-and-serverless-clusters
sidebar_label: "Free & Serverless Clusters"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Free and Serverless clusters are serving clusters. Use this page for the basic lifecycle create, connect, and manage. | Cloud"
type: origin
token: EO58wVRLpiTBXQkceRjccN28nrh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Free & Serverless Clusters

Free and Serverless clusters are serving clusters. Use this page for the basic lifecycle: create, connect, and manage.

<Admonition type="info" icon="📘" title="Note">

For Dedicated clusters, see Dedicated Cluster. For on-demand search through a project endpoint, see [Connect for On-Demand Search](./connect-for-on-demand-search).

</Admonition>

## Create\{#create}

Before creating a Free or Serverless cluster, make sure you have registered with Zilliz Cloud and have ownership of the organization or project where the cluster will be created.

<Admonition type="info" icon="📘" title="Note">

Each organization can have only one Free cluster. For additional serving clusters, use Serverless or Dedicated.

</Admonition>

You can create a Free or Serverless cluster from the Zilliz Cloud console. When the cluster status changes to **Running**, the cluster is ready. Save the cluster credentials shown during creation because the password is shown only once.

You can also create clusters through the RESTful API.

### Create a Free cluster\{#create-a-free-cluster}

````plaintext
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/createFree" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     --data-raw '{
        "clusterName": "cluster-free",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "gcp-us-west1"
    }'
```

### Create a Serverless cluster\{#create-a-serverless-cluster}

```plaintext
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/createServerless" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     --data-raw '{
        "clusterName": "cluster-serverless",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "gcp-us-west1"
    }'
```

| Parameter | Description |
| --- | --- |
| `API_KEY` | API key used to authenticate control-plane API requests. |
| `clusterName` | Name of the cluster to create. |
| `projectId` | ID of the project where the cluster will be created. |
| `regionId` | ID of the cloud region where the cluster will be created. |

## Connect\{#connect}

Free and Serverless clusters use the following serving endpoint pattern:

```plaintext
https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com
```

Copy the cluster public endpoint from the **Connect** card on the cluster details page. Use either an API key with access to the cluster or a cluster credential in `username:password` format as the token.

```plaintext
from pymilvus import MilvusClient

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN,
)
```

```plaintext
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

ConnectConfig connectConfig = ConnectConfig.builder()
    .uri(CLUSTER_ENDPOINT)
    .token(TOKEN)
    .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

```plaintext
import "github.com/milvus-io/milvus/client/v2/milvusclient"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
```

```plaintext
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";

const client = new MilvusClient({ address, token });
```

```plaintext
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{"dbName": "default"}'
```

To verify the connection, run a lightweight operation such as listing collections.

```plaintext
collections = client.list_collections()
print(collections)
```

## Manage\{#manage}

You can manage Free and Serverless clusters from the cluster details page.

| Operation | Free cluster | Serverless cluster |
| --- | --- | --- |
| Rename | Supported. | Supported. |
| Resume | Free clusters are automatically suspended after 7 consecutive days of inactivity and can be resumed at any time. | Serverless clusters do not support suspend and resume operations. |
| Upgrade deployment option | Can be upgraded to Serverless or Dedicated. Free to Dedicated creates a new Dedicated cluster and migrates data from the Free cluster. | Can be upgraded to Dedicated. Serverless to Dedicated creates a new Dedicated cluster and migrates data from the Serverless cluster. |
| Drop | Supported. Free clusters cannot be restored from the recycle bin after deletion. | Supported. |

When an upgrade creates a new Dedicated cluster, remember to update the cluster endpoint in your application code.

## Drop\{#drop}

To drop a cluster programmatically, call the drop cluster API with the cluster ID.

```plaintext
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/${CLUSTER_ID}/drop" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json"
````
