---
displayed_sidbar: restfulSidebar
slug: /restful
beta: FALSE
notebook: FALSE
sidebar_position: 0
---

import Admonition from '@theme/Admonition';


# RESTful API Reference

Zilliz Cloud offers RESTful APIs for you to manipulate your clusters, collections, and data stored in them. Before you dive in, there are several things that are worth noting:

## Control Plane & Data Plane

Zilliz Cloud uses the control plane to centralize the management of clusters and related resources, while the data plane is responsible for data storage and processing within a specific collection. 

The control plane provides APIs for **Cloud Meta**, **Cluster Operations**, **Import Operations**, and **Pipeline Operations**. The data plane provides APIs for **Collection Operations** and **Vector Operations**.

- When using the Control Plane APIs, you need to use **a valid API key** to authenticate your requests.

    The following is an example of listing all the available cloud providers.

    ```shell
    export CLOUD_REGION="gcp-us-west1"
    export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

    curl --request GET \
        --url "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/clouds" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "accept: application/json" \
        --header "content-type: application/json"
    ```

- When using the Data Plane APIs, you can use **either a valid API key or a valid pair of cluster username and password** to authenticate your requests.

    The following is an example of listing all the available collections in the specified cluster.

    ```shell
    export CLOUD_REGION="gcp-us-west1"
    export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"
    export CLUSTER_ENDPOINT="https://${CLUSTER_ID}.api.${CLOUD_REGION}.zillizcloud.com"
    export CLUSTER_USER="username"
    export CLUSTER_PASSWORD="password"

    curl --request GET \
        --url "${CLUSTER_ENDPOINT}/v1/vector/collections" \
        --header "Authorization: Bearer ${CLUSTER_USER}:${CLUSTER_PASSWORD}" \
        --header "accept: application/json" \
        --header "content-type: application/json"
    ```

## API Eendpoint Versioning

For all Zilliz Cloud **clusters compatible with Milvus 2.4 and above**, you should use the **v2 endpoints** for all data plane APIs.

For details, refer to the reference pages below:

import DocCardList from '@theme/DocCardList';

<DocCardList />