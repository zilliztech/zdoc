---
slug: /manage-cluster
beta: FALSE
notebook: FALSE
token: PharwAysCiBzvgkuqqecmNzunQf
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Manage Cluster

This guide describes the lifecycle of a cluster so that you can make full use of your Zilliz Cloud console to achieve your goals.

## Serverless cluster{#serverless-cluster}

After creating a serverless cluster, you will see the following in the console.

![serverless-cluster-lifecycle](/img/serverless-cluster-lifecycle.png)

<Admonition type="info" icon="📘" title="Notes">

<p>You have the option to create one serverless cluster without charge. In addition, you can create up to two collections within the cluster.</p>

</Admonition>

### Connect to cluster{#connect-to-cluster}

In the __Connect__ section, you can find the __Public Endpoint__ and __Token__ used to connect to the cluster.

For details, refer to [Connect to Cluster](./connect-to-cluster).

### Drop cluster{#drop-cluster}

In the __Actions__ drop-down button, select __Drop__ to drop the cluster. Zilliz Cloud drops your cluster only after you confirm this operation in the __Drop Cluster__ dialog box.

In addition to the web UI, you can also make an API request to drop a cluster. For details, refer to [Drop Cluster](/reference/drop-cluster).

### Migrate to dedicated cluster{#migrate-to-dedicated-cluster}

When the used CU capacity of your serverless cluster hits 100%, Zilliz Cloud disables data writing and triggers SDK errors. To restore normal functionality, you can migrate your serverless cluster to a dedicated cluster.

In the __Actions__ drop-down button, select __Migrate to Dedicated Cluster.__

On the page that opens,

- Select the subscription plan and __Target Project__,

- Enter the __Cluster Name__ and password,

- Specify the __Cloud Provider__ and __Cloud Region__, and

- Determine the __CU settings__.

![migrate-to-dedicated](/img/migrate-to-dedicated.png)

After you complete the form and click on __Migrate Cluster__, Zilliz Cloud creates a dedicated cluster based on the specified settings and migrates data from the serverless cluster to the dedicated one.

The dedicated cluster status will switch from __CREATING__ to __RESTORING__, and finally to __RUNNING__. Once this is complete, you can connect to the dedicated cluster and manipulate the restored data.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is available once you set up your payment method.</p>

</Admonition>

## Dedicated cluster{#dedicated-cluster}

### View cluster details{#view-cluster-details}

After setting up your Zilliz Cloud cluster, here’s what you’ll find in each section for cluster details:

![dedicated-cluster-lifecycle](/img/dedicated-cluster-lifecycle.png)

- __Connect__: This section provides the necessary details to begin interacting with your cluster, including the public endpoint for connections, a private link, and a token for secure access.

- __Summary__: This offers a snapshot of your cluster's essentials. You can find the cluster's ID, hosting region, type, and size. Details on the creator, as well as the creation date and time, are also presented.

### Establish connection{#establish-connection}

- __Connect to cluster__

    In the __Connect__ section, you can find the __Public Endpoint__ and __Token__ that are used to connect to the cluster. The token can be an [API key](./manage-api-keys) or a [cluster credential](./cluster-credentials) that consists of a username and password pair.

    For more information, refer to [Connect to Cluster](./connect-to-cluster).

- __Set up private link__

    To establish a more secure connection to your cluster, you can create a private link instead of using the public endpoint provided. Refer to [Set up a Private Link](./setup-a-private-link) for further details.

### Manage collections and data{#manage-collections-and-data}

- __Collections__

    On the __Collections__ tab, you can manage the collections in the cluster. You can create collections, import data into them, load or release them, rename them, and drop them.

    For details on data import, refer to [Data Import](/docs/data-import).

    ![manage-collections](/img/manage-collections.png)

- __Backups__

    In the __Actions__ drop-down button, you can create backups of your cluster by selecting __Create Snapshot__. You can find all snapshots on the __Backups__ tab. For details on backups and restores, refer to [Backup & Restore](/docs/backup-and-restore).

