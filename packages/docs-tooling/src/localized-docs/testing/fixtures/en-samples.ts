export const DELETE_ENTITIES_EN_MDX = `---
title: "Delete Entities | Cloud"
slug: /delete-entities
sidebar_label: "Delete"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "You can delete the entities that are no longer needed by filtering conditions or their primary keys. | Cloud"
type: origin
token: RhKcwNACpi3WihkTzo8cr4BCnee
sidebar_position: 4
displayed_sidebar: default
custom_edit_url: null
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Delete Entities

You can delete the entities that are no longer needed by filtering conditions or their primary keys.

## Delete Entities by Filtering Conditions\\{#delete-entities-by-filtering-conditions}

Click <UI>Delete</UI> in the console to remove entities.

<NextChannel action="include">

Before submitting a delete request, verify the filter expression in <UI>Query Explorer</UI>.

</NextChannel>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

\`\`\`python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

res = client.delete(
    collection_name="quick_setup",
    # next-channel-next-line
    filter="color in ['red_7025', 'purple_4976']"
)
\`\`\`

</TabItem>
<TabItem value='java'>

\`\`\`java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());
\`\`\`

</TabItem>
</Tabs>
`

export const GET_AND_SCALAR_QUERY_EN_MDX = `---
title: "Query | Cloud"
slug: /get-and-scalar-query
sidebar_label: "Query"
beta: PUBLIC
added_since: 2.4.x
last_modified: 2.5.x
deprecate_since: FALSE
notebook: FALSE
description: "In addition to ANN searches, Zilliz Cloud also supports metadata filtering through queries. | BYOC"
type: origin
token: R7F7wY8pCiJ5Q4kbntxcMsE6nLf
sidebar_position: 9
channel: next
sidebar_custom_props:
  channel: next
displayed_sidebar: default
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Supademo from '@site/src/components/Supademo';

# Query

In addition to ANN searches, Zilliz Cloud also supports metadata filtering through queries.

<Admonition type="info" icon="📘" title="Notes">

For details, refer to [Alter Collection Schema](./add-fields-to-an-existing-collection).

</Admonition>

## Overview\\{#overview}

<table>
   <tr>
     <th></th>
     <th><p>Get</p></th>
     <th><p>Query</p></th>
   </tr>
   <tr>
     <td><p>Applicable scenarios</p></td>
     <td><p>To find entities that hold the specified primary keys.</p></td>
     <td><p>To find entities that meet custom filtering conditions.</p></td>
   </tr>
</table>

\`\`\`tsx
import Tabs from '@theme/Tabs';
// Example import inside a fenced code block that must remain untouched.
\`\`\`
`

export const VALID_GROUP_VARIABLES_JSON = JSON.stringify(
  {
    product_name: 'Zilliz Cloud',
    connection_target: '您的集群',
    example_endpoint: 'https://in01-example.api.gcp-us-west1.zillizcloud.com.cn',
    example_token: 'YOUR_ZH_CLUSTER_TOKEN',
  },
  null,
  2,
)