- __Data migrations__

    In the __Actions__ drop-down button, you can create data migration tasks by selecting __Migrate__ to migrate your data from Milvus. For details, refer to [Migrate Between Clusters](./migrate-between-clusters#from-dedicated-to-another-dedicated-cluster).

### Users and access control{#users-and-access-control}

- __Users__

    On the __Users__ tab, you can add users, reset their passwords, and drop them.

    For details, refer to [Manage Cluster Credentials](./cluster-credentials-console).

    ![manage-users](/img/manage-users.png)

    <Admonition type="info" icon="📘" title="Notes">

    <p>You cannot drop <b>db_admin</b>. Zilliz Cloud grants access permissions to all collections in the cluster to any added users.</p>

    </Admonition>

- __Whitelist__

    In the __Summary__ section, click on the IP address in __Network Address__ to add IP address segments to the whitelist. Once an IP address segment, other than a full-zero one (__0.0.0.0/0__), is added to the whitelist, Zilliz Cloud only permits access from IP addresses within the listed IP address segments.

    By default, a full-zero IP address segment is added, indicating that your cluster can be accessed from anywhere.

    For details on how to set up the whitelist, refer to [Set up Whitelist](./setup-whitelist).

### Manage and configure clusters{#manage-and-configure-clusters}

- __Scale-up cluster__

    In the __Summary__ section, click __Scale__ right to the CU __Size__ to open the __Scale Cluster__ dialog box. You can scale up the size allocated to the cluster of the same type in the same cloud region as the original one. You can scale the size of a cluster up to 24 CUs in the dialog box. Contact us if you need a larger CU.

    For details on CU types and how to select an appropriate one, refer to [Select the Right CU](./cu-types-explained).

    In addition to the web UI, you can also make an API request to scale up a cluster. For details, refer to [Modify Cluster](/reference/modify-cluster).

    <Admonition type="caution" icon="🚧" title="Warning">

    <p>Scaling up a cluster may cause several minutes of downtime. Please exercise caution.</p>

    </Admonition>

- __Scale down cluster__

    To scale down the cluster CU size, please create a new cluster with the desired CU size first. 

    Then, migrate the data from your exsisting cluster to the new cluster. For details, refer to [Migrate Between Clusters](./migrate-between-clusters#from-dedicated-to-another-dedicated-cluster).

    <Admonition type="info" icon="📘" title="Notes">

    <p>Please use the <a href="https://zilliz.com/pricing#calculator">CU calculator</a> to estimate the minimum CU size needed for your data. Otherwise, data migration may fail.</p>

    </Admonition>

- __Upgrade service plan__

    For standard users, click __Upgrade__ right to the service __Plan__ in the __Summary__ section to upgrade your plan to __Enterprise__. Zilliz Cloud upgrades your service plan only after you confirm this operation in the __Upgrade to Enterprise Plan__ dialog box.

    For the differences between all the available subscription plans, refer to [Select Service Tiers](./select-zilliz-cloud-service-plans).

- __Suspend & resume cluster__

    In the __Actions__ drop-down button, select __Suspend__ to stop the cluster. Once you confirm this operation in the __Suspend Cluster__ dialog box, the cluster status changes from __RUNNING__ to __SUSPENDING__, during which you cannot perform other actions to the cluster.

    Once the status changes to __SUSPENDED__, you will only be charged for storage. Wisely suspending some of your clusters can save you money.

    |  __Cloud Provider__ |  __Storage Pricing__   |
    | ------------------- | ---------------------- |
    |  AWS storage        |  $0.025 / GB per month |
    |  GCP storage        |  $0.020 / GB per month |

    To resume a suspended cluster, click on __Actions__ and select __Resume__ from the drop-down menu. Upon confirming this action in the __Resume Cluster__ dialog box, the cluster's status will change from __SUSPENDED__ to __RESUMING__, and then to __RUNNING__. At this point, you will be charged fully based on your CU settings and service plan.

    You can also use RESTful APIs to perform these actions. For details, refer to [Suspend Cluster](/reference/suspend-cluster) and [Resume Cluster](/reference/resume-cluster).

- __Drop cluster__

    In the __Actions__ drop-down button, select __Drop__ to drop the cluster. Zilliz Cloud drops your cluster only after you confirm this operation in the __Drop Cluster__ dialog box.

    In addition to the web UI, you can also make an API request to drop a cluster. For details, refer to [Drop Cluster](/reference/drop-cluster).

## Related topics{#related-topics}

- [Connect to Cluster](./connect-to-cluster)

- [Set up a Private Link](./setup-a-private-link)

- [Migrate Between Clusters](./migrate-between-clusters)

- [Select Service Tiers](./select-zilliz-cloud-service-plans)

- [Set up Whitelist](./setup-whitelist)

- [Backup & Restore](./backup-and-restore)

- [Select the Right CU](./cu-types-explained)

